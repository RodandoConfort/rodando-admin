import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { CheckboxField } from '../fields/checkbox-field/checkbox-field';
import { DateField } from '../fields/date-field/date-field';
import { FileField } from '../fields/file-field/file-field';
import { ImageField } from '../fields/image-field/image-field';
import { NumberField } from '../fields/number-field/number-field';
import { SelectField } from '../fields/select-field/select-field';
import { TextareaField } from '../fields/textarea-field/textarea-field';
import { TextField } from '../fields/text-field/text-field';
import { DynamicFieldConfig } from '../form.types';

@Component({
  selector: 'app-dynamic-field',
  imports: [
    TextField,
    NumberField,
    SelectField,
    CheckboxField,
    TextareaField,
    DateField,
    FileField,
    ImageField,
  ],
  templateUrl: './dynamic-field.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicField {
  readonly field = input.required<DynamicFieldConfig>();
  readonly form = input.required<FormGroup>();

  readonly control = computed(() => {
    const control = this.form().get(this.field().key);

    if (!control) {
      throw new Error(`No existe el control "${this.field().key}".`);
    }

    return control as FormControl;
  });
}
