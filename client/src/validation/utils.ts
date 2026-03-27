const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\-()\s]{7,20}$/;
const CURRENCY_REGEX = /^[0-9]+(\.[0-9]{1,2})?$/;

export const sanitizeText = (value: string) => value.trim();

export const isValidEmail = (value: string) => EMAIL_REGEX.test(value.trim().toLowerCase());

export const isValidPhone = (value: string) => PHONE_REGEX.test(value.trim());

export const isStrongPassword = (value: string) => {
  const password = value.trim();
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
};

export const normalizeCurrencyString = (value: string) => {
  const sanitized = value.replace(/[,\s]/g, "");
  if (!CURRENCY_REGEX.test(sanitized)) {
    return null;
  }

  return Number(Number.parseFloat(sanitized).toFixed(2));
};

export const enforcePositiveNumber = (value: number | null | undefined) => typeof value === "number" && Number.isFinite(value) && value > 0;
