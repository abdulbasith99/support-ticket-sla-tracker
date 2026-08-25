import { appError } from "./errors";

export function requireNonEmpty(
  value: string,
  fieldName: string,
): string {
  const trimmed = value.trim();

  if (!trimmed) {
    throw appError(
      `${fieldName} cannot be empty.`,
      "VALIDATION_ERROR",
      400,
    );
  }

  return trimmed;
}

export function validateEmail(email: string): string {
  const normalized = email.trim().toLowerCase();

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalized)) {
    throw appError(
      "Please provide a valid email address.",
      "VALIDATION_ERROR",
      400,
    );
  }

  return normalized;
}

export function validatePassword(password: string): string {
  if (password.length < 8) {
    throw appError(
      "Password must contain at least 8 characters.",
      "VALIDATION_ERROR",
      400,
    );
  }

  return password;
}