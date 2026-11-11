import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { getDb } from './db';
import { registrations, transactions, cards, notifications, userNotifications } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { appRouter } from './routers';

function makeCtx(regId: number) {
  return {
    user: { openId: `reg_${regId}`, name: 'Test', role: 'user' },
    req: { headers: {} } as any,
    res: {} as any,
  } as any;
}

let regId: number;
const uname = `cardfeetest_${Date.now()}`;

beforeAll(async () => {
  const db = await getDb();
  if (!db) throw new Error('DB unavailable');
  await db.insert(registrations).values({
    firstName: 'CardFee',
    lastName: 'Tester',
    username: uname,
    email: 'delivered@resend.dev',
    accountNumber: `98${Date.now().toString().slice(-8)}`,
    balance: '100.00',
    status: 'approved',
    preferredLanguage: 'es',
  });
  const rows = await db.select().from(registrations).where(eq(registrations.username, uname));
  regId = rows[0].id;
});

afterAll(async () => {
  const db = await getDb();
  if (db && regId) {
    await db.delete(transactions).where(eq(transactions.registrationId, regId));
    await db.delete(cards).where(eq(cards.registrationId, regId));
    await db.delete(userNotifications).where(eq(userNotifications.registrationId, regId));
    await db.delete(notifications).where(eq(notifications.relatedUserId, regId));
    await db.delete(registrations).where(eq(registrations.id, regId));
  }
});

describe('Card issuance fee', () => {
  it('debits $25 fee, records completed withdrawal transaction, and returns new balance', async () => {
    const caller = appRouter.createCaller(makeCtx(regId));
    const res = await caller.cards.request({ type: 'debit' });
    expect(res.success).toBe(true);
    expect(res.feeCharged).toBe('25.00');
    expect(res.newBalance).toBe('75.00');

    const db = await getDb();
    const regRows = await db!.select().from(registrations).where(eq(registrations.id, regId));
    expect(regRows[0].balance).toBe('75.00');

    const txRows = await db!.select().from(transactions).where(eq(transactions.registrationId, regId));
    const feeTx = txRows.find(t => t.reference === res.reference);
    expect(feeTx).toBeTruthy();
    expect(feeTx!.type).toBe('withdrawal');
    expect(feeTx!.status).toBe('completed');
    expect(Number(feeTx!.amount)).toBe(25);
    expect(feeTx!.balanceAfter).toBe('75.00');
  });

  it('rejects card request when balance is below the fee', async () => {
    const db = await getDb();
    await db!.update(registrations).set({ balance: '10.00' }).where(eq(registrations.id, regId));
    const caller = appRouter.createCaller(makeCtx(regId));
    await expect(caller.cards.request({ type: 'credit' })).rejects.toThrow(/Insufficient balance/);
  });

  it('updates preferred language via security.updateLanguage', async () => {
    const caller = appRouter.createCaller(makeCtx(regId));
    const res = await caller.security.updateLanguage({ language: 'fr-CA' });
    expect(res.language).toBe('fr');
    const db = await getDb();
    const rows = await db!.select().from(registrations).where(eq(registrations.id, regId));
    expect(rows[0].preferredLanguage).toBe('fr');
    await expect(caller.security.updateLanguage({ language: 'xx' })).resolves.toMatchObject({ language: 'en' });
  });
});
