import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { DynamicFieldConfig } from '../../form.types';

@Component({
  selector: 'app-checkbox-field',
  imports: [ReactiveFormsModule, MatCheckboxModule],
  templateUrl: './checkbox-field.html',
  styleUrl: './checkbox-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxField {
  readonly field = input.required<DynamicFieldConfig>();
  readonly control = input.required<FormControl>();
}
