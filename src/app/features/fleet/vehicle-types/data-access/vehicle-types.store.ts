import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal, untracked } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, exhaustMap, forkJoin, pipe, switchMap, tap } from 'rxjs';

import { PaginationMeta } from '../../../../core/api/pagination.model';

import { VehicleTypesHttp } from './vehicle-types.http';
import {
  CreateVehicleTypePayload,
  SelectOption,
  UpdateVehicleTypePayload,
  VehicleType,
  VehicleTypesQuery,
} from './vehicle-types.models';

interface UpdateVehicleTypeCommand {
  id: string;
  payload: UpdateVehicleTypePayload;
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
export class VehicleTypesStore {
  private readonly typesHttp = inject(VehicleTypesHttp);

  private readonly querySignal = signal<VehicleTypesQuery>({
    page: 1,
    limit: 10,
  });

  private readonly typesSignal = signal<readonly VehicleType[]>([]);
  private readonly paginationSignal = signal<PaginationMeta>(EMPTY_PAGINATION_META);

  private readonly listLoadingSignal = signal(false);
  private readonly listErrorSignal = signal<string | null>(null);

  readonly query = this.querySignal.asReadonly();
  readonly types = this.typesSignal.asReadonly();
  readonly pagination = this.paginationSignal.asReadonly();
  readonly listLoading = this.listLoadingSignal.asReadonly();
  readonly listError = this.listErrorSignal.asReadonly();

  readonly hasTypes = computed(() => this.typesSignal().length > 0);

  private readonly categoryOptionsSignal = signal<readonly SelectOption[]>([]);
  private readonly serviceClassOptionsSignal = signal<readonly SelectOption[]>([]);
  private readonly catalogsLoadingSignal = signal(false);
  private readonly catalogsErrorSignal = signal<string | null>(null);

  readonly categoryOptions = this.categoryOptionsSignal.asReadonly();
  readonly serviceClassOptions = this.serviceClassOptionsSignal.asReadonly();
  readonly catalogsLoading = this.catalogsLoadingSignal.asReadonly();
  readonly catalogsError = this.catalogsErrorSignal.asReadonly();

