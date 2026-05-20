import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { getControlError } from '../../form-errors';
import { DynamicFieldConfig } from '../../form.types';

@Component({
  selector: 'app-image-field',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './image-field.html',
  styleUrl: './image-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageField {
  readonly field = input.required<DynamicFieldConfig>();
  readonly control = input.required<FormControl>();

  readonly previewUrl = signal<string | null>(null);

  readonly currentPreviewUrl = computed(() => {
    const localPreview = this.previewUrl();

    if (localPreview) {
      return localPreview;
    }

    const controlValue = this.control().value;

    if (typeof controlValue === 'string' && controlValue.trim()) {
      return controlValue;
    }

    return this.field().previewUrl ?? null;
  });

  readonly errorMessage = computed(() => getControlError(this.field(), this.control()));

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0];

    if (!file) {
      return;
    }

    this.control().setValue(file);
    this.control().markAsDirty();
    this.control().markAsTouched();

    this.previewUrl.set(URL.createObjectURL(file));
  }

  clear(): void {
    this.control().setValue(null);
    this.control().markAsDirty();
    this.control().markAsTouched();
    this.previewUrl.set(null);
  }
}
