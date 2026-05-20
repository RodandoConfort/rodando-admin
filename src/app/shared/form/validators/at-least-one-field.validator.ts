import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export function atLeastOneFieldValidator(
  ...fieldKeys: string[]
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const form = control as FormGroup;

    const hasValue = fieldKeys.some((fieldKey) => {
      const rawValue = form.get(fieldKey)?.value;

      if (typeof rawValue === 'string') {
        return rawValue.trim().length > 0;
      }

      return rawValue !== null && rawValue !== undefined && rawValue !== '';
    });

    return hasValue
      ? null
      : {
          atLeastOneField: {
            fields: fieldKeys,
          },
        };
  };
}
