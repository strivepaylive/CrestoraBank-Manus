import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from './routers';
import { getDb } from './db';
import { registrations, loginSessions } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from './passwordUtils';
import { isSessionRevoked, bustRevocationCache } from './sessionRevocation';
import { createContext } from './_core/context';
import { sdk } from './_core/sdk';
import { upsertUser } from './db';

let regId: number;
const USERNAME = `sess_test_${Date.now()}`;

function makeCtx(openId: string, ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Safari/604.1') {
  return {
    user: { id: 1, openId, name: 'Sess Test', email: null, role: 'user' as const },
    req: { headers: { 'user-agent': ua }, socket: { remoteAddress: '203.0.113.7' } } as any,
    res: { cookie: () => {}, clearCookie: () => {} } as any,
  };
}

describe('device sessions', () => {
  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error('db unavailable');
    const hashed = await hashPassword('SessTest123!');
    await db.insert(registrations).values({
      firstName: 'Sess', lastName: 'Test', username: USERNAME,
      contactMethod: 'email', email: `${USERNAME}@example.com`,
      password: hashed, status: 'approved', accountNumber: `99${Date.now()}`.slice(0, 10),
      balance: '100.00',
    });
    const rows = await db.select().from(registrations).where(eq(registrations.username, USERNAME)).limit(1);
    regId = rows[0].id;
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;
    await db.delete(loginSessions).where(eq(loginSessions.registrationId, regId));
    await db.delete(registrations).where(eq(registrations.id, regId));
  });

  it('records a session on login and lists it with device label', async () => {
    const caller = appRouter.createCaller(makeCtx(`reg_${regId}`) as any);
    await caller.login.authenticate({ username: USERNAME, password: 'SessTest123!' });

    const db = await getDb();
    const rows = await db!.select().from(loginSessions).where(eq(loginSessions.registrationId, regId));
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].deviceLabel).toContain('iOS');

    const sessions = await caller.security.sessions();
    expect(sessions.length).toBeGreaterThan(0);
    expect(sessions[0].isCurrent).toBe(true);
  });

  it('revokes a session so it disappears from the list', async () => {
    const caller = appRouter.createCaller(makeCtx(`reg_${regId}`) as any);
    const sessions = await caller.security.sessions();
    const target = sessions[0];
    const db = await getDb();
    const rowBefore = await db!.select().from(loginSessions).where(eq(loginSessions.id, target.id)).limit(1);
    const key = rowBefore[0].sessionKey!;
    expect(key).toBeTruthy();
    // Before revocation, the session key is valid
    expect(await isSessionRevoked(`reg_${regId}`, key)).toBe(false);
    bustRevocationCache(key);
    const res = await caller.security.revokeSession({ sessionId: target.id });
    expect(res.success).toBe(true);
    const after = await caller.security.sessions();
    expect(after.find(s => s.id === target.id)).toBeUndefined();
    // After revocation, requests carrying this session key are rejected
    expect(await isSessionRevoked(`reg_${regId}`, key)).toBe(true);
  });

  it('end-to-end: a revoked JWT can no longer access protected procedures', async () => {
    const db = await getDb();
    const openId = `reg_${regId}`;
    await upsertUser({ openId, name: 'Sess Test', role: 'user' });

    // Simulate a login: create a session key, embed it in a real signed JWT, record the row
    const sessionKey = `sk_e2e_${Date.now().toString(36)}`;
    const token = await sdk.createSessionToken(openId, { name: 'Sess Test', sessionKey });
    await db!.insert(loginSessions).values({
      registrationId: regId, sessionKey, deviceLabel: 'E2E Test', userAgent: 'vitest', ipAddress: '127.0.0.1',
    });

    const makeHttpCtx = () => createContext({
      req: { headers: { cookie: `app_session_id=${token}`, 'user-agent': 'vitest' }, socket: { remoteAddress: '127.0.0.1' } },
      res: { cookie: () => {}, clearCookie: () => {} },
    } as any);

    // Before revocation: context resolves the user and protected calls work
    const ctxBefore = await makeHttpCtx();
    expect(ctxBefore.user).not.toBeNull();
    const callerBefore = appRouter.createCaller(ctxBefore as any);
    const sessionsBefore = await callerBefore.security.sessions();
    expect(sessionsBefore.some(s => s.deviceLabel === 'E2E Test')).toBe(true);

    // Revoke the session directly (same effect as revokeSession) and bust cache
    await db!.update(loginSessions).set({ revoked: true }).where(eq(loginSessions.sessionKey, sessionKey));
    bustRevocationCache(sessionKey);

    // After revocation: the very same JWT is rejected — user is null, protected calls throw
    const ctxAfter = await makeHttpCtx();
    expect(ctxAfter.user).toBeNull();
    const callerAfter = appRouter.createCaller(ctxAfter as any);
    await expect(callerAfter.security.sessions()).rejects.toThrow();
  });
});
