import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { getDb } from './db';
import { registrations } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { appRouter } from './routers';
import { hashPassword } from './passwordUtils';

function makeCtx() {
  const res = { cookie: () => {}, clearCookie: () => {} };
  const req = { headers: {}, socket: { remoteAddress: '127.0.0.1' } };
  return { user: null, req, res } as any;
}

let regId: number;
const USERNAME = `RobustLogin${Date.now()}`;

beforeAll(async () => {
  const db = await getDb();
  if (!db) throw new Error('DB unavailable');
  const pwd = await hashPassword('CorrectHorse1!');
  await db.insert(registrations).values({
    firstName: 'Robust',
    lastName: 'Login',
    username: USERNAME,
    email: 'delivered@resend.dev',
    accountNumber: `55${Date.now().toString().slice(-8)}`,
    balance: '0.00',
    status: 'approved',
    password: pwd,
  });
  const rows = await db.select().from(registrations).where(eq(registrations.username, USERNAME));
  regId = rows[0].id;
});

afterAll(async () => {
  const db = await getDb();
  if (db && regId) await db.delete(registrations).where(eq(registrations.id, regId));
});

describe('Robust login', () => {
  it('logs in with exact username', async () => {
    const caller = appRouter.createCaller(makeCtx());
    const res = await caller.login.authenticate({ username: USERNAME, password: 'CorrectHorse1!' });
    expect(res.success).toBe(true);
  }, 30000);

  it('logs in with different casing', async () => {
    const caller = appRouter.createCaller(makeCtx());
    const res = await caller.login.authenticate({ username: USERNAME.toLowerCase(), password: 'CorrectHorse1!' });
    expect(res.success).toBe(true);
  }, 30000);

  it('logs in with surrounding whitespace', async () => {
    const caller = appRouter.createCaller(makeCtx());
    const res = await caller.login.authenticate({ username: `  ${USERNAME}  `, password: 'CorrectHorse1!' });
    expect(res.success).toBe(true);
  }, 30000);

  it('still rejects a wrong password', async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.login.authenticate({ username: USERNAME, password: 'WrongPass1!' }))
      .rejects.toThrow();
  }, 30000);
});
