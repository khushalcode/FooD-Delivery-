/**
 * Validators — mirrors lib/helper/custom_validator_helper.dart.
 */

const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/;

export interface PhoneValid {
  phone: string;
  isValid: boolean;
}

export async function isPhoneValid(rawPhone: string): Promise<PhoneValid> {
  // Trim and normalize
  let phone = (rawPhone || '').trim();
  // Remove spaces and dashes
  phone = phone.replace(/[\s-]/g, '');

  if (!phone) {
    return { phone, isValid: false };
  }

  if (!phone.startsWith('+')) {
    // Assume international format already includes country code
    return { phone: '+' + phone, isValid: PHONE_REGEX.test('+' + phone) };
  }

  return { phone, isValid: PHONE_REGEX.test(phone) };
}

export function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isPasswordValid(password: string): boolean {
  return (password || '').length >= 6;
}

export function isNumeric(s: string): boolean {
  return /^\d+$/.test(s);
}

export function requireField(value: string, fieldName: string): string | null {
  if (!value || !value.trim()) {
    return `${fieldName} is required`;
  }
  return null;
}
