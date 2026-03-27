import type { FieldErrors, ValidationResult } from "./types";
import { isValidEmail, isValidPhone, sanitizeText } from "./utils";

export type PaymentMethod = "card" | "bank_transfer" | "ussd";

export interface InitiatePaymentPayload {
  buyerEmail: string;
  buyerPhone: string;
  deliveryAddress: string;
  paymentMethod: PaymentMethod;
}

const PAYMENT_METHODS: PaymentMethod[] = ["card", "bank_transfer", "ussd"];

export const validateInitiatePaymentPayload = (
  payload: Partial<InitiatePaymentPayload>,
): ValidationResult<InitiatePaymentPayload> => {
  const errors: FieldErrors<InitiatePaymentPayload> = {};

  const buyerEmail = sanitizeText(payload.buyerEmail ?? "");
  const buyerPhone = sanitizeText(payload.buyerPhone ?? "");
  const deliveryAddress = sanitizeText(payload.deliveryAddress ?? "");
  const paymentMethod = payload.paymentMethod ?? "card";

  if (!buyerEmail) {
    errors.buyerEmail = "Buyer email is required.";
  } else if (!isValidEmail(buyerEmail)) {
    errors.buyerEmail = "Enter a valid email.";
  }

  if (!buyerPhone) {
    errors.buyerPhone = "Buyer phone is required.";
  } else if (!isValidPhone(buyerPhone)) {
    errors.buyerPhone = "Enter a valid phone number.";
  }

  if (!deliveryAddress) {
    errors.deliveryAddress = "Delivery address is required.";
  } else if (deliveryAddress.length < 10) {
    errors.deliveryAddress = "Delivery address is too short.";
  }

  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    errors.paymentMethod = "Select a supported payment method.";
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    data: isValid
      ? {
          buyerEmail: buyerEmail.toLowerCase(),
          buyerPhone,
          deliveryAddress,
          paymentMethod,
        }
      : undefined,
  };
};
