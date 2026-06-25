import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { DynamicFieldConfig, DynamicFormConfig } from './form.types';

export type DynamicFormValue = Record<string, unknown>;

@Injectable({
  providedIn: 'root',
})
export class DynamicFormBuilder {
  private readonly formBuilder = inject(FormBuilder);

  build(
    config: DynamicFormConfig,
    initialValue: DynamicFormValue = {},
  ): FormGroup<Record<string, FormControl<unknown>>> {
    const controls = config.fields.reduce<Record<string, FormControl<unknown>>>(
      (accumulator, field) => {
        const value = this.resolveInitialValue(field, initialValue);

        accumulator[field.key] = this.formBuilder.control(
          {
            value,
            disabled: field.disabled ?? false,
          },
          {
            validators: field.validators ? [...field.validators] : [],
          },
        );

        return accumulator;
      },
      {},
    );

    return this.formBuilder.group(controls, {
      validators: config.formValidators ? [...config.formValidators] : [],
    });
  }

  private resolveInitialValue(
    field: DynamicFieldConfig,
    initialValue: DynamicFormValue,
  ): unknown {
    const incomingValue = initialValue[field.key];

    if (incomingValue !== undefined) {
      return incomingValue;
    }

    if (field.defaultValue !== undefined) {
      return field.defaultValue;
    }

    if (field.type === 'select' && field.multiple) {
      return [];
    }

    if (field.type === 'checkbox') {
      return false;
    }

    return null;
  }
}
