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
import {
  ReportsFiltersBar,
  ReportsHourRange,
} from '../../components/reports-filters-bar/reports-filters-bar';
import { ReportsMetricCard } from '../../components/reports-metric-card/reports-metric-card';
import { ReportsSegments } from '../../components/reports-segments/reports-segments';
import { ReportPreset } from '../../data-access/reports.models';
import { ReportsStore } from '../../data-access/reports.store';
import {
  buildDriverActivityHoursOptions,
  buildDriverOffersOptions,
  buildDriverQualityOptions,
  buildDriverRevenueOptions,
  buildDriverWorstQualityOptions,
} from '../../config/reports-drivers-chart-options';

interface DriverReportsMetrics {
  completedTrips: number;
  grossRevenue: number;
  platformRevenue: number;
  driverEarnings: number;
  totalKm: number;
  averageAcceptanceRate: number;
  averageCancellationRate: number;
  averageCompletionRate: number;
  averageRating: number;
  totalOffersReceived: number;
  totalOffersAccepted: number;
  totalOffersRejected: number;
}

@Component({
  selector: 'app-reports-drivers-page',
  standalone: true,
  imports: [
    MatIconModule,
    PageLoader,
    ReportsSegments,
    ReportsFiltersBar,
    ReportsMetricCard,
    ReportsChartCard,
  ],
  templateUrl: './reports-drivers-page.html',
  styleUrl: './reports-drivers-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsDriversPage {
  readonly store = inject(ReportsStore);

  readonly metrics = computed<DriverReportsMetrics>(() => {
    const items = this.store.driverPerformance();

    const completedTrips = items.reduce(
      (total, item) => total + Number(item.completedTrips ?? 0),
      0,
    );

    const grossRevenue = items.reduce(
      (total, item) => total + Number(item.grossRevenue ?? 0),
      0,
    );

    const platformRevenue = items.reduce(
      (total, item) => total + Number(item.platformRevenue ?? 0),
      0,
    );

    const driverEarnings = items.reduce(
      (total, item) => total + Number(item.driverEarnings ?? 0),
      0,
    );

    const totalKm = items.reduce(
      (total, item) => total + Number(item.totalKm ?? 0),
      0,
    );

    const totalOffersReceived = items.reduce(
      (total, item) => total + Number(item.totalOffersReceived ?? 0),
      0,
    );

    const totalOffersAccepted = items.reduce(
      (total, item) => total + Number(item.totalOffersAccepted ?? 0),
      0,
    );

    const totalOffersRejected = items.reduce(
      (total, item) => total + Number(item.totalOffersRejected ?? 0),
      0,
    );

    return {
      completedTrips,
      grossRevenue,
      platformRevenue,
      driverEarnings,
      totalKm,
      totalOffersReceived,
      totalOffersAccepted,
      totalOffersRejected,
      averageAcceptanceRate: this.average(
        items.map((item) => item.acceptanceRate),
      ),
      averageCancellationRate: this.average(
        items.map((item) => item.cancellationRate),
      ),
      averageCompletionRate: this.average(
        items.map((item) => item.completionRate),
      ),
      averageRating: this.average(items.map((item) => item.averageRating)),
    };
  });

  readonly revenueOptions = computed(() =>
    buildDriverRevenueOptions(this.store.driverPerformance()),
  );

  readonly qualityOptions = computed(() =>
    buildDriverQualityOptions(this.store.driverQualityRanking()),
  );

  readonly worstQualityOptions = computed(() =>
    buildDriverWorstQualityOptions(this.store.driverWorstQualityRanking()),
  );

  readonly offersOptions = computed(() =>
    buildDriverOffersOptions(this.store.driverPerformance()),
  );

  readonly activityHoursOptions = computed(() =>
    buildDriverActivityHoursOptions(this.store.driverActivityHours()),
  );

  readonly performanceEmpty = computed(
    () => this.store.driverPerformance().length === 0,
  );

  readonly qualityEmpty = computed(
    () => this.store.driverQualityRanking().length === 0,
  );

  readonly worstQualityEmpty = computed(
    () => this.store.driverWorstQualityRanking().length === 0,
  );

  readonly activityEmpty = computed(
    () => this.store.driverActivityHours().length === 0,
  );

  private readonly enterPageEffect = effect(() => {
    this.store.enterDrivers();
  });

  changePreset(preset: ReportPreset): void {
    const query = this.store.setPreset(preset);
    this.store.loadDriverReports(query);
  }

  changeLimit(limit: number): void {
    const query = this.store.setLimit(limit);
    this.store.loadDriverReports(query);
  }

  changeHours(range: ReportsHourRange): void {
    const query = this.store.setHours(range.hourFrom, range.hourTo);
    this.store.loadDriverReports(query);
  }

  reload(): void {
    this.store.reloadDrivers();
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

  formatKm(value: number | null | undefined): string {
    return `${Number(value ?? 0).toLocaleString('en-US', {
      maximumFractionDigits: 2,
    })} km`;
  }

  formatPercent(value: number | null | undefined): string {
    return `${Number(value ?? 0).toLocaleString('en-US', {
      maximumFractionDigits: 2,
    })}%`;
  }

  formatRating(value: number | null | undefined): string {
    return Number(value ?? 0).toLocaleString('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    });
  }

  formatHour(value: number | null | undefined): string {
    const hour = Number(value ?? 0);

    return `${String(hour).padStart(2, '0')}:00`;
  }

  driverName(name: string | null | undefined, id: string): string {
    return name?.trim() || id.slice(0, 8);
  }

  private average(values: Array<number | null | undefined>): number {
    const validValues = values
      .map((value) => Number(value ?? 0))
      .filter((value) => Number.isFinite(value));

    if (!validValues.length) {
      return 0;
    }

    const total = validValues.reduce((sum, value) => sum + value, 0);

    return total / validValues.length;
  }
}