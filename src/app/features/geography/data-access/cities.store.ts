import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal, untracked } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, exhaustMap, pipe, switchMap, tap } from 'rxjs';

import { PaginationMeta } from '../../../core/api/pagination.model';

import { GeographyHttp } from './geography.http';
import {
  CitiesQuery,
  City,
  CreateCityPayload,
  UpdateCityPayload,
} from './geography.models';

interface UpdateCityCommand {
  id: string;
  payload: UpdateCityPayload;
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
export class CitiesStore {
  private readonly http = inject(GeographyHttp);

  private readonly querySignal = signal<CitiesQuery>({
    page: 1,
    limit: 10,
  });

  private readonly citiesSignal = signal<readonly City[]>([]);
  private readonly paginationSignal = signal<PaginationMeta>(EMPTY_PAGINATION_META);

  private readonly listLoadingSignal = signal(false);
  private readonly listErrorSignal = signal<string | null>(null);

  private readonly selectedSignal = signal<City | null>(null);
  private readonly detailLoadingSignal = signal(false);
  private readonly detailErrorSignal = signal<string | null>(null);

  private readonly savingSignal = signal(false);
  private readonly saveErrorSignal = signal<string | null>(null);
  private readonly savedSignal = signal<City | null>(null);

  readonly query = this.querySignal.asReadonly();
  readonly cities = this.citiesSignal.asReadonly();
  readonly pagination = this.paginationSignal.asReadonly();

  readonly listLoading = this.listLoadingSignal.asReadonly();
  readonly listError = this.listErrorSignal.asReadonly();

  readonly selected = this.selectedSignal.asReadonly();
  readonly detailLoading = this.detailLoadingSignal.asReadonly();
  readonly detailError = this.detailErrorSignal.asReadonly();

  readonly saving = this.savingSignal.asReadonly();
  readonly saveError = this.saveErrorSignal.asReadonly();
  readonly saved = this.savedSignal.asReadonly();

  readonly loadCities = rxMethod<CitiesQuery>(
    pipe(
      tap(() => {
        this.listLoadingSignal.set(true);
        this.listErrorSignal.set(null);
      }),
      switchMap((query) =>
        this.http.getCities(query).pipe(
          tapResponse({
            next: (response) => {
              this.citiesSignal.set(response.items);
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

  readonly searchCities = rxMethod<string>(
    pipe(
      debounceTime(300),
      tap((term) => {
        const query = this.patchQuery({
          page: 1,
          q: term.trim() || undefined,
        });

        this.loadCities(query);
      }),
    ),
  );

  readonly loadCity = rxMethod<string>(
    pipe(
      tap(() => {
        this.detailLoadingSignal.set(true);
        this.detailErrorSignal.set(null);
        this.selectedSignal.set(null);
      }),
      switchMap((id) =>
        this.http.getCityById(id).pipe(
          tapResponse({
            next: (city) => {
              this.selectedSignal.set(city);
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

  readonly createCity = rxMethod<CreateCityPayload>(
    pipe(
      tap(() => {
        this.savingSignal.set(true);
        this.saveErrorSignal.set(null);
        this.savedSignal.set(null);
      }),
      exhaustMap((payload) =>
        this.http.createCity(payload).pipe(
          tapResponse({
            next: (city) => {
              this.savedSignal.set(city);
              this.reloadCities();
            },
            error: (error: unknown) => {
              this.saveErrorSignal.set(this.getErrorMessage(error));
            },
            finalize: () => {
              this.savingSignal.set(false);
            },
          }),
        ),
      ),
    ),
  );

  readonly updateCity = rxMethod<UpdateCityCommand>(
    pipe(
      tap(() => {
        this.savingSignal.set(true);
        this.saveErrorSignal.set(null);
        this.savedSignal.set(null);
      }),
      exhaustMap(({ id, payload }) =>
        this.http.updateCity(id, payload).pipe(
          tapResponse({
            next: (city) => {
              this.savedSignal.set(city);
              this.selectedSignal.set(city);
              this.reloadCities();
            },
            error: (error: unknown) => {
              this.saveErrorSignal.set(this.getErrorMessage(error));
            },
            finalize: () => {
              this.savingSignal.set(false);
            },
          }),
        ),
      ),
    ),
  );

  enterList(): void {
    this.loadCities(untracked(() => this.querySignal()));
  }

  reloadCities(): void {
    this.loadCities(untracked(() => this.querySignal()));
  }

  setActiveFilter(active: boolean | null): void {
    const query = this.patchQuery({
      page: 1,
      active,
    });

    this.loadCities(query);
  }

  setPage(page: number, limit: number): void {
    const query = this.patchQuery({
      page,
      limit,
    });

    this.loadCities(query);
  }

  clearSaveState(): void {
    this.saveErrorSignal.set(null);
    this.savedSignal.set(null);
  }

  private patchQuery(patch: Partial<CitiesQuery>): CitiesQuery {
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

    return 'Ha ocurrido un error inesperado.';
  }
}
