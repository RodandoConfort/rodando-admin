import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { getControlError } from '../../form-errors';
import { DynamicFieldConfig } from '../../form.types';

@Component({
  selector: 'app-text-field',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './text-field.html',
  styleUrl: './text-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextField {
  readonly field = input.required<DynamicFieldConfig>();
  readonly control = input.required<FormControl>();

  readonly hidePassword = signal(true);

  readonly inputType = computed(() => {
    const type = this.field().type;

    if (type === 'password') {
      return this.hidePassword() ? 'password' : 'text';
    }

    if (type === 'email') {
      return 'email';
    }

    return 'text';
  });

  readonly errorMessage = computed(() =>
    getControlError(this.field(), this.control()),
  );

  togglePasswordVisibility(): void {
    this.hidePassword.update((value) => !value);
  }
}