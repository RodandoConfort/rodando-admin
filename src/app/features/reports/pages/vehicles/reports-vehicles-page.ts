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
  buildVehicleKmOptions,
  buildVehicleRevenueOptions,
  buildVehicleRevenueShareOptions,
  buildVehicleTripsMinutesOptions,
} from '../../config/reports-vehicles-chart-options';

interface VehicleReportsMetrics {
  vehiclesCount: number;
  completedTrips: number;
  totalKm: number;
  totalMinutes: number;
  grossRevenue: number;
  averageKmPerVehicle: number;
  averageTripsPerVehicle: number;
  averageRevenuePerVehicle: number;
}

@Component({
  selector: 'app-reports-vehicles-page',
  standalone: true,
  imports: [
    MatIconModule,
    PageLoader,
    ReportsSegments,
    ReportsFiltersBar,
    ReportsMetricCard,
    ReportsChartCard,
  ],
  templateUrl: './reports-vehicles-page.html',
  styleUrl: './reports-vehicles-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsVehiclesPage {
  readonly store = inject(ReportsStore);

  readonly metrics = computed<VehicleReportsMetrics>(() => {
    const items = this.store.vehicleUsage();

    const vehiclesCount = items.length;

    const completedTrips = items.reduce(
      (total, item) => total + Number(item.completedTrips ?? 0),
      0,
    );

    const totalKm = items.reduce(
      (total, item) => total + Number(item.totalKm ?? 0),
      0,
    );

    const totalMinutes = items.reduce(
      (total, item) => total + Number(item.totalMinutes ?? 0),
      0,
    );

    const grossRevenue = items.reduce(
      (total, item) => total + Number(item.grossRevenue ?? 0),
      0,
    );

    return {
      vehiclesCount,
      completedTrips,
      totalKm,
      totalMinutes,
      grossRevenue,
      averageKmPerVehicle: vehiclesCount ? totalKm / vehiclesCount : 0,
      averageTripsPerVehicle: vehiclesCount
        ? completedTrips / vehiclesCount
        : 0,
      averageRevenuePerVehicle: vehiclesCount
        ? grossRevenue / vehiclesCount
        : 0,
    };
  });

  readonly kmOptions = computed(() =>
    buildVehicleKmOptions(this.store.vehicleUsage()),
  );

  readonly revenueOptions = computed(() =>
    buildVehicleRevenueOptions(this.store.vehicleUsage()),
  );

  readonly tripsMinutesOptions = computed(() =>
    buildVehicleTripsMinutesOptions(this.store.vehicleUsage()),
  );

  readonly revenueShareOptions = computed(() =>
    buildVehicleRevenueShareOptions(this.store.vehicleUsage()),
  );

  readonly usageEmpty = computed(() => this.store.vehicleUsage().length === 0);

  readonly revenueShareEmpty = computed(
    () =>
      this.store.vehicleUsage().filter(
        (item) => Number(item.grossRevenue ?? 0) > 0,
      ).length === 0,
  );

  private readonly enterPageEffect = effect(() => {
    this.store.enterVehicles();
  });

  changePreset(preset: ReportPreset): void {
    const query = this.store.setPreset(preset);
    this.store.loadVehicleReports(query);
  }

  changeLimit(limit: number): void {
    const query = this.store.setLimit(limit);
    this.store.loadVehicleReports(query);
  }

  reload(): void {
    this.store.reloadVehicles();
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

  formatMinutes(value: number | null | undefined): string {
    return `${Number(value ?? 0).toLocaleString('en-US', {
      maximumFractionDigits: 0,
    })} min`;
  }

  formatHours(value: number | null | undefined): string {
    const minutes = Number(value ?? 0);
    const hours = minutes / 60;

    return `${hours.toLocaleString('en-US', {
      maximumFractionDigits: 1,
    })} h`;
  }

  vehicleName(label: string | null | undefined, id: string): string {
    return label?.trim() || id.slice(0, 8);
  }
}