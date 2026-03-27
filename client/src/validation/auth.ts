import type { FieldErrors, ValidationResult } from "./types";
import { isStrongPassword, isValidEmail, sanitizeText } from "./utils";

export type UserRole = "buyer" | "seller" | "admin";

export interface RegisterUserPayload {
  username: string;
  email: string;
  password: string;
  role: Extract<UserRole, "buyer" | "seller">;
}

export interface LoginPayload {
  username: string;
  password: string;
}

const ALLOWED_ROLES: Array<RegisterUserPayload["role"]> = ["buyer", "seller"];

export const validateRegisterPayload = (
  payload: Partial<RegisterUserPayload>,
): ValidationResult<RegisterUserPayload> => {
  const errors: FieldErrors<RegisterUserPayload> = {};

  const username = sanitizeText(payload.username ?? "");
  const email = sanitizeText(payload.email ?? "");
  const role = payload.role ?? "buyer";
  const password = payload.password ?? "";

  if (!username) {
    errors.username = "Username is required.";
  } else if (username.length < 3) {
    errors.username = "Username must be at least 3 characters.";
  }

  if (!email) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (!isStrongPassword(password)) {
    errors.password = "Password must be 8+ chars with upper, lower, and number.";
  }

  if (!role) {
    errors.role = "Role is required.";
  } else if (!ALLOWED_ROLES.includes(role)) {
    errors.role = "Role must be buyer or seller.";
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    data: isValid
      ? {
          username,
          email: email.toLowerCase(),
          password,
          role,
        }
      : undefined,
  };
};

export const validateLoginPayload = (
  payload: Partial<LoginPayload>,
): ValidationResult<LoginPayload> => {
  const errors: FieldErrors<LoginPayload> = {};
  const username = sanitizeText(payload.username ?? "");
  const password = payload.password ?? "";

  if (!username) {
    errors.username = "Username or email is required.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    data: isValid ? { username, password } : undefined,
  };
};
