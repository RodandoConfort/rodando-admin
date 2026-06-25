import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal, untracked } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, forkJoin, pipe, switchMap, tap, exhaustMap } from 'rxjs';

import { PaginationMeta } from '../../../../core/api/pagination.model';

import { VehiclesHttp } from './vehicles.http';
import {
  SelectOption,
  UpdateVehiclePayload,
  Vehicle,
  VehicleStatus,
  VehiclesQuery,
} from './vehicles.models';

interface UpdateVehicleCommand {
  id: string;
  payload: UpdateVehiclePayload;
}

const EMPTY_PAGINATION_META: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 10,
  pageCount: 0,
  hasNext: false,
  hasPrev: false,
  nextPage: null,
  prevPage: null,
};

@Injectable()
export class VehiclesStore {
  private readonly vehiclesHttp = inject(VehiclesHttp);

  private readonly querySignal = signal<VehiclesQuery>({
    page: 1,
    limit: 10,
  });

  private readonly vehiclesSignal = signal<readonly Vehicle[]>([]);
  private readonly paginationSignal = signal<PaginationMeta>(
    EMPTY_PAGINATION_META,
  );

  private readonly listLoadingSignal = signal(false);
  private readonly listErrorSignal = signal<string | null>(null);

  readonly query = this.querySignal.asReadonly();
  readonly vehicles = this.vehiclesSignal.asReadonly();
  readonly pagination = this.paginationSignal.asReadonly();
  readonly listLoading = this.listLoadingSignal.asReadonly();
  readonly listError = this.listErrorSignal.asReadonly();

  readonly hasVehicles = computed(() => this.vehiclesSignal().length > 0);

  private readonly categoryOptionsSignal = signal<readonly SelectOption[]>([]);
  private readonly serviceClassOptionsSignal = signal<readonly SelectOption[]>([]);
  private readonly vehicleTypeOptionsSignal = signal<readonly SelectOption[]>([]);

  private readonly catalogsLoadingSignal = signal(false);
  private readonly catalogsErrorSignal = signal<string | null>(null);

  readonly categoryOptions = this.categoryOptionsSignal.asReadonly();
  readonly serviceClassOptions = this.serviceClassOptionsSignal.asReadonly();
  readonly vehicleTypeOptions = this.vehicleTypeOptionsSignal.asReadonly();
  readonly catalogsLoading = this.catalogsLoadingSignal.asReadonly();
  readonly catalogsError = this.catalogsErrorSignal.asReadonly();

  readonly loadVehicles = rxMethod<VehiclesQuery>(
    pipe(
      tap(() => {
        this.listLoadingSignal.set(true);
        this.listErrorSignal.set(null);
      }),
      switchMap((query) =>
        this.vehiclesHttp.getVehicles(query).pipe(
          tapResponse({
            next: (response) => {
              this.vehiclesSignal.set(response.items);
              this.paginationSignal.set(response.meta);
            },
            error: (error: unknown) => {
              this.listErrorSignal.set(this.getErrorMessage(error));
            },
            finalize: () => {
              this.listLoadingSignal.set(false);
            },
          }),
        ),
      ),
    ),
  );

  readonly loadCatalogOptions = rxMethod<void>(
    pipe(
      tap(() => {
        this.catalogsLoadingSignal.set(true);
        this.catalogsErrorSignal.set(null);
      }),
      switchMap(() =>
        forkJoin({
          categories: this.vehiclesHttp.getCategoryOptions(),
          serviceClasses: this.vehiclesHttp.getServiceClassOptions(),
          vehicleTypes: this.vehiclesHttp.getVehicleTypeOptions(),
        }).pipe(
          tapResponse({
            next: ({ categories, serviceClasses, vehicleTypes }) => {
              this.categoryOptionsSignal.set(
                categories.map((category) => ({
                  label: category.name,
                  value: category.id,
                })),
              );

              this.serviceClassOptionsSignal.set(
                serviceClasses.map((serviceClass) => ({
                  label: serviceClass.name,
                  value: serviceClass.id,
                })),
              );

              this.vehicleTypeOptionsSignal.set(
                vehicleTypes.map((type) => ({
                  label: type.name,
                  value: type.id,
                })),
              );
            },
            error: (error: unknown) => {
              this.catalogsErrorSignal.set(this.getErrorMessage(error));
            },
            finalize: () => {
              this.catalogsLoadingSignal.set(false);
            },
          }),
        ),
      ),
    ),
  );

