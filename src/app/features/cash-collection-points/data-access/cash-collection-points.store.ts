import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal, untracked } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  debounceTime,
  exhaustMap,
  pipe,
  switchMap,
  tap,
} from 'rxjs';

import { PaginationMeta } from '../../../core/api/pagination.model';

import { CashCollectionPointsHttp } from './cash-collection-points.http';
import {
  CashCollectionPoint,
  CashCollectionPointsQuery,
  CashCollectionRecord,
  CashCollectionRecordsQuery,
  CashCollectionRecordStatus,
  CreateCashCollectionPointPayload,
  UpdateCashCollectionPointPayload,
} from './cash-collection-points.models';

interface UpdatePointCommand {
  id: string;
  payload: UpdateCashCollectionPointPayload;
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
export class CashCollectionPointsStore {
  private readonly http = inject(CashCollectionPointsHttp);

  private readonly querySignal = signal<CashCollectionPointsQuery>({
    page: 1,
    limit: 10,
  });

  private readonly pointsSignal = signal<readonly CashCollectionPoint[]>([]);
  private readonly paginationSignal = signal<PaginationMeta>(
    EMPTY_PAGINATION_META,
  );

  private readonly listLoadingSignal = signal(false);
  private readonly listErrorSignal = signal<string | null>(null);

  readonly query = this.querySignal.asReadonly();
  readonly points = this.pointsSignal.asReadonly();
  readonly pagination = this.paginationSignal.asReadonly();
  readonly listLoading = this.listLoadingSignal.asReadonly();
  readonly listError = this.listErrorSignal.asReadonly();

