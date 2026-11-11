/**
 * Currency conversion service for international transfers.
 * Fetches live exchange rates (Frankfurter API, ECB data — no API key needed),
 * with an open.er-api.com fallback and a static fallback table so transfers
 * never fail because a rates provider is down.
 */

export const SUPPORTED_CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "CN¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "AED", name: "UAE Dirham", symbol: "AED" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "JMD", name: "Jamaican Dollar", symbol: "J$" },
  { code: "TTD", name: "Trinidad and Tobago Dollar", symbol: "TT$" },
  { code: "BSD", name: "Bahamian Dollar", symbol: "B$" },
] as const;

export function currencySymbol(code: string): string {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code)?.symbol ?? code + " ";
}

// Static fallback rates vs USD (approximate; used only if both live providers fail)
const FALLBACK_USD_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, CAD: 1.37, AUD: 1.51, JPY: 155.2, CHF: 0.89,
  CNY: 7.24, INR: 83.5, NGN: 1540, ZAR: 18.2, MXN: 17.1, BRL: 5.43, AED: 3.67, SGD: 1.34,
  JMD: 155.5, TTD: 6.78, BSD: 1.0,
};

// Simple in-memory cache: rates change slowly; cache each pair for 10 minutes
const rateCache = new Map<string, { rate: number; fetchedAt: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

async function fetchWithTimeout(url: string, ms = 6000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Get the live exchange rate from one currency to another. */
export async function getExchangeRate(from: string, to: string): Promise<{ rate: number; source: string; fetchedAt: Date }> {
  if (from === to) return { rate: 1, source: "same-currency", fetchedAt: new Date() };

  const cacheKey = `${from}->${to}`;
  const cached = rateCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { rate: cached.rate, source: "cache", fetchedAt: new Date(cached.fetchedAt) };
  }

  // Provider 1: Frankfurter (ECB)
  try {
    const res = await fetchWithTimeout(`https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`);
    if (res.ok) {
      const data = (await res.json()) as { rates?: Record<string, number> };
      const rate = data.rates?.[to];
      if (rate && rate > 0) {
        rateCache.set(cacheKey, { rate, fetchedAt: Date.now() });
        return { rate, source: "frankfurter", fetchedAt: new Date() };
      }
    }
  } catch {
    // fall through to next provider
  }

  // Provider 2: open.er-api.com
  try {
    const res = await fetchWithTimeout(`https://open.er-api.com/v6/latest/${from}`);
    if (res.ok) {
      const data = (await res.json()) as { rates?: Record<string, number> };
      const rate = data.rates?.[to];
      if (rate && rate > 0) {
        rateCache.set(cacheKey, { rate, fetchedAt: Date.now() });
        return { rate, source: "er-api", fetchedAt: new Date() };
      }
    }
  } catch {
    // fall through to static fallback
  }

  // Static fallback via USD cross-rate
  const fromUsd = FALLBACK_USD_RATES[from];
  const toUsd = FALLBACK_USD_RATES[to];
  if (fromUsd && toUsd) {
    const rate = toUsd / fromUsd;
    return { rate, source: "fallback", fetchedAt: new Date() };
  }
  throw new Error(`Exchange rate unavailable for ${from} → ${to}`);
}

/** Flat + percentage international transfer fee, charged in sender currency. */
export function calculateTransferFee(amount: number, transferType: "local" | "international", crossCurrency: boolean): number {
  if (transferType !== "international" && !crossCurrency) return 0;
  // 0.5% + no flat fee, min 2.50, max 40 (in sender currency units)
  const fee = amount * 0.005;
  return Math.min(Math.max(Math.round(fee * 100) / 100, 2.5), 40);
}

export interface ConversionQuote {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  exchangeRate: number;
  transferFee: number;
  /** Amount converted after deducting the fee from the sender amount. */
  recipientAmount: number;
  rateTimestamp: Date;
  sameCurrency: boolean;
}

/** Build a full conversion quote for a proposed transfer. */
export async function getConversionQuote(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  transferType: "local" | "international" = "international",
): Promise<ConversionQuote> {
  const sameCurrency = fromCurrency === toCurrency;
  const { rate, fetchedAt } = await getExchangeRate(fromCurrency, toCurrency);
  const transferFee = sameCurrency ? 0 : calculateTransferFee(amount, transferType, !sameCurrency);
  const net = Math.max(amount - transferFee, 0);
  const recipientAmount = Math.round(net * rate * 100) / 100;
  return {
    fromCurrency,
    toCurrency,
    amount,
    exchangeRate: rate,
    transferFee,
    recipientAmount,
    rateTimestamp: fetchedAt,
    sameCurrency,
  };
}
