import { AbstractControl, FormGroup } from '@angular/forms';

import {
  DynamicFieldConfig,
  DynamicFormConfig,
} from './form.types';

export function getControlError(
  field: DynamicFieldConfig,
  control: AbstractControl | null,
): string | null {
  if (!control?.errors) {
    return null;
  }

  const errors = control.errors;

  if (errors['required']) {
    return `${field.label} es obligatorio.`;
  }

  if (errors['email']) {
    return 'Ingresa un correo válido.';
  }

  if (errors['passwordMinLength']) {
    return `Debe tener al menos ${errors['passwordMinLength'].requiredLength} caracteres.`;
  }

  if (errors['passwordUppercase']) {
    return 'Debe incluir al menos una letra mayúscula.';
  }

  if (errors['passwordLowercase']) {
    return 'Debe incluir al menos una letra minúscula.';
  }

  if (errors['passwordSpecial']) {
    return 'Debe incluir al menos un carácter especial.';
  }

  if (errors['minlength']) {
    return `Debe tener al menos ${errors['minlength'].requiredLength} caracteres.`;
  }

  if (errors['maxlength']) {
    return `Debe tener máximo ${errors['maxlength'].requiredLength} caracteres.`;
  }

  if (errors['min']) {
    return `El valor mínimo permitido es ${errors['min'].min}.`;
  }

  if (errors['max']) {
    return `El valor máximo permitido es ${errors['max'].max}.`;
  }

  if (errors['pattern']) {
    return 'El formato no es válido.';
  }

  if (errors['maxFileSize']) {
    return `El archivo no puede superar ${errors['maxFileSize'].maxFileSizeMb} MB.`;
  }

  if (errors['fileType']) {
    return 'El tipo de archivo no es válido.';
  }

  return 'El campo no es válido.';
}

export function getFormError(
  config: DynamicFormConfig,
  form: FormGroup | null,
): string | null {
  if (!form?.errors) {
    return null;
  }

  const errorKey = Object.keys(form.errors)[0];

  if (!errorKey) {
    return null;
  }

  return (
    config.formErrorMessages?.[errorKey] ??
    'El formulario contiene errores.'
  );
}
