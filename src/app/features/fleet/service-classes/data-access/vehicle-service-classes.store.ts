import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal, untracked } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, exhaustMap, pipe, switchMap, tap } from 'rxjs';

import { PaginationMeta } from '../../../../core/api/pagination.model';

import { VehicleServiceClassesHttp } from './vehicle-service-classes.http';
import {
  CreateVehicleServiceClassPayload,
  UpdateVehicleServiceClassPayload,
  VehicleServiceClass,
  VehicleServiceClassesQuery,
} from './vehicle-service-classes.models';

interface UpdateVehicleServiceClassCommand {
  id: string;
  payload: UpdateVehicleServiceClassPayload;
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
export class VehicleServiceClassesStore {
  private readonly serviceClassesHttp = inject(VehicleServiceClassesHttp);

  private readonly querySignal = signal<VehicleServiceClassesQuery>({
    page: 1,
    limit: 10,
  });

  private readonly serviceClassesSignal =
    signal<readonly VehicleServiceClass[]>([]);

  private readonly paginationSignal = signal<PaginationMeta>(
    EMPTY_PAGINATION_META,
  );

  private readonly listLoadingSignal = signal(false);
  private readonly listErrorSignal = signal<string | null>(null);

  readonly query = this.querySignal.asReadonly();
  readonly serviceClasses = this.serviceClassesSignal.asReadonly();
  readonly pagination = this.paginationSignal.asReadonly();
  readonly listLoading = this.listLoadingSignal.asReadonly();
  readonly listError = this.listErrorSignal.asReadonly();

  readonly hasServiceClasses = computed(
    () => this.serviceClassesSignal().length > 0,
  );

  readonly loadServiceClasses = rxMethod<VehicleServiceClassesQuery>(
    pipe(
      tap(() => {
        this.listLoadingSignal.set(true);
        this.listErrorSignal.set(null);
      }),
      switchMap((query) =>
        this.serviceClassesHttp.getServiceClasses(query).pipe(
          tapResponse({
            next: (response) => {
              this.serviceClassesSignal.set(response.items);
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

  readonly searchServiceClasses = rxMethod<string>(
    pipe(
      debounceTime(300),
      tap((term) => {
        const query = this.patchQuery({
          page: 1,
          name: term.trim() || undefined,
        });

        this.loadServiceClasses(query);
      }),
    ),
  );

  enterServiceClassesList(): void {
    const query = untracked(() => this.querySignal());
    this.loadServiceClasses(query);
  }

  reloadServiceClasses(): void {
    const query = untracked(() => this.querySignal());
    this.loadServiceClasses(query);
  }

  setActiveFilter(isActive: boolean | null): void {
    const query = this.patchQuery({
      page: 1,
      isActive,
    });

    this.loadServiceClasses(query);
  }

  setPage(page: number, limit: number): void {
    const query = this.patchQuery({
      page,
      limit,
    });

    this.loadServiceClasses(query);
  }

  private readonly selectedServiceClassSignal =
    signal<VehicleServiceClass | null>(null);

  private readonly detailLoadingSignal = signal(false);
  private readonly detailErrorSignal = signal<string | null>(null);

  readonly selectedServiceClass =
    this.selectedServiceClassSignal.asReadonly();

  readonly detailLoading = this.detailLoadingSignal.asReadonly();
  readonly detailError = this.detailErrorSignal.asReadonly();

  readonly loadServiceClassDetail = rxMethod<string>(
    pipe(
      tap(() => {
        this.detailLoadingSignal.set(true);
        this.detailErrorSignal.set(null);
        this.selectedServiceClassSignal.set(null);
      }),
      switchMap((id) =>
        this.serviceClassesHttp.getServiceClassById(id).pipe(
          tapResponse({
            next: (serviceClass) => {
              this.selectedServiceClassSignal.set(serviceClass);
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

  clearSelectedServiceClass(): void {
    this.selectedServiceClassSignal.set(null);
    this.detailErrorSignal.set(null);
  }

  private readonly createSavingSignal = signal(false);
  private readonly createErrorSignal = signal<string | null>(null);
  private readonly createdServiceClassSignal =
    signal<VehicleServiceClass | null>(null);

  readonly createSaving = this.createSavingSignal.asReadonly();
  readonly createError = this.createErrorSignal.asReadonly();
  readonly createdServiceClass =
    this.createdServiceClassSignal.asReadonly();

  readonly createServiceClass = rxMethod<CreateVehicleServiceClassPayload>(
    pipe(
      tap(() => {
        this.createSavingSignal.set(true);
        this.createErrorSignal.set(null);
        this.createdServiceClassSignal.set(null);
      }),
      exhaustMap((payload) =>
        this.serviceClassesHttp.createServiceClass(payload).pipe(
          tapResponse({
            next: (serviceClass) => {
              this.createdServiceClassSignal.set(serviceClass);
              this.reloadServiceClasses();
            },
            error: (error: unknown) => {
              this.createErrorSignal.set(this.getErrorMessage(error));
            },
            finalize: () => {
              this.createSavingSignal.set(false);
            },
          }),
        ),
      ),
    ),
  );

  clearCreateState(): void {
    this.createErrorSignal.set(null);
    this.createdServiceClassSignal.set(null);
  }

  private readonly updateSavingSignal = signal(false);
  private readonly updateErrorSignal = signal<string | null>(null);
  private readonly updatedServiceClassSignal =
    signal<VehicleServiceClass | null>(null);

  readonly updateSaving = this.updateSavingSignal.asReadonly();
  readonly updateError = this.updateErrorSignal.asReadonly();
  readonly updatedServiceClass =
    this.updatedServiceClassSignal.asReadonly();

  readonly updateServiceClass =
    rxMethod<UpdateVehicleServiceClassCommand>(
      pipe(
        tap(() => {
          this.updateSavingSignal.set(true);
          this.updateErrorSignal.set(null);
          this.updatedServiceClassSignal.set(null);
        }),
        exhaustMap(({ id, payload }) =>
          this.serviceClassesHttp.updateServiceClass(id, payload).pipe(
            tapResponse({
              next: (serviceClass) => {
                this.updatedServiceClassSignal.set(serviceClass);
                this.selectedServiceClassSignal.set(serviceClass);
                this.reloadServiceClasses();
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
    this.updatedServiceClassSignal.set(null);
  }

  private readonly deletingServiceClassIdSignal = signal<string | null>(null);
  private readonly deleteErrorSignal = signal<string | null>(null);

  readonly deletingServiceClassId =
    this.deletingServiceClassIdSignal.asReadonly();

  readonly deleteError = this.deleteErrorSignal.asReadonly();

  readonly deleteServiceClass = rxMethod<string>(
    pipe(
      tap((id) => {
        this.deletingServiceClassIdSignal.set(id);
        this.deleteErrorSignal.set(null);
      }),
      exhaustMap((id) =>
        this.serviceClassesHttp.deleteServiceClass(id).pipe(
          tapResponse({
            next: () => {
              this.reloadServiceClasses();

              const selectedServiceClass =
                this.selectedServiceClassSignal();

              if (selectedServiceClass?.id === id) {
                this.clearSelectedServiceClass();
              }
            },
            error: (error: unknown) => {
              this.deleteErrorSignal.set(this.getErrorMessage(error));
            },
            finalize: () => {
              this.deletingServiceClassIdSignal.set(null);
            },
          }),
        ),
      ),
    ),
  );

  private patchQuery(
    patch: Partial<VehicleServiceClassesQuery>,
  ): VehicleServiceClassesQuery {
    const query: VehicleServiceClassesQuery = {
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
