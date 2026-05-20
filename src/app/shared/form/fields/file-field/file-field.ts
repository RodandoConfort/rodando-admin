import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { getControlError } from '../../form-errors';
import { DynamicFieldConfig } from '../../form.types';

@Component({
  selector: 'app-file-field',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './file-field.html',
  styleUrl: './file-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileField {
  readonly field = input.required<DynamicFieldConfig>();
  readonly control = input.required<FormControl>();

  readonly fileName = signal<string | null>(null);

  readonly errorMessage = computed(() =>
    getControlError(this.field(), this.control()),
  );

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const files = inputElement.files;

    if (!files || files.length === 0) {
      return;
    }

    const value = this.field().multiple ? Array.from(files) : files[0];

    this.control().setValue(value);
    this.control().markAsDirty();
    this.control().markAsTouched();

    this.fileName.set(
      this.field().multiple
        ? `${files.length} archivos seleccionados`
        : files[0].name,
    );
  }

  clear(): void {
    this.control().setValue(null);
    this.control().markAsDirty();
    this.fileName.set(null);
  }
}
