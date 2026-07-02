import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type DashboardMetricTone =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral';

@Component({
  selector: 'app-dashboard-metric-card',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './dashboard-metric-card.html',
  styleUrl: './dashboard-metric-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardMetricCard {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly hint = input<string | null>(null);
  readonly icon = input<string | null>(null);
  readonly tone = input<DashboardMetricTone>('neutral');
}
