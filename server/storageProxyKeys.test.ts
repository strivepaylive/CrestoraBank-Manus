import { describe, expect, it } from "vitest";

// Mirrors the sanitization used when generating invoice PDF keys
function toReferenceSlug(reference: string): string {
  return reference.replace(/[^A-Za-z0-9._-]+/g, "-");
}

// Mirrors the candidate-key fallback logic in server/_core/storageProxy.ts
function buildCandidates(rawKey: string): string[] {
  let key = rawKey;
  try {
    key = decodeURIComponent(rawKey);
  } catch {
    /* keep raw */
  }
  const candidates = [key];
  if (key.includes(" ")) {
    candidates.push(key.replace(/ /g, "-"));
    candidates.push(key.replace(/ /g, "+"));
  }
  return candidates;
}

describe("invoice PDF key sanitization", () => {
  it("removes spaces from the ESCROW TAX reference for filenames", () => {
    expect(toReferenceSlug("ESCROW TAX-29")).toBe("ESCROW-TAX-29");
  });

  it("keeps already-safe references unchanged", () => {
    expect(toReferenceSlug("INV-20260709-HTJ64B")).toBe("INV-20260709-HTJ64B");
  });

  it("never produces keys with spaces or percent signs", () => {
    const slug = toReferenceSlug("ESCROW TAX-99 %&#");
    expect(slug).not.toMatch(/[ %]/);
  });
});

describe("storage proxy key fallback", () => {
  it("decodes percent-encoded keys from legacy email links", () => {
    const candidates = buildCandidates("invoices/ESCROW%20TAX-29_c21ab3ac.pdf");
    expect(candidates[0]).toBe("invoices/ESCROW TAX-29_c21ab3ac.pdf");
  });

  it("tries hyphen and plus substitutions for keys containing spaces", () => {
    const candidates = buildCandidates("invoices/ESCROW%20TAX-29_c21ab3ac.pdf");
    expect(candidates).toContain("invoices/ESCROW-TAX-29_c21ab3ac.pdf");
    expect(candidates).toContain("invoices/ESCROW+TAX-29_c21ab3ac.pdf");
  });

  it("uses a single candidate for clean keys (fast path)", () => {
    const candidates = buildCandidates("invoices/INV-20260709-HTJ64B_1234cc3b.pdf");
    expect(candidates).toEqual(["invoices/INV-20260709-HTJ64B_1234cc3b.pdf"]);
  });
});
