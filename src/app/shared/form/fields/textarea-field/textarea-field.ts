import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { getControlError } from '../../form-errors';
import { DynamicFieldConfig } from '../../form.types';

@Component({
  selector: 'app-textarea-field',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './textarea-field.html',
  styleUrl: './textarea-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaField {
  readonly field = input.required<DynamicFieldConfig>();
  readonly control = input.required<FormControl>();

  readonly errorMessage = computed(() =>
    getControlError(this.field(), this.control()),
  );
}
