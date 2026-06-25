import { Injectable, computed, inject, signal, untracked } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, exhaustMap, pipe, switchMap, tap } from 'rxjs';

import { PaginationMeta } from '../../../../core/api/pagination.model';
import { VehicleCategoriesHttp } from './vehicle-categories.http';
import {
  CreateVehicleCategoryPayload,
  UpdateVehicleCategoryPayload,
  VehicleCategoriesQuery,
  VehicleCategory,
} from './vehicle-categories.models';

interface UpdateVehicleCategoryCommand {
  id: string;
  payload: UpdateVehicleCategoryPayload;
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
export class VehicleCategoriesStore {
  private readonly categoriesHttp = inject(VehicleCategoriesHttp);

  private readonly querySignal = signal<VehicleCategoriesQuery>({
    page: 1,
    limit: 10,
  });

  private readonly categoriesSignal = signal<readonly VehicleCategory[]>([]);
  private readonly paginationSignal = signal<PaginationMeta>(
    EMPTY_PAGINATION_META,
  );

  private readonly listLoadingSignal = signal(false);
  private readonly listErrorSignal = signal<string | null>(null);

  readonly query = this.querySignal.asReadonly();
  readonly categories = this.categoriesSignal.asReadonly();
  readonly pagination = this.paginationSignal.asReadonly();
  readonly listLoading = this.listLoadingSignal.asReadonly();
  readonly listError = this.listErrorSignal.asReadonly();

  readonly hasCategories = computed(() => this.categoriesSignal().length > 0);

  readonly loadCategories = rxMethod<VehicleCategoriesQuery>(
    pipe(
      tap(() => {
        this.listLoadingSignal.set(true);
        this.listErrorSignal.set(null);
      }),
      switchMap((query) =>
        this.categoriesHttp.getCategories(query).pipe(
          tapResponse({
            next: (response) => {
              this.categoriesSignal.set(response.items);
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

  readonly searchCategories = rxMethod<string>(
    pipe(
      debounceTime(300),
      tap((term) => {
        const query = this.patchQuery({
          page: 1,
          name: term.trim() || undefined,
        });

        this.loadCategories(query);
      }),
    ),
  );

  enterCategoriesList(): void {
    const query = untracked(() => this.querySignal());
    this.loadCategories(query);
  }

  reloadCategories(): void {
    const query = untracked(() => this.querySignal());
    this.loadCategories(query);
  }

  setActiveFilter(isActive: boolean | null): void {
    const query = this.patchQuery({
      page: 1,
      isActive,
    });

    this.loadCategories(query);
  }

  setPage(page: number, limit: number): void {
    const query = this.patchQuery({
      page,
      limit,
    });

    this.loadCategories(query);
  }

  private readonly selectedCategorySignal =
    signal<VehicleCategory | null>(null);

  private readonly detailLoadingSignal = signal(false);
  private readonly detailErrorSignal = signal<string | null>(null);

  readonly selectedCategory = this.selectedCategorySignal.asReadonly();
  readonly detailLoading = this.detailLoadingSignal.asReadonly();
  readonly detailError = this.detailErrorSignal.asReadonly();

  readonly loadCategoryDetail = rxMethod<string>(
    pipe(
      tap(() => {
        this.detailLoadingSignal.set(true);
        this.detailErrorSignal.set(null);
        this.selectedCategorySignal.set(null);
      }),
      switchMap((id) =>
        this.categoriesHttp.getCategoryById(id).pipe(
          tapResponse({
            next: (category) => {
              this.selectedCategorySignal.set(category);
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

  clearSelectedCategory(): void {
    this.selectedCategorySignal.set(null);
    this.detailErrorSignal.set(null);
  }

  private readonly createSavingSignal = signal(false);
  private readonly createErrorSignal = signal<string | null>(null);
  private readonly createdCategorySignal = signal<VehicleCategory | null>(null);

  readonly createSaving = this.createSavingSignal.asReadonly();
  readonly createError = this.createErrorSignal.asReadonly();
  readonly createdCategory = this.createdCategorySignal.asReadonly();

  readonly createCategory = rxMethod<CreateVehicleCategoryPayload>(
    pipe(
      tap(() => {
        this.createSavingSignal.set(true);
        this.createErrorSignal.set(null);
        this.createdCategorySignal.set(null);
      }),
      exhaustMap((payload) =>
        this.categoriesHttp.createCategory(payload).pipe(
          tapResponse({
            next: (category) => {
              this.createdCategorySignal.set(category);
              this.reloadCategories();
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
    this.createdCategorySignal.set(null);
  }

  private readonly updateSavingSignal = signal(false);
  private readonly updateErrorSignal = signal<string | null>(null);
  private readonly updatedCategorySignal = signal<VehicleCategory | null>(null);

  readonly updateSaving = this.updateSavingSignal.asReadonly();
  readonly updateError = this.updateErrorSignal.asReadonly();
  readonly updatedCategory = this.updatedCategorySignal.asReadonly();

  readonly updateCategory = rxMethod<UpdateVehicleCategoryCommand>(
    pipe(
      tap(() => {
        this.updateSavingSignal.set(true);
        this.updateErrorSignal.set(null);
        this.updatedCategorySignal.set(null);
      }),
      exhaustMap(({ id, payload }) =>
        this.categoriesHttp.updateCategory(id, payload).pipe(
          tapResponse({
            next: (category) => {
              this.updatedCategorySignal.set(category);
              this.selectedCategorySignal.set(category);
              this.reloadCategories();
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
    this.updatedCategorySignal.set(null);
  }

  private readonly deletingCategoryIdSignal = signal<string | null>(null);
  private readonly deleteErrorSignal = signal<string | null>(null);

  readonly deletingCategoryId = this.deletingCategoryIdSignal.asReadonly();
  readonly deleteError = this.deleteErrorSignal.asReadonly();

  readonly deleteCategory = rxMethod<string>(
    pipe(
      tap((id) => {
        this.deletingCategoryIdSignal.set(id);
        this.deleteErrorSignal.set(null);
      }),
      exhaustMap((id) =>
        this.categoriesHttp.deleteCategory(id).pipe(
          tapResponse({
            next: () => {
              this.reloadCategories();

              const selectedCategory = this.selectedCategorySignal();

              if (selectedCategory?.id === id) {
                this.clearSelectedCategory();
              }
            },
            error: (error: unknown) => {
              this.deleteErrorSignal.set(this.getErrorMessage(error));
            },
            finalize: () => {
              this.deletingCategoryIdSignal.set(null);
            },
          }),
        ),
      ),
    ),
  );

  private patchQuery(
    patch: Partial<VehicleCategoriesQuery>,
  ): VehicleCategoriesQuery {
    const query: VehicleCategoriesQuery = {
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
