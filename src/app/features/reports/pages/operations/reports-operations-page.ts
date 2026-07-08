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
  buildCancellationOptions,
  buildDriverActivityByHourOptions,
  buildDriverActivityRankingOptions,
  buildTripStatusOptions,
  formatTripStatus,
} from '../../config/reports-operations-chart-options';

interface OperationsMetrics {
  totalTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  noDriversFoundTrips: number;
  completionRate: number;
  cancellationRate: number;
  activeDriversByTrips: number;
  activityCompletedTrips: number;
  activityGrossRevenue: number;
  activityKm: number;
}

@Component({
  selector: 'app-reports-operations-page',
  standalone: true,
  imports: [
    MatIconModule,
    PageLoader,
    ReportsSegments,
    ReportsFiltersBar,
    ReportsMetricCard,
    ReportsChartCard,
  ],
  templateUrl: './reports-operations-page.html',
  styleUrl: './reports-operations-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsOperationsPage {
  readonly store = inject(ReportsStore);

  readonly metrics = computed<OperationsMetrics>(() => {
    const statuses = this.store.tripStatusItems();
    const cancellations = this.store.cancellationItems();
    const activity = this.store.operationsDriverActivity();

    const totalTrips = statuses.reduce(
      (total, item) => total + Number(item.total ?? 0),
      0,
    );

    const completedTrips =
      statuses.find((item) => item.status === 'completed')?.total ?? 0;

    const cancelledTrips =
      statuses.find((item) => item.status === 'cancelled')?.total ??
      cancellations.find((item) => item.status === 'cancelled')?.total ??
      0;

    const noDriversFoundTrips =
      statuses.find((item) => item.status === 'no_drivers_found')?.total ??
      cancellations.find((item) => item.status === 'no_drivers_found')?.total ??
      0;

    const activeDriversByTrips = new Set(
      activity.map((item) => item.driverId),
    ).size;

    const activityCompletedTrips = activity.reduce(
      (total, item) => total + Number(item.completedTrips ?? 0),
      0,
    );

    const activityGrossRevenue = activity.reduce(
      (total, item) => total + Number(item.grossRevenue ?? 0),
      0,
    );

    const activityKm = activity.reduce(
      (total, item) => total + Number(item.totalKm ?? 0),
      0,
    );

    return {
      totalTrips,
      completedTrips: Number(completedTrips),
      cancelledTrips: Number(cancelledTrips),
      noDriversFoundTrips: Number(noDriversFoundTrips),
      completionRate: totalTrips
        ? (Number(completedTrips) / totalTrips) * 100
        : 0,
      cancellationRate: totalTrips
        ? ((Number(cancelledTrips) + Number(noDriversFoundTrips)) / totalTrips) *
          100
        : 0,
      activeDriversByTrips,
      activityCompletedTrips,
      activityGrossRevenue,
      activityKm,
    };
  });

  readonly tripStatusOptions = computed(() =>
    buildTripStatusOptions(this.store.tripStatusItems()),
  );

  readonly cancellationOptions = computed(() =>
    buildCancellationOptions(this.store.cancellationItems()),
  );

  readonly activityByHourOptions = computed(() =>
    buildDriverActivityByHourOptions(this.store.operationsDriverActivity()),
  );

  readonly activityRankingOptions = computed(() =>
    buildDriverActivityRankingOptions(this.store.operationsDriverActivity()),
  );

  readonly tripStatusEmpty = computed(
    () => this.store.tripStatusItems().length === 0,
  );

  readonly cancellationEmpty = computed(
    () => this.store.cancellationItems().length === 0,
  );

  readonly activityEmpty = computed(
    () => this.store.operationsDriverActivity().length === 0,
  );

  private readonly enterPageEffect = effect(() => {
    this.store.enterOperations();
  });

  changePreset(preset: ReportPreset): void {
    const query = this.store.setPreset(preset);
    this.store.loadOperationsReports(query);
  }

  changeLimit(limit: number): void {
    const query = this.store.setLimit(limit);
    this.store.loadOperationsReports(query);
  }

  changeHours(range: ReportsHourRange): void {
    const query = this.store.setHours(range.hourFrom, range.hourTo);
    this.store.loadOperationsReports(query);
  }

  reload(): void {
    this.store.reloadOperations();
  }

  formatNumber(value: number | null | undefined): string {
    return Number(value ?? 0).toLocaleString('en-US', {
      maximumFractionDigits: 2,
    });
  }

  formatInteger(value: number | null | undefined): string {
    return Number(value ?? 0).toLocaleString('en-US', {
      maximumFractionDigits: 0,
    });
  }

  formatMoney(value: number | null | undefined): string {
    return `$ ${Number(value ?? 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
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

  formatHour(value: number | null | undefined): string {
    const hour = Number(value ?? 0);

    return `${String(hour).padStart(2, '0')}:00`;
  }

  driverName(name: string | null | undefined, id: string): string {
    return name?.trim() || id.slice(0, 8);
  }

  formatTripStatus(status: string): string {
    return formatTripStatus(status);
  }
}