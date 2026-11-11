import { describe, expect, it } from 'vitest';
import { getConversionQuote, SUPPORTED_CURRENCIES } from './currencyService';

describe('Currency conversion service', () => {
  it('lists supported currencies including majors', () => {
    const codes = SUPPORTED_CURRENCIES.map((c) => c.code);
    expect(codes).toContain('USD');
    expect(codes).toContain('EUR');
    expect(codes).toContain('GBP');
    expect(SUPPORTED_CURRENCIES.length).toBeGreaterThanOrEqual(8);
  });

  it('returns identity quote for same currency', async () => {
    const q = await getConversionQuote(1000, 'USD', 'USD', 'local');
    expect(q.exchangeRate).toBe(1);
    expect(q.recipientAmount).toBeCloseTo(1000 - q.transferFee, 2);
  });

  it('produces a live or fallback quote for USD -> EUR with fee applied', async () => {
    const q = await getConversionQuote(1000, 'USD', 'EUR', 'international');
    expect(q.exchangeRate).toBeGreaterThan(0.3);
    expect(q.exchangeRate).toBeLessThan(3);
    expect(q.transferFee).toBeGreaterThan(0); // international transfers carry a fee
    const expected = (1000 - q.transferFee) * q.exchangeRate;
    expect(q.recipientAmount).toBeCloseTo(expected, 1);
    expect(q.fromCurrency).toBe('USD');
    expect(q.toCurrency).toBe('EUR');
    expect(q.rateTimestamp).toBeTruthy();
  }, 20000);

  it('rejects unsupported currencies', async () => {
    await expect(getConversionQuote(100, 'USD', 'XXX' as never, 'local')).rejects.toThrow();
  }, 30000);
});
