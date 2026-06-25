import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal, untracked } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, exhaustMap, pipe, switchMap, tap } from 'rxjs';

import { PaginationMeta } from '../../../core/api/pagination.model';

import { GeographyHttp } from './geography.http';
import {
  CityOption,
  CreateZonePayload,
  SelectOption,
  UpdateZonePayload,
  Zone,
  ZonesQuery,
} from './geography.models';

interface UpdateZoneCommand {
  id: string;
  payload: UpdateZonePayload;
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
export class ZonesStore {
  private readonly http = inject(GeographyHttp);

  private readonly querySignal = signal<ZonesQuery>({
    page: 1,
    limit: 10,
  });

  private readonly zonesSignal = signal<readonly Zone[]>([]);
  private readonly paginationSignal = signal<PaginationMeta>(EMPTY_PAGINATION_META);

  private readonly listLoadingSignal = signal(false);
  private readonly listErrorSignal = signal<string | null>(null);

  private readonly cityOptionsSignal = signal<readonly SelectOption[]>([]);

  private readonly selectedSignal = signal<Zone | null>(null);
  private readonly detailLoadingSignal = signal(false);
  private readonly detailErrorSignal = signal<string | null>(null);

  private readonly savingSignal = signal(false);
  private readonly saveErrorSignal = signal<string | null>(null);
  private readonly savedSignal = signal<Zone | null>(null);

  readonly query = this.querySignal.asReadonly();
  readonly zones = this.zonesSignal.asReadonly();
  readonly pagination = this.paginationSignal.asReadonly();

  readonly listLoading = this.listLoadingSignal.asReadonly();
  readonly listError = this.listErrorSignal.asReadonly();

  readonly cityOptions = this.cityOptionsSignal.asReadonly();

  readonly selected = this.selectedSignal.asReadonly();
  readonly detailLoading = this.detailLoadingSignal.asReadonly();
  readonly detailError = this.detailErrorSignal.asReadonly();

  readonly saving = this.savingSignal.asReadonly();
  readonly saveError = this.saveErrorSignal.asReadonly();
  readonly saved = this.savedSignal.asReadonly();

  readonly loadCityOptions = rxMethod<void>(
    pipe(
      switchMap(() =>
        this.http.getCityOptions().pipe(
          tapResponse({
            next: (cities: CityOption[]) => {
              this.cityOptionsSignal.set(
                cities.map((city) => ({
                  label: `${city.name} · ${city.countryCode}`,
                  value: city.id,
                })),
              );
            },
            error: () => {
              this.cityOptionsSignal.set([]);
            },
          }),
        ),
      ),
    ),
  );

  readonly loadZones = rxMethod<ZonesQuery>(
    pipe(
      tap(() => {
        this.listLoadingSignal.set(true);
        this.listErrorSignal.set(null);
      }),
      switchMap((query) =>
        this.http.getZones(query).pipe(
          tapResponse({
            next: (response) => {
              this.zonesSignal.set(response.items);
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

  readonly searchZones = rxMethod<string>(
    pipe(
      debounceTime(300),
      tap((term) => {
        const query = this.patchQuery({
          page: 1,
          q: term.trim() || undefined,
        });

        this.loadZones(query);
      }),
    ),
  );

  readonly loadZone = rxMethod<string>(
    pipe(
      tap(() => {
        this.detailLoadingSignal.set(true);
        this.detailErrorSignal.set(null);
        this.selectedSignal.set(null);
      }),
      switchMap((id) =>
        this.http.getZoneById(id).pipe(
          tapResponse({
            next: (zone) => {
              this.selectedSignal.set(zone);
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

  readonly createZone = rxMethod<CreateZonePayload>(
    pipe(
      tap(() => {
        this.savingSignal.set(true);
        this.saveErrorSignal.set(null);
        this.savedSignal.set(null);
      }),
      exhaustMap((payload) =>
        this.http.createZone(payload).pipe(
          tapResponse({
            next: (zone) => {
              this.savedSignal.set(zone);
              this.reloadZones();
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

  readonly updateZone = rxMethod<UpdateZoneCommand>(
    pipe(
      tap(() => {
        this.savingSignal.set(true);
        this.saveErrorSignal.set(null);
        this.savedSignal.set(null);
      }),
      exhaustMap(({ id, payload }) =>
        this.http.updateZone(id, payload).pipe(
          tapResponse({
            next: (zone) => {
              this.savedSignal.set(zone);
              this.selectedSignal.set(zone);
              this.reloadZones();
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
    this.loadCityOptions();
    this.loadZones(untracked(() => this.querySignal()));
  }

  enterCreate(): void {
    this.loadCityOptions();
  }

  reloadZones(): void {
    this.loadZones(untracked(() => this.querySignal()));
  }

  setCityFilter(cityId: string | null): void {
    const query = this.patchQuery({
      page: 1,
      cityId,
    });

    this.loadZones(query);
  }

  setActiveFilter(active: boolean | null): void {
    const query = this.patchQuery({
      page: 1,
      active,
    });

    this.loadZones(query);
  }

  setPage(page: number, limit: number): void {
    const query = this.patchQuery({
      page,
      limit,
    });

    this.loadZones(query);
  }

  clearSaveState(): void {
    this.saveErrorSignal.set(null);
    this.savedSignal.set(null);
  }

  private patchQuery(patch: Partial<ZonesQuery>): ZonesQuery {
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
