import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';

import { PageLoader } from '../../../shared/feedback/page-loader/page-loader';

import { DashboardChartCard } from '../components/dashboard-chart-card/dashboard-chart-card';
import { DashboardMetricCard } from '../components/dashboard-metric-card/dashboard-metric-card';
import {
  REPORT_PRESET_OPTIONS,
  ReportPreset,
} from '../data-access/admin-dashboard.models';
import { AdminDashboardStore } from '../data-access/admin-dashboard.store';
import {
  buildFinanceChartOptions,
  buildTopDriversChartOptions,
  buildTripStatusChartOptions,
  buildVehicleUsageChartOptions,
  formatTripStatus,
  shortId,
} from '../config/dashboard-chart-options';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    PageLoader,
    DashboardMetricCard,
    DashboardChartCard,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  readonly store = inject(AdminDashboardStore);

  readonly presetOptions = REPORT_PRESET_OPTIONS;
  readonly overview = this.store.overview;

  readonly financeOptions = computed(() =>
    buildFinanceChartOptions(this.store.financeItems()),
  );

  readonly tripStatusOptions = computed(() =>
    buildTripStatusChartOptions(this.store.tripStatusItems()),
  );

  readonly vehicleOptions = computed(() =>
    buildVehicleUsageChartOptions(this.store.vehicleUsageItems()),
  );

  readonly driversOptions = computed(() =>
    buildTopDriversChartOptions(this.store.topDrivers()),
  );

  readonly financeEmpty = computed(() => this.store.financeItems().length === 0);
  readonly tripStatusEmpty = computed(
    () => this.store.tripStatusItems().length === 0,
  );
  readonly vehicleUsageEmpty = computed(
    () => this.store.vehicleUsageItems().length === 0,
  );
  readonly driversEmpty = computed(() => this.store.topDrivers().length === 0);

  private readonly enterPageEffect = effect(() => {
    this.store.enterDashboard();
  });

  changePreset(event: MatSelectChange): void {
    this.store.setPreset(event.value as ReportPreset);
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

  formatMinutes(value: number | null | undefined): string {
    return `${Number(value ?? 0).toLocaleString('en-US', {
      maximumFractionDigits: 0,
    })} min`;
  }

  formatPercent(value: number | null | undefined): string {
    return `${Number(value ?? 0).toLocaleString('en-US', {
      maximumFractionDigits: 2,
    })}%`;
  }

  shortId(value: string | null | undefined): string {
    return shortId(value);
  }

  formatTripStatus(status: string): string {
    return formatTripStatus(status);
  }
}
