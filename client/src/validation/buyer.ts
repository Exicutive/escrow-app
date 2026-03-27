import type { FieldErrors, ValidationResult } from "./types";
import { sanitizeText } from "./utils";

export interface ConfirmDeliveryPayload {
  invoiceId: string;
}

const INVOICE_REGEX = /^INV-[A-Z0-9-]{4,}$/i;

export const validateConfirmDeliveryPayload = (
  payload: Partial<ConfirmDeliveryPayload>,
): ValidationResult<ConfirmDeliveryPayload> => {
  const errors: FieldErrors<ConfirmDeliveryPayload> = {};
  const invoiceId = sanitizeText(payload.invoiceId ?? "");

  if (!invoiceId) {
    errors.invoiceId = "Invoice ID is required.";
  } else if (!INVOICE_REGEX.test(invoiceId)) {
    errors.invoiceId = "Invoice ID must follow the INV-XXXX pattern.";
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    data: isValid ? { invoiceId: invoiceId.toUpperCase() } : undefined,
  };
};
