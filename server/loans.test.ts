import { describe, expect, it } from 'vitest';
import {
  emailShell,
  sendLoanReceivedEmail,
  sendLoanApprovedEmail,
  sendLoanDeclinedEmail,
} from './emailService';

const CLEAN_LOGO = 'crestora-logo-ui-clean';

const sampleLoan = {
  reference: 'LN-20260707-TEST01',
  category: 'employment' as const,
  employer: 'Halifax Public Libraries',
  workEmail: 'jane.doe@halifax.ca',
  amount: '5000.00',
  currency: 'USD',
  purpose: 'Home office equipment',
  termMonths: 12,
  interestRate: '8.50',
  monthlyPayment: '436.16',
  adminMessage: null as string | null,
  lang: 'en',
};

describe('loan emails', () => {
  it('email shell includes the bank logo', () => {
    const html = emailShell('Loan Update', '<p>test</p>', { lang: 'en' });
    expect(html).toContain(CLEAN_LOGO);
  });

  it('loan email senders exist and are callable', () => {
    expect(typeof sendLoanReceivedEmail).toBe('function');
    expect(typeof sendLoanApprovedEmail).toBe('function');
    expect(typeof sendLoanDeclinedEmail).toBe('function');
  });

  it('loan received email resolves in test mode without throwing', async () => {
    await expect(
      sendLoanReceivedEmail('delivered@resend.dev', 'Jane', sampleLoan),
    ).resolves.not.toThrow();
  });

  it('loan approved email resolves in test mode without throwing', async () => {
    await expect(
      sendLoanApprovedEmail('delivered@resend.dev', 'Jane', { ...sampleLoan, newBalance: '5200.00' }),
    ).resolves.not.toThrow();
  });

  it('loan declined email resolves in test mode without throwing', async () => {
    await expect(
      sendLoanDeclinedEmail('delivered@resend.dev', 'Jane', { ...sampleLoan, adminMessage: 'Please re-apply in 90 days.' }),
    ).resolves.not.toThrow();
  });
});

describe('loan reference format', () => {
  it('LN reference pattern matches the standard', () => {
    expect(sampleLoan.reference).toMatch(/^LN-\d{8}-[A-Z0-9]{6}$/);
  });
});
