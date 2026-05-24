/**
 * Validates a card number using the Luhn Algorithm.
 * @param {string} cardNumber - The card number string (digits only or formatted).
 * @returns {boolean} - True if valid, false otherwise.
 */
export function validateLuhn(cardNumber) {
  const digits = cardNumber.replace(/\D/g, '');
  if (!digits || digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  // Loop from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let val = parseInt(digits[i], 10);
    if (shouldDouble) {
      val *= 2;
      if (val > 9) {
        val -= 9;
      }
    }
    sum += val;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Detects the credit card brand.
 * @param {string} cardNumber - Card number digits.
 * @returns {string} - 'visa', 'mastercard', or 'unknown'.
 */
export function detectCardBrand(cardNumber) {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.startsWith('4')) {
    return 'visa';
  }
  // Mastercard starts with 51-55 or 2221-2720
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/.test(digits)) {
    return 'mastercard';
  }
  return 'unknown';
}

/**
 * Generates the AXIPAYS security hash.
 * Steps:
 * 1. Extract first 6 and last 4 digits of card number.
 * 2. Concatenate: first6 + last4.
 * 3. Reverse the 10-digit string.
 * 4. Reverse the email.
 * 5. Build message: reverse(email) + "AXIPAYS" + reverse(first6+last4).
 * 6. Convert message to uppercase.
 * 7. HMAC-SHA256 message with key "AXI2026".
 * 
 * @param {string} email 
 * @param {string} cardNumber 
 * @returns {Promise<string>} Upper case hexadecimal hash
 */
export async function calculateAxipaysHash(email, cardNumber) {
  const cleanCard = cardNumber.replace(/\D/g, '');
  if (cleanCard.length < 10) {
    throw new Error("Card number must be at least 10 digits to calculate hash");
  }

  const first6 = cleanCard.substring(0, 6);
  const last4 = cleanCard.substring(cleanCard.length - 4);
  const combined = first6 + last4;

  const revCard = combined.split('').reverse().join('');
  const revEmail = email.trim().split('').reverse().join('');
  
  const message = (revEmail + "AXIPAYS" + revCard).toUpperCase();
  const secretKey = "AXI2026";

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const messageData = encoder.encode(message);

  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await window.crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    messageData
  );

  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

/**
 * Formats a card number with spaces and masks the middle 6 digits (indexes 6 to 11).
 * @param {string} rawDigits - Digits only
 * @returns {string} - Formatted and masked string (e.g. "4111 11•• •••• 1111")
 */
export function formatMaskedCardNumber(rawDigits) {
  const clean = rawDigits.replace(/\D/g, '').substring(0, 16);
  let formatted = '';
  for (let i = 0; i < clean.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formatted += ' ';
    }
    if (i >= 6 && i <= 11) {
      formatted += '•';
    } else {
      formatted += clean[i];
    }
  }
  return formatted;
}

/**
 * Formats a card number with spaces without masking.
 * @param {string} rawDigits - Digits only
 * @returns {string} - Formatted string (e.g. "4111 1111 1111 1111")
 */
export function formatCardNumberSpacing(rawDigits) {
  const clean = rawDigits.replace(/\D/g, '').substring(0, 16);
  let formatted = '';
  for (let i = 0; i < clean.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formatted += ' ';
    }
    formatted += clean[i];
  }
  return formatted;
}

/**
 * Formats expiry date to MM/YY.
 * @param {string} value 
 * @returns {string}
 */
export function formatExpiry(value) {
  const clean = value.replace(/\D/g, '').substring(0, 4);
  if (clean.length > 2) {
    return `${clean.substring(0, 2)}/${clean.substring(2)}`;
  }
  return clean;
}
