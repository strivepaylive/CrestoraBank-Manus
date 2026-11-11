import { describe, it, expect } from "vitest";
import { getStrings, normalizeLanguage, fmtMoneyIntl, fill, isRTL, SUPPORTED_LANGUAGES } from "./emailI18n";

describe("email i18n", () => {
  it("normalizes language codes with regional variants and falls back to en", () => {
    expect(normalizeLanguage("pt-BR")).toBe("pt");
    expect(normalizeLanguage("ZH")).toBe("zh");
    expect(normalizeLanguage("fr_CA")).toBe("fr");
    expect(normalizeLanguage("xx")).toBe("en");
    expect(normalizeLanguage(null)).toBe("en");
    expect(normalizeLanguage(undefined)).toBe("en");
  });

  it("provides strings for all 12 supported languages with English fallback", () => {
    for (const l of SUPPORTED_LANGUAGES) {
      const s = getStrings(l.code);
      expect(s.otp.subject, `otp.subject missing for ${l.code}`).toBeTruthy();
      expect(s.common.footerAutomated, `footer missing for ${l.code}`).toBeTruthy();
      expect(s.login.subject, `login.subject missing for ${l.code}`).toBeTruthy();
    }
    // Different languages produce different subjects (translated, not copied)
    expect(getStrings("es").otp.subject).not.toBe(getStrings("en").otp.subject);
    expect(getStrings("ja").login.subject).not.toBe(getStrings("en").login.subject);
  });

  it("falls back to English for unknown languages", () => {
    expect(getStrings("xx").otp.subject).toBe(getStrings("en").otp.subject);
  });

  it("formats money and fills templates per locale", () => {
    expect(fmtMoneyIntl(1234.5, "USD", "en")).toContain("1,234.50");
    const de = fmtMoneyIntl(1234.5, "USD", "de");
    expect(de).toContain("1.234,50");
    expect(fill("Hello {name}, your code is {code}", { name: "Ana", code: 123456 })).toBe(
      "Hello Ana, your code is 123456"
    );
    expect(isRTL("ar")).toBe(true);
    expect(isRTL("en")).toBe(false);
  });
});
