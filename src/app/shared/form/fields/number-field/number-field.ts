import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { getControlError } from '../../form-errors';
import { DynamicFieldConfig } from '../../form.types';

@Component({
  selector: 'app-number-field',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './number-field.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberField {
  readonly field = input.required<DynamicFieldConfig>();
  readonly control = input.required<FormControl>();

  readonly errorMessage = computed(() =>
    getControlError(this.field(), this.control()),
  );
}
