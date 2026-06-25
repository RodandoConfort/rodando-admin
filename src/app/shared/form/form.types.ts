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
  validators?: readonly ValidatorFn[];

  prefixIcon?: string;
  prefixText?: string;
  autocomplete?: string;

  options?: readonly DynamicSelectOption[];

  accept?: string;
  multiple?: boolean;
  maxFileSizeMb?: number;
  previewUrl?: string;
  fullWidth?: boolean;
  group?: string;
  /**
   * Solo para campos type="textarea".
   */
  rows?: number;
}

export type DynamicFormLayout = 'default' | 'image-aside';

export interface DynamicFormConfig {
  fields: readonly DynamicFieldConfig[];
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
  formValidators?: readonly ValidatorFn[];

  /**
   * Mensajes para errores globales del formulario.
   */
  formErrorMessages?: Record<string, string>;

  groups?: readonly DynamicFormGroupConfig[];
}

export type DynamicFormGroupLayout =
  | 'default'
  | 'media-right'
  | 'checkbox-right';

export interface DynamicFormGroupConfig {
  key: string;
  title: string;
  description?: string;
  columns?: number;
  layout?: DynamicFormGroupLayout;
}