  readonly loadTypes = rxMethod<VehicleTypesQuery>(
    pipe(
      tap(() => {
        this.listLoadingSignal.set(true);
        this.listErrorSignal.set(null);
      }),
      switchMap((query) =>
        this.typesHttp.getTypes(query).pipe(
          tapResponse({
            next: (response) => {
              this.typesSignal.set(response.items);
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
          categories: this.typesHttp.getCategoryOptions(),
          serviceClasses: this.typesHttp.getServiceClassOptions(),
        }).pipe(
          tapResponse({
            next: ({ categories, serviceClasses }) => {
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

  readonly searchTypes = rxMethod<string>(
    pipe(
      debounceTime(300),
      tap((term) => {
        const query = this.patchQuery({
          page: 1,
          name: term.trim() || undefined,
        });

        this.loadTypes(query);
      }),
    ),
  );

  enterTypesList(): void {
    const query = untracked(() => this.querySignal());

    this.loadCatalogOptions();
    this.loadTypes(query);
  }

  reloadTypes(): void {
    const query = untracked(() => this.querySignal());
    this.loadTypes(query);
  }

  loadFormCatalogs(): void {
    this.loadCatalogOptions();
  }

  setActiveFilter(isActive: boolean | null): void {
    const query = this.patchQuery({
      page: 1,
      isActive,
    });

    this.loadTypes(query);
  }

  setCategoryFilter(categoryId: string | null): void {
    const query = this.patchQuery({
      page: 1,
      categoryId,
    });

    this.loadTypes(query);
  }

  setPage(page: number, limit: number): void {
    const query = this.patchQuery({
      page,
      limit,
    });

    this.loadTypes(query);
  }

  private readonly selectedTypeSignal = signal<VehicleType | null>(null);
  private readonly detailLoadingSignal = signal(false);
  private readonly detailErrorSignal = signal<string | null>(null);

  readonly selectedType = this.selectedTypeSignal.asReadonly();
  readonly detailLoading = this.detailLoadingSignal.asReadonly();
  readonly detailError = this.detailErrorSignal.asReadonly();

  readonly loadTypeDetail = rxMethod<string>(
    pipe(
      tap(() => {
        this.detailLoadingSignal.set(true);
        this.detailErrorSignal.set(null);
        this.selectedTypeSignal.set(null);
      }),
      switchMap((id) =>
        this.typesHttp.getTypeById(id).pipe(
          tapResponse({
            next: (type) => {
              this.selectedTypeSignal.set(type);
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

  clearSelectedType(): void {
    this.selectedTypeSignal.set(null);
    this.detailErrorSignal.set(null);
  }

  private readonly createSavingSignal = signal(false);
  private readonly createErrorSignal = signal<string | null>(null);
  private readonly createdTypeSignal = signal<VehicleType | null>(null);

  readonly createSaving = this.createSavingSignal.asReadonly();
  readonly createError = this.createErrorSignal.asReadonly();
  readonly createdType = this.createdTypeSignal.asReadonly();

  readonly createType = rxMethod<CreateVehicleTypePayload>(
    pipe(
      tap(() => {
        this.createSavingSignal.set(true);
        this.createErrorSignal.set(null);
        this.createdTypeSignal.set(null);
      }),
      exhaustMap((payload) =>
        this.typesHttp.createType(payload).pipe(
          tapResponse({
            next: (type) => {
              this.createdTypeSignal.set(type);
              this.reloadTypes();
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
    this.createdTypeSignal.set(null);
  }

  private readonly updateSavingSignal = signal(false);
  private readonly updateErrorSignal = signal<string | null>(null);
  private readonly updatedTypeSignal = signal<VehicleType | null>(null);

  readonly updateSaving = this.updateSavingSignal.asReadonly();
  readonly updateError = this.updateErrorSignal.asReadonly();
  readonly updatedType = this.updatedTypeSignal.asReadonly();

  readonly updateType = rxMethod<UpdateVehicleTypeCommand>(
    pipe(
      tap(() => {
        this.updateSavingSignal.set(true);
        this.updateErrorSignal.set(null);
        this.updatedTypeSignal.set(null);
      }),
      exhaustMap(({ id, payload }) =>
        this.typesHttp.updateType(id, payload).pipe(
          tapResponse({
            next: (type) => {
              this.updatedTypeSignal.set(type);
              this.selectedTypeSignal.set(type);
              this.reloadTypes();
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
    this.updatedTypeSignal.set(null);
  }

  private readonly deletingTypeIdSignal = signal<string | null>(null);
  private readonly deleteErrorSignal = signal<string | null>(null);

  readonly deletingTypeId = this.deletingTypeIdSignal.asReadonly();
  readonly deleteError = this.deleteErrorSignal.asReadonly();

  readonly deleteType = rxMethod<string>(
    pipe(
      tap((id) => {
        this.deletingTypeIdSignal.set(id);
        this.deleteErrorSignal.set(null);
      }),
      exhaustMap((id) =>
        this.typesHttp.deleteType(id).pipe(
          tapResponse({
            next: () => {
              this.reloadTypes();

              const selectedType = this.selectedTypeSignal();

              if (selectedType?.id === id) {
                this.clearSelectedType();
              }
            },
            error: (error: unknown) => {
              this.deleteErrorSignal.set(this.getErrorMessage(error));
            },
            finalize: () => {
              this.deletingTypeIdSignal.set(null);
            },
          }),
        ),
      ),
    ),
  );

  private patchQuery(patch: Partial<VehicleTypesQuery>): VehicleTypesQuery {
    const query: VehicleTypesQuery = {
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
