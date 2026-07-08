import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { EChartsCoreOption } from 'echarts/core';
import { NgxEchartsDirective } from 'ngx-echarts';

@Component({
  selector: 'app-reports-chart-card',
  standalone: true,
  imports: [MatIconModule, NgxEchartsDirective],
  templateUrl: './reports-chart-card.html',
  styleUrl: './reports-chart-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsChartCard {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly icon = input<string | null>(null);
  readonly options = input.required<EChartsCoreOption>();

  readonly empty = input(false);
  readonly emptyTitle = input('Sin datos');
  readonly emptyDescription = input('No hay información disponible para este rango.');
}