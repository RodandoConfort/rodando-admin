import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-submit-button',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './submit-button.html',
  styleUrl: './submit-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.submit-button-host--full]': 'fullWidth()',
  },
})
export class SubmitButton {
  readonly label = input('Guardar');
  readonly loadingLabel = input('Guardando...');
  readonly icon = input<string | null>(null);
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly fullWidth = input(false);
  readonly type = input<'button' | 'submit'>('submit');
}