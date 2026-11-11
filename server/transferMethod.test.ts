import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { getDb } from './db';
import { registrations, transactions } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { appRouter } from './routers';
import { hashPassword } from './passwordUtils';

function makeCtx(regId: number) {
  return {
    user: { openId: `reg_${regId}`, name: 'Test', role: 'user' },
    req: {} as any,
    res: {} as any,
  } as any;
}

let regId: number;

beforeAll(async () => {
  const db = await getDb();
  if (!db) throw new Error('DB unavailable');
  const pinHash = await hashPassword('1234');
  await db.insert(registrations).values({
    firstName: 'Method',
    lastName: 'Tester',
    username: `methodtester_${Date.now()}`,
    email: 'delivered@resend.dev',
    accountNumber: `99${Date.now().toString().slice(-8)}`,
    balance: '5000.00',
    status: 'approved',
    kycStatus: 'approved',
    transferPin: pinHash,
  });
  const rows = await db.select().from(registrations).where(eq(registrations.email, 'delivered@resend.dev'));
  regId = rows[rows.length - 1].id;
});

afterAll(async () => {
  const db = await getDb();
  if (db && regId) {
    await db.delete(transactions).where(eq(transactions.registrationId, regId));
    await db.delete(registrations).where(eq(registrations.id, regId));
  }
});

describe('Transfer method selection', () => {
  it('stores transferMethod and methodDetail for a crypto withdrawal', async () => {
    const caller = appRouter.createCaller(makeCtx(regId));
    const res = await caller.account.transfer({
      amount: 100,
      recipientName: 'Satoshi Recipient',
      recipientAccount: 'bc1qexamplewalletaddress000000000',
      recipientBank: 'Crypto Wallet',
      transferType: 'local',
      transferMethod: 'crypto',
      methodDetail: 'Bitcoin (BTC)',
      currency: 'USD',
      pin: '1234',
    });
    expect(res.success).toBe(true);

    const db = await getDb();
    const txs = await db!.select().from(transactions).where(eq(transactions.registrationId, regId));
    const tx = txs.find(t => t.reference === res.reference);
    expect(tx).toBeDefined();
    expect(tx!.transferMethod).toBe('crypto');
    expect(tx!.methodDetail).toBe('Bitcoin (BTC)');
  }, 30000);

  it('defaults transferMethod to wire when not provided', async () => {
    const caller = appRouter.createCaller(makeCtx(regId));
    const res = await caller.account.transfer({
      amount: 50,
      recipientName: 'Legacy Recipient',
      recipientAccount: '12345678',
      recipientBank: 'Chase Bank',
      transferType: 'local',
      currency: 'USD',
      pin: '1234',
    });
    expect(res.success).toBe(true);
    const db = await getDb();
    const txs = await db!.select().from(transactions).where(eq(transactions.registrationId, regId));
    const tx = txs.find(t => t.reference === res.reference);
    expect(tx!.transferMethod).toBe('wire');
  }, 30000);

  it('rejects an invalid transfer method', async () => {
    const caller = appRouter.createCaller(makeCtx(regId));
    await expect(caller.account.transfer({
      amount: 10,
      recipientName: 'Bad Method',
      recipientAccount: '12345678',
      recipientBank: 'X',
      transferType: 'local',
      transferMethod: 'westernunion' as any,
      currency: 'USD',
      pin: '1234',
    })).rejects.toThrow();
  }, 30000);
});
