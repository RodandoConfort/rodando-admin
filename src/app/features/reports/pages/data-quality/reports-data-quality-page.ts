import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { PageLoader } from '../../../../shared/feedback/page-loader/page-loader';

import { ReportsChartCard } from '../../components/reports-chart-card/reports-chart-card';
import { ReportsFiltersBar } from '../../components/reports-filters-bar/reports-filters-bar';
import { ReportsMetricCard } from '../../components/reports-metric-card/reports-metric-card';
import { ReportsSegments } from '../../components/reports-segments/reports-segments';
import { ReportPreset } from '../../data-access/reports.models';
import { ReportsStore } from '../../data-access/reports.store';
import {
  buildSettlementQualityBarsOptions,
  buildSettlementQualityDonutOptions,
} from '../../config/reports-data-quality-chart-options';

@Component({
  selector: 'app-reports-data-quality-page',
  standalone: true,
  imports: [
    MatIconModule,
    PageLoader,
    ReportsSegments,
    ReportsFiltersBar,
    ReportsMetricCard,
    ReportsChartCard,
  ],
  templateUrl: './reports-data-quality-page.html',
  styleUrl: './reports-data-quality-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsDataQualityPage {
  readonly store = inject(ReportsStore);

  readonly quality = this.store.dataQuality;

  readonly coverageRate = computed(() => {
    const quality = this.quality();

    if (!quality?.completedTrips) {
      return 0;
    }

    return (quality.withSettlementTrips / quality.completedTrips) * 100;
  });

  readonly missingRate = computed(() => {
    const quality = this.quality();

    if (!quality?.completedTrips) {
      return 0;
    }

    return (quality.missingSettlementTrips / quality.completedTrips) * 100;
  });

  readonly donutOptions = computed(() =>
    buildSettlementQualityDonutOptions(this.quality()),
  );

  readonly barsOptions = computed(() =>
    buildSettlementQualityBarsOptions(this.quality()),
  );

  readonly empty = computed(() => {
    const quality = this.quality();

    return !quality || Number(quality.completedTrips ?? 0) === 0;
  });

  private readonly enterPageEffect = effect(() => {
    this.store.enterDataQuality();
  });

  changePreset(preset: ReportPreset): void {
    const query = this.store.setPreset(preset);
    this.store.loadDataQualityReport(query);
  }

  reload(): void {
    this.store.reloadDataQuality();
  }

  formatNumber(value: number | null | undefined): string {
    return Number(value ?? 0).toLocaleString('en-US', {
      maximumFractionDigits: 0,
    });
  }

  formatPercent(value: number | null | undefined): string {
    return `${Number(value ?? 0).toLocaleString('en-US', {
      maximumFractionDigits: 2,
    })}%`;
  }

  formatDate(value: string | null | undefined): string {
    if (!value) {
      return 'N/A';
    }

    return new Date(value).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}