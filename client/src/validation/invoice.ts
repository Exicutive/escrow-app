import type { FieldErrors, ValidationResult } from "./types";
import { enforcePositiveNumber, normalizeCurrencyString, sanitizeText, isValidEmail, isValidPhone } from "./utils";

export interface CreateInvoicePayload {
  buyerEmail: string;
  buyerPhone?: string;
  itemName: string;
  itemDescription: string;
  amount: number;
  escrowPeriod: number;
  deliveryTimeframe: number;
  images: File[];
}

const MAX_IMAGES = 5;
const MIN_DESCRIPTION_LENGTH = 20;

export const validateCreateInvoicePayload = (
  payload: Partial<CreateInvoicePayload>,
): ValidationResult<CreateInvoicePayload> => {
  const errors: FieldErrors<CreateInvoicePayload> = {};

  const itemName = sanitizeText(payload.itemName ?? "");
  const itemDescription = sanitizeText(payload.itemDescription ?? "");
  const buyerEmail = sanitizeText(payload.buyerEmail ?? "");
  const buyerPhone = sanitizeText(payload.buyerPhone ?? "");
  const escrowPeriod = Number(payload.escrowPeriod ?? 0);
  const deliveryTimeframe = Number(payload.deliveryTimeframe ?? 0);
  const normalizedAmount = normalizeCurrencyString(String(payload.amount ?? ""));
  const images = payload.images ?? [];

  if (!itemName) {
    errors.itemName = "Item name is required.";
  } else if (itemName.length < 3) {
    errors.itemName = "Item name must be at least 3 characters.";
  }

  if (!itemDescription) {
    errors.itemDescription = "Description is required.";
  } else if (itemDescription.length < MIN_DESCRIPTION_LENGTH) {
    errors.itemDescription = `Description must be ${MIN_DESCRIPTION_LENGTH}+ characters.`;
  }

  if (!normalizedAmount || !enforcePositiveNumber(normalizedAmount)) {
    errors.amount = "Enter a valid amount.";
  }

  if (!buyerEmail) {
    errors.buyerEmail = "Buyer email is required.";
  } else if (!isValidEmail(buyerEmail)) {
    errors.buyerEmail = "Enter a valid buyer email.";
  }

  if (buyerPhone && !isValidPhone(buyerPhone)) {
    errors.buyerPhone = "Enter a valid phone number.";
  }

  if (!enforcePositiveNumber(escrowPeriod)) {
    errors.escrowPeriod = "Escrow period must be a positive number of days.";
  }

  if (!enforcePositiveNumber(deliveryTimeframe)) {
    errors.deliveryTimeframe = "Delivery timeframe must be a positive number of days.";
  }

  if (images.length > MAX_IMAGES) {
    errors.images = `Maximum of ${MAX_IMAGES} images allowed.`;
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    data: isValid
      ? {
          itemName,
          itemDescription,
          amount: normalizedAmount!,
          buyerEmail: buyerEmail.toLowerCase(),
          buyerPhone: buyerPhone || undefined,
          escrowPeriod,
          deliveryTimeframe,
          images,
        }
      : undefined,
  };
};
