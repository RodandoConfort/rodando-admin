import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type ReportsMetricTone =
  | 'primary'
  | 'accent'
  | 'warning'
  | 'danger'
  | 'neutral';

@Component({
  selector: 'app-reports-metric-card',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './reports-metric-card.html',
  styleUrl: './reports-metric-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsMetricCard {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly hint = input<string | null>(null);
  readonly icon = input<string | null>(null);
  readonly tone = input<ReportsMetricTone>('neutral');
}