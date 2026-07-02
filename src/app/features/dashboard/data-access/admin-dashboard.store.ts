import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal, untracked } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { forkJoin, pipe, switchMap, tap } from 'rxjs';

import { AdminDashboardHttp } from './admin-dashboard.http';
import {
  AdminDashboardData,
  DashboardReportsQuery,
  REPORT_GROUP_BY_BY_PRESET,
  ReportPreset,
} from './admin-dashboard.models';

@Injectable()
export class AdminDashboardStore {
  private readonly http = inject(AdminDashboardHttp);

  private readonly querySignal = signal<DashboardReportsQuery>({
    preset: 'last_30_days',
    groupBy: 'day',
  });

  private readonly dataSignal = signal<AdminDashboardData | null>(null);

  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly query = this.querySignal.asReadonly();
  readonly data = this.dataSignal.asReadonly();

  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly overview = computed(() => this.dataSignal()?.overview ?? null);

  readonly financeTimeSeries = computed(
    () => this.dataSignal()?.financeTimeSeries ?? null,
  );

  readonly financeItems = computed(
    () => this.dataSignal()?.financeTimeSeries.items ?? [],
  );

  readonly tripStatusSummary = computed(
    () => this.dataSignal()?.tripStatusSummary ?? null,
  );

  readonly tripStatusItems = computed(
    () => this.dataSignal()?.tripStatusSummary.items ?? [],
  );

  readonly driverPerformance = computed(
    () => this.dataSignal()?.driverPerformance ?? null,
  );

  readonly topDrivers = computed(
    () => this.dataSignal()?.driverPerformance.items ?? [],
  );

  readonly vehicleUsage = computed(
    () => this.dataSignal()?.vehicleUsage ?? null,
  );

  readonly vehicleUsageItems = computed(
    () => this.dataSignal()?.vehicleUsage.items ?? [],
  );

  readonly passengerUsage = computed(
    () => this.dataSignal()?.passengerUsage ?? null,
  );

  readonly topPassengers = computed(
    () => this.dataSignal()?.passengerUsage.items ?? [],
  );

  readonly settlementDataQuality = computed(
    () => this.dataSignal()?.settlementDataQuality ?? null,
  );

  readonly hasData = computed(() => this.dataSignal() !== null);

  readonly loadDashboard = rxMethod<DashboardReportsQuery>(
    pipe(
      tap(() => {
        this.loadingSignal.set(true);
        this.errorSignal.set(null);
      }),
      switchMap((query) =>
        forkJoin({
          overview: this.http.getOverview(query),
          financeTimeSeries: this.http.getFinanceTimeSeries(query),
          tripStatusSummary: this.http.getTripStatusSummary(query),
          driverPerformance: this.http.getDriverPerformance(query, 5),
          vehicleUsage: this.http.getVehicleUsage(query, 5),
          passengerUsage: this.http.getPassengerUsage(query, 5),
          settlementDataQuality: this.http.getSettlementDataQuality(query),
        }).pipe(
          tapResponse({
            next: (data) => {
              this.dataSignal.set(data);
            },
            error: (error: unknown) => {
              this.errorSignal.set(this.getErrorMessage(error));
            },
            finalize: () => {
              this.loadingSignal.set(false);
            },
          }),
        ),
      ),
    ),
  );

  enterDashboard(): void {
    this.loadDashboard(untracked(() => this.querySignal()));
  }

  reloadDashboard(): void {
    this.loadDashboard(untracked(() => this.querySignal()));
  }

  setPreset(preset: ReportPreset): void {
    const query = this.patchQuery({
      preset,
      groupBy: REPORT_GROUP_BY_BY_PRESET[preset],
    });

    this.loadDashboard(query);
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  private patchQuery(
    patch: Partial<DashboardReportsQuery>,
  ): DashboardReportsQuery {
    const query = {
      ...this.querySignal(),
      ...patch,
    };

    this.querySignal.set(query);

    return query;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const backendMessage = error.error?.message;

      if (typeof backendMessage === 'string') {
        return backendMessage;
      }

      if (Array.isArray(backendMessage)) {
        return backendMessage.join(' ');
      }

      return error.message || 'Ha ocurrido un error de red.';
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof error.message === 'string'
    ) {
      return error.message;
    }

    return 'No se pudieron cargar los reportes del dashboard.';
  }
}