  readonly searchVehicles = rxMethod<string>(
    pipe(
      debounceTime(300),
      tap((term) => {
        const query = this.patchQuery({
          page: 1,
          search: term.trim() || undefined,
        });

        this.loadVehicles(query);
      }),
    ),
  );

  enterVehiclesList(): void {
    const query = untracked(() => this.querySignal());

    this.loadCatalogOptions();
    this.loadVehicles(query);
  }

  reloadVehicles(): void {
    const query = untracked(() => this.querySignal());
    this.loadVehicles(query);
  }

  loadFormCatalogs(): void {
    this.loadCatalogOptions();
  }

  setCategoryFilter(categoryId: string | null): void {
    const query = this.patchQuery({
      page: 1,
      categoryId,
      vehicleTypeId: null,
    });

    this.loadVehicles(query);
  }

  setServiceClassFilter(serviceClassId: string | null): void {
    const query = this.patchQuery({
      page: 1,
      serviceClassId,
      vehicleTypeId: null,
    });

    this.loadVehicles(query);
  }

  setVehicleTypeFilter(vehicleTypeId: string | null): void {
    const query = this.patchQuery({
      page: 1,
      vehicleTypeId,
    });

    this.loadVehicles(query);
  }

  setStatusFilter(status: VehicleStatus | null): void {
    const query = this.patchQuery({
      page: 1,
      status,
    });

    this.loadVehicles(query);
  }

  setActiveFilter(isActive: boolean | null): void {
    const query = this.patchQuery({
      page: 1,
      isActive,
    });

    this.loadVehicles(query);
  }

  setPage(page: number, limit: number): void {
    const query = this.patchQuery({
      page,
      limit,
    });

    this.loadVehicles(query);
  }

  private readonly selectedVehicleSignal = signal<Vehicle | null>(null);
  private readonly detailLoadingSignal = signal(false);
  private readonly detailErrorSignal = signal<string | null>(null);

  readonly selectedVehicle = this.selectedVehicleSignal.asReadonly();
  readonly detailLoading = this.detailLoadingSignal.asReadonly();
  readonly detailError = this.detailErrorSignal.asReadonly();

  readonly loadVehicleDetail = rxMethod<string>(
    pipe(
      tap(() => {
        this.detailLoadingSignal.set(true);
        this.detailErrorSignal.set(null);
        this.selectedVehicleSignal.set(null);
      }),
      switchMap((id) =>
        this.vehiclesHttp.getVehicleById(id).pipe(
          tapResponse({
            next: (vehicle) => {
              this.selectedVehicleSignal.set(vehicle);
            },
            error: (error: unknown) => {
              this.detailErrorSignal.set(this.getErrorMessage(error));
            },
            finalize: () => {
              this.detailLoadingSignal.set(false);
            },
          }),
        ),
      ),
    ),
  );

  clearSelectedVehicle(): void {
    this.selectedVehicleSignal.set(null);
    this.detailErrorSignal.set(null);
  }

  private readonly updateSavingSignal = signal(false);
  private readonly updateErrorSignal = signal<string | null>(null);
  private readonly updatedVehicleSignal = signal<Vehicle | null>(null);

  readonly updateSaving = this.updateSavingSignal.asReadonly();
  readonly updateError = this.updateErrorSignal.asReadonly();
  readonly updatedVehicle = this.updatedVehicleSignal.asReadonly();

  readonly updateVehicle = rxMethod<UpdateVehicleCommand>(
    pipe(
      tap(() => {
        this.updateSavingSignal.set(true);
        this.updateErrorSignal.set(null);
        this.updatedVehicleSignal.set(null);
      }),
      exhaustMap(({ id, payload }) =>
        this.vehiclesHttp.updateVehicle(id, payload).pipe(
          tapResponse({
            next: (vehicle) => {
              this.updatedVehicleSignal.set(vehicle);
              this.selectedVehicleSignal.set(vehicle);
              this.reloadVehicles();
            },
            error: (error: unknown) => {
              this.updateErrorSignal.set(this.getErrorMessage(error));
            },
            finalize: () => {
              this.updateSavingSignal.set(false);
            },
          }),
        ),
      ),
    ),
  );

  clearUpdateState(): void {
    this.updateErrorSignal.set(null);
    this.updatedVehicleSignal.set(null);
  }

  private patchQuery(patch: Partial<VehiclesQuery>): VehiclesQuery {
    const query: VehiclesQuery = {
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

    return 'Ha ocurrido un error inesperado.';
  }
}
