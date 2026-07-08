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
import {
  ReportGroupBy,
  ReportPreset,
} from '../../data-access/reports.models';
import { ReportsStore } from '../../data-access/reports.store';
import {
  buildAverageTicketOptions,
  buildFinanceCompositionOptions,
  buildFinanceRevenueOptions,
  buildSettlementQualityOptions,
} from '../../config/reports-finance-chart-options';

@Component({
  selector: 'app-reports-finance-page',
  standalone: true,
  imports: [
    MatIconModule,
    PageLoader,
    ReportsSegments,
    ReportsFiltersBar,
    ReportsMetricCard,
    ReportsChartCard,
  ],
  templateUrl: './reports-finance-page.html',
  styleUrl: './reports-finance-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsFinancePage {
  readonly store = inject(ReportsStore);

  readonly summary = this.store.financeSummary;
  readonly settlementQuality = this.store.settlementQuality;

  readonly revenueOptions = computed(() =>
    buildFinanceRevenueOptions(this.store.financeTimeSeries()),
  );

  readonly averageTicketOptions = computed(() =>
    buildAverageTicketOptions(this.store.financeTimeSeries()),
  );

  readonly compositionOptions = computed(() =>
    buildFinanceCompositionOptions(this.summary()),
  );

  readonly settlementOptions = computed(() =>
    buildSettlementQualityOptions(this.settlementQuality()),
  );

  readonly timeSeriesEmpty = computed(
    () => this.store.financeTimeSeries().length === 0,
  );

  readonly compositionEmpty = computed(() => {
    const summary = this.summary();

    if (!summary) {
      return true;
    }

    return (
      Number(summary.platformRevenue ?? 0) === 0 &&
      Number(summary.driverEarnings ?? 0) === 0 &&
      Number(summary.discountsTotal ?? 0) === 0 &&
      Number(summary.bookingFeesTotal ?? 0) === 0 &&
      Number(summary.extraFeesTotal ?? 0) === 0
    );
  });

  readonly settlementEmpty = computed(() => {
    const quality = this.settlementQuality();

    if (!quality) {
      return true;
    }

    return Number(quality.completedTrips ?? 0) === 0;
  });

  private readonly enterPageEffect = effect(() => {
    this.store.enterFinance();
  });

  changePreset(preset: ReportPreset): void {
    const query = this.store.setPreset(preset);
    this.store.loadFinanceReports(query);
  }

  changeGroupBy(groupBy: ReportGroupBy): void {
    const query = this.store.setGroupBy(groupBy);
    this.store.loadFinanceReports(query);
  }

  reload(): void {
    this.store.reloadFinance();
  }

  formatMoney(value: number | null | undefined): string {
    return `$ ${Number(value ?? 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  formatNumber(value: number | null | undefined): string {
    return Number(value ?? 0).toLocaleString('en-US');
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