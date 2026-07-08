import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal, untracked } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { forkJoin, pipe, switchMap, tap } from 'rxjs';

import { ReportsHttp } from './reports.http';
import {
  DriverReportsData,
  FinanceReportsData,
  OperationsReportsData,
  REPORT_GROUP_BY_BY_PRESET,
  ReportPreset,
  ReportsQuery,
  UserReportsData,
  VehicleReportsData,
  SettlementDataQualityReport,
  ReportGroupBy,
  isGroupByAllowedForPreset,
} from './reports.models';

@Injectable()
export class ReportsStore {
  private readonly http = inject(ReportsHttp);

  private readonly querySignal = signal<ReportsQuery>({
    preset: 'last_30_days',
    groupBy: 'day',
    limit: 20,
    hourFrom: 0,
    hourTo: 23,
  });

  private readonly financeSignal = signal<FinanceReportsData | null>(null);
  private readonly driversSignal = signal<DriverReportsData | null>(null);
  private readonly vehiclesSignal = signal<VehicleReportsData | null>(null);
  private readonly usersSignal = signal<UserReportsData | null>(null);
  private readonly operationsSignal = signal<OperationsReportsData | null>(null);
  private readonly dataQualitySignal = signal<SettlementDataQualityReport | null>(null);

  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly query = this.querySignal.asReadonly();

  readonly finance = this.financeSignal.asReadonly();
  readonly drivers = this.driversSignal.asReadonly();
  readonly vehicles = this.vehiclesSignal.asReadonly();
  readonly users = this.usersSignal.asReadonly();
  readonly operations = this.operationsSignal.asReadonly();
  readonly dataQuality = this.dataQualitySignal.asReadonly();

  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly financeSummary = computed(() => this.financeSignal()?.summary ?? null);
  readonly financeTimeSeries = computed(() => this.financeSignal()?.timeSeries.items ?? []);
  readonly settlementQuality = computed(
    () => this.financeSignal()?.settlementQuality ?? this.dataQualitySignal() ?? null,
  );

  readonly driverPerformance = computed(() => this.driversSignal()?.performance.items ?? []);
  readonly driverQualityRanking = computed(() => this.driversSignal()?.qualityRanking.items ?? []);
  readonly driverWorstQualityRanking = computed(
    () => this.driversSignal()?.worstQualityRanking.items ?? [],
  );
  readonly driverActivityHours = computed(() => this.driversSignal()?.activityHours.items ?? []);

  readonly vehicleUsage = computed(() => this.vehiclesSignal()?.usage.items ?? []);

  readonly passengerUsage = computed(() => this.usersSignal()?.passengers.items ?? []);

  readonly tripStatusItems = computed(() => this.operationsSignal()?.tripStatus.items ?? []);

  readonly cancellationItems = computed(() => this.operationsSignal()?.cancellations.items ?? []);

  readonly operationsDriverActivity = computed(
    () => this.operationsSignal()?.driverActivity.items ?? [],
  );

  readonly loadFinanceReports = rxMethod<ReportsQuery>(
    pipe(
      tap(() => this.startLoading()),
      switchMap((query) =>
        forkJoin({
          summary: this.http.getFinanceSummary(query),
          timeSeries: this.http.getFinanceTimeSeries(query),
          settlementQuality: this.http.getSettlementDataQuality(query),
        }).pipe(
          tapResponse({
            next: (data) => this.financeSignal.set(data),
            error: (error: unknown) => this.errorSignal.set(this.getErrorMessage(error)),
            finalize: () => this.loadingSignal.set(false),
          }),
        ),
      ),
    ),
  );

  readonly loadDriverReports = rxMethod<ReportsQuery>(
    pipe(
      tap(() => this.startLoading()),
      switchMap((query) =>
        forkJoin({
          performance: this.http.getDriverPerformance(query),
          qualityRanking: this.http.getDriverQualityRanking(query),
          worstQualityRanking: this.http.getDriverWorstQualityRanking(query),
          activityHours: this.http.getDriverActivityHours(query),
        }).pipe(
          tapResponse({
            next: (data) => this.driversSignal.set(data),
            error: (error: unknown) => this.errorSignal.set(this.getErrorMessage(error)),
            finalize: () => this.loadingSignal.set(false),
          }),
        ),
      ),
    ),
  );

