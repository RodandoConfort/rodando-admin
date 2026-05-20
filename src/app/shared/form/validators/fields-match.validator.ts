import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export function fieldsMatchValidator(
  sourceFieldKey: string,
  targetFieldKey: string,
  errorKey = 'fieldsMismatch',
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const form = control as FormGroup;

    const sourceValue = form.get(sourceFieldKey)?.value;
    const targetValue = form.get(targetFieldKey)?.value;

    if (!sourceValue && !targetValue) {
      return null;
    }

    return sourceValue === targetValue
      ? null
      : {
          [errorKey]: {
            sourceFieldKey,
            targetFieldKey,
          },
        };
  };
}
