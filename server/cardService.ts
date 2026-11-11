/**
 * Card generation service — produces realistic, Luhn-valid card numbers
 * that are platform-only (BIN prefixes chosen for display purposes).
 */

const DEBIT_BIN = "4539"; // Visa-style prefix for platform debit cards
const CREDIT_BIN = "5412"; // Mastercard-style prefix for platform credit cards

/** Compute the Luhn check digit for a partial number. */
function luhnCheckDigit(partial: string): number {
  const digits = partial.split("").map(Number);
  let sum = 0;
  // Rightmost digit of the FULL number is the check digit, so partial digits
  // are doubled starting from the rightmost partial digit.
  for (let i = digits.length - 1, pos = 0; i >= 0; i--, pos++) {
    let d = digits[i];
    if (pos % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return (10 - (sum % 10)) % 10;
}

/** Validate a card number with the Luhn algorithm. */
export function isLuhnValid(cardNumber: string): boolean {
  const clean = cardNumber.replace(/\D/g, "");
  if (clean.length < 13) return false;
  let sum = 0;
  let alt = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let d = parseInt(clean[i], 10);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

/** Generate a 16-digit Luhn-valid card number for the given card type. */
export function generateCardNumber(type: "debit" | "credit"): string {
  const bin = type === "debit" ? DEBIT_BIN : CREDIT_BIN;
  let partial = bin;
  while (partial.length < 15) {
    partial += Math.floor(Math.random() * 10).toString();
  }
  return partial + luhnCheckDigit(partial).toString();
}

/** Generate an expiry date 4 years from now, formatted MM/YY. */
export function generateExpiryDate(): string {
  const d = new Date();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = String((d.getUTCFullYear() + 4) % 100).padStart(2, "0");
  return `${month}/${year}`;
}

/** Generate a 3-digit CVV. */
export function generateCVV(): string {
  return String(Math.floor(100 + Math.random() * 900));
}

export interface GeneratedCard {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

export function generateCardDetails(type: "debit" | "credit"): GeneratedCard {
  return {
    cardNumber: generateCardNumber(type),
    expiryDate: generateExpiryDate(),
    cvv: generateCVV(),
  };
}