  readonly loadVehicleReports = rxMethod<ReportsQuery>(
    pipe(
      tap(() => this.startLoading()),
      switchMap((query) =>
        forkJoin({
          usage: this.http.getVehicleUsage(query),
        }).pipe(
          tapResponse({
            next: (data) => this.vehiclesSignal.set(data),
            error: (error: unknown) => this.errorSignal.set(this.getErrorMessage(error)),
            finalize: () => this.loadingSignal.set(false),
          }),
        ),
      ),
    ),
  );

  readonly loadUserReports = rxMethod<ReportsQuery>(
    pipe(
      tap(() => this.startLoading()),
      switchMap((query) =>
        forkJoin({
          passengers: this.http.getPassengerUsage(query),
        }).pipe(
          tapResponse({
            next: (data) => this.usersSignal.set(data),
            error: (error: unknown) => this.errorSignal.set(this.getErrorMessage(error)),
            finalize: () => this.loadingSignal.set(false),
          }),
        ),
      ),
    ),
  );

  readonly loadOperationsReports = rxMethod<ReportsQuery>(
    pipe(
      tap(() => this.startLoading()),
      switchMap((query) =>
        forkJoin({
          tripStatus: this.http.getTripStatusSummary(query),
          cancellations: this.http.getCancellationSummary(query),
          driverActivity: this.http.getDriverActivityHours(query),
        }).pipe(
          tapResponse({
            next: (data) => this.operationsSignal.set(data),
            error: (error: unknown) => this.errorSignal.set(this.getErrorMessage(error)),
            finalize: () => this.loadingSignal.set(false),
          }),
        ),
      ),
    ),
  );

  readonly loadDataQualityReport = rxMethod<ReportsQuery>(
    pipe(
      tap(() => this.startLoading()),
      switchMap((query) =>
        this.http.getSettlementDataQuality(query).pipe(
          tapResponse({
            next: (data) => this.dataQualitySignal.set(data),
            error: (error: unknown) => this.errorSignal.set(this.getErrorMessage(error)),
            finalize: () => this.loadingSignal.set(false),
          }),
        ),
      ),
    ),
  );

  enterFinance(): void {
    this.loadFinanceReports(untracked(() => this.querySignal()));
  }

  enterDrivers(): void {
    this.loadDriverReports(untracked(() => this.querySignal()));
  }

  enterVehicles(): void {
    this.loadVehicleReports(untracked(() => this.querySignal()));
  }

  enterUsers(): void {
    this.loadUserReports(untracked(() => this.querySignal()));
  }

  enterOperations(): void {
    this.loadOperationsReports(untracked(() => this.querySignal()));
  }

  enterDataQuality(): void {
    this.loadDataQualityReport(untracked(() => this.querySignal()));
  }

  setPreset(preset: ReportPreset): ReportsQuery {
  return this.patchQuery({
    preset,
    groupBy: REPORT_GROUP_BY_BY_PRESET[preset],
  });
}

  setGroupBy(groupBy: ReportGroupBy): ReportsQuery {
  const current = this.querySignal();

  if (!isGroupByAllowedForPreset(current.preset, groupBy)) {
    return this.patchQuery({
      groupBy: REPORT_GROUP_BY_BY_PRESET[current.preset],
    });
  }

  return this.patchQuery({
    groupBy,
  });
}

  setLimit(limit: number): ReportsQuery {
    return this.patchQuery({
      limit,
    });
  }

  setHours(hourFrom: number, hourTo: number): ReportsQuery {
    return this.patchQuery({
      hourFrom,
      hourTo,
    });
  }

  reloadFinance(): void {
    this.enterFinance();
  }

  reloadDrivers(): void {
    this.enterDrivers();
  }

  reloadVehicles(): void {
    this.enterVehicles();
  }

  reloadUsers(): void {
    this.enterUsers();
  }

  reloadOperations(): void {
    this.enterOperations();
  }

  reloadDataQuality(): void {
    this.enterDataQuality();
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  private startLoading(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
  }

  private patchQuery(patch: Partial<ReportsQuery>): ReportsQuery {
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

    return 'No se pudieron cargar los reportes.';
  }
}
