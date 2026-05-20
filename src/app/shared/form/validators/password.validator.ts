import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface StrongPasswordOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireSpecial?: boolean;
}

export function strongPasswordValidator(
  options: StrongPasswordOptions = {},
): ValidatorFn {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireSpecial = true,
  } = options;

  return (control: AbstractControl<string | null>): ValidationErrors | null => {
    const value = control.value ?? '';

    if (!value) {
      return null;
    }

    const errors: ValidationErrors = {};

    if (value.length < minLength) {
      errors['passwordMinLength'] = { requiredLength: minLength };
    }

    if (requireUppercase && !/[A-ZÁÉÍÓÚÑ]/.test(value)) {
      errors['passwordUppercase'] = true;
    }

    if (requireLowercase && !/[a-záéíóúñ]/.test(value)) {
      errors['passwordLowercase'] = true;
    }

    if (
      requireSpecial &&
      !/[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ]/.test(value)
    ) {
      errors['passwordSpecial'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}