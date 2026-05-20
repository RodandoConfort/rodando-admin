import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { merge, startWith } from 'rxjs';

import { DynamicField } from '../dynamic-field/dynamic-field';
import { DynamicFormBuilder, DynamicFormValue } from '../dynamic-form-builder';
import { DynamicFormConfig } from '../form.types';
import { SubmitButton } from '../../components/buttons/submit-button/submit-button';
import { getFormError } from '../form-errors';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    DynamicField,
    SubmitButton,
  ],
  templateUrl: './dynamic-form.html',
  styleUrl: './dynamic-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicForm {
  private readonly dynamicFormBuilder = inject(DynamicFormBuilder);

  readonly config = input.required<DynamicFormConfig>();
  readonly initialValue = input<DynamicFormValue | null>(null);
  readonly saving = input(false);
  readonly error = input<string | null>(null);

  readonly submitted = output<DynamicFormValue>();
  readonly cancelled = output<void>();

  readonly form = signal<FormGroup>(new FormGroup({}));
  readonly formInvalid = signal(true);
  readonly formValidationError = signal<string | null>(null);

  readonly submitDisabled = computed(() => {
    const disableWhenInvalid =
      this.config().disableSubmitWhenInvalid ?? false;

    return this.saving() || (disableWhenInvalid && this.formInvalid());
  });

  readonly imageAsideFields = computed(() =>
  this.config().fields.filter((field) => field.type === 'image'),
);

readonly mainFields = computed(() =>
  this.config().fields.filter((field) => field.type !== 'image'),
);

readonly isImageAsideLayout = computed(() =>
  this.config().layout === 'image-aside' &&
  this.imageAsideFields().length > 0,
);

  private readonly buildForm = effect((onCleanup) => {
    const form = this.dynamicFormBuilder.build(
      this.config(),
      this.initialValue() ?? {},
    );

    const syncFormState = (): void => {
      this.formInvalid.set(form.invalid);
      this.formValidationError.set(
        getFormError(this.config(), form),
      );
    };

    this.form.set(form);
    syncFormState();

    const subscription = merge(
      form.statusChanges,
      form.valueChanges,
    )
      .pipe(startWith(null))
      .subscribe(() => {
        syncFormState();
      });

    onCleanup(() => {
      subscription.unsubscribe();
    });
  });

  submit(): void {
    const form = this.form();

    if (form.invalid) {
      form.markAllAsTouched();
      this.formInvalid.set(true);
      this.formValidationError.set(
        getFormError(this.config(), form),
      );
      return;
    }

    this.submitted.emit(form.getRawValue());
  }
}
