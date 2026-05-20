import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { DynamicFormConfig } from './form.types';

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
        const value = initialValue[field.key] ?? field.defaultValue ?? null;

        accumulator[field.key] = this.formBuilder.control(
          {
            value,
            disabled: field.disabled ?? false,
          },
          {
            validators: field.validators ?? [],
          },
        );

        return accumulator;
      },
      {},
    );

    return this.formBuilder.group(controls, {
      validators: config.formValidators ?? [],
    });
  }
}
