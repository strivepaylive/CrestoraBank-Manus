/**
 * Email internationalization (i18n) core for Crestora Bank transactional emails.
 *
 * - 12 supported languages, English fallback for any missing key/language.
 * - Locale-aware date & currency formatting via Intl APIs.
 * - RTL support flag for Arabic.
 *
 * Translation dictionaries live in server/emailTranslations.ts.
 */
import { TRANSLATIONS, type EmailStrings } from "./emailTranslations";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English", locale: "en-US", rtl: false },
  { code: "es", label: "Spanish", nativeLabel: "Español", locale: "es-ES", rtl: false },
  { code: "fr", label: "French", nativeLabel: "Français", locale: "fr-FR", rtl: false },
  { code: "pt", label: "Portuguese", nativeLabel: "Português", locale: "pt-PT", rtl: false },
  { code: "de", label: "German", nativeLabel: "Deutsch", locale: "de-DE", rtl: false },
  { code: "it", label: "Italian", nativeLabel: "Italiano", locale: "it-IT", rtl: false },
  { code: "nl", label: "Dutch", nativeLabel: "Nederlands", locale: "nl-NL", rtl: false },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", locale: "ar-EG", rtl: true },
  { code: "zh", label: "Chinese (Simplified)", nativeLabel: "简体中文", locale: "zh-CN", rtl: false },
  { code: "ja", label: "Japanese", nativeLabel: "日本語", locale: "ja-JP", rtl: false },
  { code: "ko", label: "Korean", nativeLabel: "한국어", locale: "ko-KR", rtl: false },
  { code: "ru", label: "Russian", nativeLabel: "Русский", locale: "ru-RU", rtl: false },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export const LANGUAGE_CODES: LanguageCode[] = SUPPORTED_LANGUAGES.map((l) => l.code);

/** Normalize any input (e.g. "pt-BR", "ZH", "fr_CA") to a supported code; fallback "en". */
export function normalizeLanguage(input?: string | null): LanguageCode {
  if (!input) return "en";
  const base = String(input).trim().toLowerCase().split(/[-_]/)[0];
  return (LANGUAGE_CODES as string[]).includes(base) ? (base as LanguageCode) : "en";
}

/** Full locale string for Intl formatting (e.g. "de-DE"). */
export function localeFor(lang: string | null | undefined): string {
  const code = normalizeLanguage(lang);
  return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.locale ?? "en-US";
}

/** Whether the language renders right-to-left. */
export function isRTL(lang: string | null | undefined): boolean {
  const code = normalizeLanguage(lang);
  return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.rtl ?? false;
}

/**
 * Get the translated strings for a language, deep-merged over English so any
 * missing key automatically falls back to the English text.
 */
export function getStrings(lang?: string | null): EmailStrings {
  const code = normalizeLanguage(lang);
  const en = TRANSLATIONS.en;
  if (code === "en") return en;
  const target = TRANSLATIONS[code];
  if (!target) return en;
  return deepMerge(
    en as unknown as Record<string, unknown>,
    target as unknown as Record<string, unknown>
  ) as unknown as EmailStrings;
}

function deepMerge(base: Record<string, unknown>, override: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(override)) {
    if (v == null) continue;
    const bv = base[k];
    if (typeof v === "object" && !Array.isArray(v) && typeof bv === "object" && bv !== null && !Array.isArray(bv)) {
      out[k] = deepMerge(bv as Record<string, unknown>, v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

/** Interpolate {placeholders} in a translated string. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => (vars[key] != null ? String(vars[key]) : `{${key}}`));
}

/** Locale-aware currency formatting, e.g. 1234.5 → "1.234,50 €" for de. */
export function fmtMoneyIntl(amount: string | number, currency = "USD", lang?: string | null): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  try {
    return new Intl.NumberFormat(localeFor(lang), { style: "currency", currency, currencyDisplay: "symbol" }).format(n);
  } catch {
    return `${currency} ${Number.isFinite(n) ? n.toFixed(2) : amount}`;
  }
}

/** Locale-aware date+time formatting in UTC (consistent with prior behaviour). */
export function fmtDateIntl(date: Date | string | number | undefined, lang?: string | null): string {
  const d = date instanceof Date ? date : date != null ? new Date(date) : new Date();
  if (isNaN(d.getTime())) return String(date ?? "");
  try {
    return new Intl.DateTimeFormat(localeFor(lang), {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(d) + " UTC";
  } catch {
    return d.toUTCString();
  }
}