  readonly loadPoints = rxMethod<CashCollectionPointsQuery>(
    pipe(
      tap(() => {
        this.listLoadingSignal.set(true);
        this.listErrorSignal.set(null);
      }),
      switchMap((query) =>
        this.http.getPoints(query).pipe(
          tapResponse({
            next: (response) => {
              this.pointsSignal.set(response.items);
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

  readonly searchPoints = rxMethod<string>(
    pipe(
      debounceTime(300),
      tap((term) => {
        const query = this.patchQuery({
          page: 1,
          search: term.trim() || undefined,
        });

        this.loadPoints(query);
      }),
    ),
  );

  enterPointsList(): void {
    const query = untracked(() => this.querySignal());
    this.loadPoints(query);
  }

  reloadPoints(): void {
    const query = untracked(() => this.querySignal());
    this.loadPoints(query);
  }

  setActiveFilter(isActive: boolean | null): void {
    const query = this.patchQuery({
      page: 1,
      isActive,
    });

    this.loadPoints(query);
  }

  setPage(page: number, limit: number): void {
    const query = this.patchQuery({
      page,
      limit,
    });

    this.loadPoints(query);
  }

  private readonly selectedPointSignal =
    signal<CashCollectionPoint | null>(null);
  private readonly detailLoadingSignal = signal(false);
  private readonly detailErrorSignal = signal<string | null>(null);

  readonly selectedPoint = this.selectedPointSignal.asReadonly();
  readonly detailLoading = this.detailLoadingSignal.asReadonly();
  readonly detailError = this.detailErrorSignal.asReadonly();

  readonly loadPointDetail = rxMethod<string>(
    pipe(
      tap(() => {
        this.detailLoadingSignal.set(true);
        this.detailErrorSignal.set(null);
        this.selectedPointSignal.set(null);
      }),
      switchMap((id) =>
        this.http.getPointById(id).pipe(
          tapResponse({
            next: (point) => {
              this.selectedPointSignal.set(point);
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

  clearSelectedPoint(): void {
    this.selectedPointSignal.set(null);
    this.detailErrorSignal.set(null);
  }

  private readonly createSavingSignal = signal(false);
  private readonly createErrorSignal = signal<string | null>(null);
  private readonly createdPointSignal = signal<CashCollectionPoint | null>(
    null,
  );

  readonly createSaving = this.createSavingSignal.asReadonly();
  readonly createError = this.createErrorSignal.asReadonly();
  readonly createdPoint = this.createdPointSignal.asReadonly();

  readonly createPoint = rxMethod<CreateCashCollectionPointPayload>(
    pipe(
      tap(() => {
        this.createSavingSignal.set(true);
        this.createErrorSignal.set(null);
        this.createdPointSignal.set(null);
      }),
      exhaustMap((payload) =>
        this.http.createPoint(payload).pipe(
          tapResponse({
            next: (point) => {
              this.createdPointSignal.set(point);
              this.reloadPoints();
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
    this.createdPointSignal.set(null);
  }

  private readonly updateSavingSignal = signal(false);
  private readonly updateErrorSignal = signal<string | null>(null);
  private readonly updatedPointSignal = signal<CashCollectionPoint | null>(
    null,
  );

  readonly updateSaving = this.updateSavingSignal.asReadonly();
  readonly updateError = this.updateErrorSignal.asReadonly();
  readonly updatedPoint = this.updatedPointSignal.asReadonly();

  readonly updatePoint = rxMethod<UpdatePointCommand>(
    pipe(
      tap(() => {
        this.updateSavingSignal.set(true);
        this.updateErrorSignal.set(null);
        this.updatedPointSignal.set(null);
      }),
      exhaustMap(({ id, payload }) =>
        this.http.updatePoint(id, payload).pipe(
          tapResponse({
            next: (point) => {
              this.updatedPointSignal.set(point);
              this.selectedPointSignal.set(point);
              this.reloadPoints();
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
    this.updatedPointSignal.set(null);
  }

  private readonly deletingPointIdSignal = signal<string | null>(null);
  private readonly deleteErrorSignal = signal<string | null>(null);

  readonly deletingPointId = this.deletingPointIdSignal.asReadonly();
  readonly deleteError = this.deleteErrorSignal.asReadonly();

  readonly deletePoint = rxMethod<string>(
    pipe(
      tap((id) => {
        this.deletingPointIdSignal.set(id);
        this.deleteErrorSignal.set(null);
      }),
      exhaustMap((id) =>
        this.http.deletePoint(id).pipe(
          tapResponse({
            next: () => {
              this.reloadPoints();

              const selected = this.selectedPointSignal();

              if (selected?.id === id) {
                this.clearSelectedPoint();
              }
            },
            error: (error: unknown) => {
              this.deleteErrorSignal.set(this.getErrorMessage(error));
            },
            finalize: () => {
              this.deletingPointIdSignal.set(null);
            },
          }),
        ),
      ),
    ),
  );

  private readonly recordsQuerySignal =
    signal<CashCollectionRecordsQuery>({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortDir: 'desc',
    });

  private readonly recordsSignal = signal<readonly CashCollectionRecord[]>([]);
  private readonly recordsPaginationSignal = signal<PaginationMeta>(
    EMPTY_PAGINATION_META,
  );

  private readonly recordsLoadingSignal = signal(false);
  private readonly recordsErrorSignal = signal<string | null>(null);

  readonly recordsQuery = this.recordsQuerySignal.asReadonly();
  readonly records = this.recordsSignal.asReadonly();
  readonly recordsPagination = this.recordsPaginationSignal.asReadonly();
  readonly recordsLoading = this.recordsLoadingSignal.asReadonly();
  readonly recordsError = this.recordsErrorSignal.asReadonly();

  readonly loadRecords = rxMethod<string>(
    pipe(
      tap(() => {
        this.recordsLoadingSignal.set(true);
        this.recordsErrorSignal.set(null);
      }),
      switchMap((pointId) =>
        this.http
          .getPointRecords(pointId, this.recordsQuerySignal())
          .pipe(
            tapResponse({
              next: (response) => {
                this.recordsSignal.set(response.items);
                this.recordsPaginationSignal.set(response.meta);
              },
              error: (error: unknown) => {
                this.recordsErrorSignal.set(this.getErrorMessage(error));
              },
              finalize: () => {
                this.recordsLoadingSignal.set(false);
              },
            }),
          ),
      ),
    ),
  );

  enterPointDetail(id: string): void {
    this.loadPointDetail(id);
    this.loadRecords(id);
  }

  searchRecords(term: string): void {
    this.patchRecordsQuery({
      page: 1,
      search: term.trim() || undefined,
    });

    const point = this.selectedPointSignal();

    if (!point) {
      return;
    }

    this.loadRecords(point.id);
  }

  setRecordsStatusFilter(status: CashCollectionRecordStatus | null): void {
    this.patchRecordsQuery({
      page: 1,
      status,
    });

    const point = this.selectedPointSignal();

    if (!point) {
      return;
    }

    this.loadRecords(point.id);
  }

  setRecordsPage(page: number, limit: number): void {
    this.patchRecordsQuery({
      page,
      limit,
    });

    const point = this.selectedPointSignal();

    if (!point) {
      return;
    }

    this.loadRecords(point.id);
  }

  private patchQuery(
    patch: Partial<CashCollectionPointsQuery>,
  ): CashCollectionPointsQuery {
    const query: CashCollectionPointsQuery = {
      ...this.querySignal(),
      ...patch,
    };

    this.querySignal.set(query);

    return query;
  }

  private patchRecordsQuery(
    patch: Partial<CashCollectionRecordsQuery>,
  ): CashCollectionRecordsQuery {
    const query: CashCollectionRecordsQuery = {
      ...this.recordsQuerySignal(),
      ...patch,
    };

    this.recordsQuerySignal.set(query);

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
