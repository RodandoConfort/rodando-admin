import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-page-loader',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './page-loader.html',
  styleUrl: './page-loader.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageLoader {
  readonly title = input('Cargando información...');
  readonly description = input<string | null>(
    'Espera un momento mientras preparamos la vista.',
  );

  readonly minHeight = input('22rem');
}
