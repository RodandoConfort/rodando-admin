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
  buildUserKmOptions,
  buildUserSpendingOptions,
  buildUserSpendingShareOptions,
  buildUserTripsOptions,
} from '../../config/reports-users-chart-options';

interface UserReportsMetrics {
  usersCount: number;
  requestedTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  totalKm: number;
  totalSpent: number;
  averageTripValue: number;
  completionRate: number;
  cancellationRate: number;
}

@Component({
  selector: 'app-reports-users-page',
  standalone: true,
  imports: [
    MatIconModule,
    PageLoader,
    ReportsSegments,
    ReportsFiltersBar,
    ReportsMetricCard,
    ReportsChartCard,
  ],
  templateUrl: './reports-users-page.html',
  styleUrl: './reports-users-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsUsersPage {
  readonly store = inject(ReportsStore);

  readonly metrics = computed<UserReportsMetrics>(() => {
    const items = this.store.passengerUsage();

    const usersCount = items.length;

    const requestedTrips = items.reduce(
      (total, item) => total + Number(item.requestedTrips ?? 0),
      0,
    );

    const completedTrips = items.reduce(
      (total, item) => total + Number(item.completedTrips ?? 0),
      0,
    );

    const cancelledTrips = items.reduce(
      (total, item) => total + Number(item.cancelledTrips ?? 0),
      0,
    );

    const totalKm = items.reduce(
      (total, item) => total + Number(item.totalKm ?? 0),
      0,
    );

    const totalSpent = items.reduce(
      (total, item) => total + Number(item.totalSpent ?? 0),
      0,
    );

    return {
      usersCount,
      requestedTrips,
      completedTrips,
      cancelledTrips,
      totalKm,
      totalSpent,
      averageTripValue: completedTrips ? totalSpent / completedTrips : 0,
      completionRate: requestedTrips
        ? (completedTrips / requestedTrips) * 100
        : 0,
      cancellationRate: requestedTrips
        ? (cancelledTrips / requestedTrips) * 100
        : 0,
    };
  });

  readonly spendingOptions = computed(() =>
    buildUserSpendingOptions(this.store.passengerUsage()),
  );

  readonly tripsOptions = computed(() =>
    buildUserTripsOptions(this.store.passengerUsage()),
  );

  readonly kmOptions = computed(() =>
    buildUserKmOptions(this.store.passengerUsage()),
  );

  readonly spendingShareOptions = computed(() =>
    buildUserSpendingShareOptions(this.store.passengerUsage()),
  );

  readonly usageEmpty = computed(() => this.store.passengerUsage().length === 0);

  readonly spendingShareEmpty = computed(
    () =>
      this.store.passengerUsage().filter(
        (item) => Number(item.totalSpent ?? 0) > 0,
      ).length === 0,
  );

  private readonly enterPageEffect = effect(() => {
    this.store.enterUsers();
  });

  changePreset(preset: ReportPreset): void {
    const query = this.store.setPreset(preset);
    this.store.loadUserReports(query);
  }

  changeLimit(limit: number): void {
    const query = this.store.setLimit(limit);
    this.store.loadUserReports(query);
  }

  reload(): void {
    this.store.reloadUsers();
  }

  formatMoney(value: number | null | undefined): string {
    return `$ ${Number(value ?? 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
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

  userName(name: string | null | undefined, id: string): string {
    return name?.trim() || id.slice(0, 8);
  }
}