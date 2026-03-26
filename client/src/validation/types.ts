export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export interface ValidationResult<T> {
  data?: T;
  errors: FieldErrors<T>;
  isValid: boolean;
}
