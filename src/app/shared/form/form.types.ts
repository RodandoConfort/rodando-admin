import { ValidatorFn } from '@angular/forms';

export type DynamicFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'textarea'
  | 'date'
  | 'file'
  | 'image';

export interface DynamicSelectOption<TValue = unknown> {
  label: string;
  value: TValue;
  disabled?: boolean;
}

export interface DynamicFieldConfig<TValue = unknown> {
  key: string;
  label: string;
  type: DynamicFieldType;

  placeholder?: string;
  hint?: string;
  defaultValue?: TValue;
  disabled?: boolean;
  readonly?: boolean;
  validators?: ValidatorFn[];

  prefixIcon?: string;
  prefixText?: string;
  autocomplete?: string;

  options?: DynamicSelectOption[];

  accept?: string;
  multiple?: boolean;
  maxFileSizeMb?: number;
  previewUrl?: string;
  fullWidth?: boolean;
}

export type DynamicFormLayout =
  | 'default'
  | 'image-aside';

export interface DynamicFormConfig {
  fields: DynamicFieldConfig[];
  layout?: DynamicFormLayout;

  columns?: 1 | 2;

  submitLabel?: string;
  submitLoadingLabel?: string;
  submitIcon?: string;
  submitFullWidth?: boolean;
  disableSubmitWhenInvalid?: boolean;

  cancelLabel?: string;
  showCancel?: boolean;
  prefixText?: string;

  /**
   * Validadores a nivel de FormGroup:
   * - email o phone obligatorio
   * - password/confirmPassword iguales
   */
  formValidators?: ValidatorFn[];

  /**
   * Mensajes para errores globales del formulario.
   */
  formErrorMessages?: Record<string, string>;
}
