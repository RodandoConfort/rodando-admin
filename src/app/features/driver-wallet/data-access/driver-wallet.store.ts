import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal, untracked } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, exhaustMap, forkJoin, pipe, switchMap, tap } from 'rxjs';

import { PaginationMeta } from '../../../core/api/pagination.model';

import { DriverWalletHttp } from './driver-wallet.http';
import {
  AdminDriverWalletTopupPayload,
  BlockDriverWalletPayload,
  DriverWallet,
  DriverWalletSelectOption,
  WalletMovement,
  WalletMovementsQuery,
} from './driver-wallet.models';

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
export class DriverWalletStore {
  private readonly walletHttp = inject(DriverWalletHttp);

  private readonly driverIdSignal = signal<string | null>(null);
  private readonly walletSignal = signal<DriverWallet | null>(null);

  private readonly walletLoadingSignal = signal(false);
  private readonly walletErrorSignal = signal<string | null>(null);

  private readonly movementsQuerySignal = signal<WalletMovementsQuery>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  private readonly movementsSignal = signal<readonly WalletMovement[]>([]);
  private readonly movementsPaginationSignal = signal<PaginationMeta>(EMPTY_PAGINATION_META);

  private readonly movementsLoadingSignal = signal(false);
  private readonly movementsErrorSignal = signal<string | null>(null);

  private readonly topupSavingSignal = signal(false);
  private readonly topupErrorSignal = signal<string | null>(null);

  private readonly blockSavingSignal = signal(false);
  private readonly blockErrorSignal = signal<string | null>(null);

  readonly driverId = this.driverIdSignal.asReadonly();
  readonly wallet = this.walletSignal.asReadonly();
  readonly walletLoading = this.walletLoadingSignal.asReadonly();
  readonly walletError = this.walletErrorSignal.asReadonly();

  readonly movementsQuery = this.movementsQuerySignal.asReadonly();
  readonly movements = this.movementsSignal.asReadonly();
  readonly movementsPagination = this.movementsPaginationSignal.asReadonly();
  readonly movementsLoading = this.movementsLoadingSignal.asReadonly();
  readonly movementsError = this.movementsErrorSignal.asReadonly();

  readonly topupSaving = this.topupSavingSignal.asReadonly();
  readonly topupError = this.topupErrorSignal.asReadonly();

  readonly blockSaving = this.blockSavingSignal.asReadonly();
  readonly blockError = this.blockErrorSignal.asReadonly();

  private readonly collectionPointOptionsSignal = signal<readonly DriverWalletSelectOption[]>([]);

  private readonly collectorOptionsSignal = signal<readonly DriverWalletSelectOption[]>([]);

  private readonly topupOptionsLoadingSignal = signal(false);
  private readonly topupOptionsErrorSignal = signal<string | null>(null);

  readonly collectionPointOptions = this.collectionPointOptionsSignal.asReadonly();

  readonly collectorOptions = this.collectorOptionsSignal.asReadonly();

  readonly topupOptionsLoading = this.topupOptionsLoadingSignal.asReadonly();

  readonly topupOptionsError = this.topupOptionsErrorSignal.asReadonly();

  readonly loadWallet = rxMethod<string>(
    pipe(
      tap((driverId) => {
        this.driverIdSignal.set(driverId);
        this.walletLoadingSignal.set(true);
        this.walletErrorSignal.set(null);
      }),
      switchMap((driverId) =>
        this.walletHttp.getWalletByDriverId(driverId).pipe(
          tapResponse({
            next: (wallet) => {
              this.walletSignal.set(wallet);
              this.loadMovementsForDriver(driverId);
            },
            error: (error: unknown) => {
              this.walletErrorSignal.set(this.getErrorMessage(error));
            },
            finalize: () => {
              this.walletLoadingSignal.set(false);
            },
          }),
        ),
      ),
    ),
  );

  readonly loadMovementsForDriver = rxMethod<string>(
    pipe(
      tap(() => {
        this.movementsLoadingSignal.set(true);
        this.movementsErrorSignal.set(null);
      }),
      switchMap((driverId) =>
        this.walletHttp.getMovementsByDriverId(driverId, this.movementsQuerySignal()).pipe(
          tapResponse({
            next: (response) => {
              this.movementsSignal.set(response.items);
              this.movementsPaginationSignal.set(response.meta);
            },
            error: (error: unknown) => {
              this.movementsErrorSignal.set(this.getErrorMessage(error));
            },
            finalize: () => {
              this.movementsLoadingSignal.set(false);
            },
          }),
        ),
      ),
    ),
  );

  readonly searchMovements = rxMethod<string>(
    pipe(
      debounceTime(300),
      tap((term) => {
        const query = this.patchMovementsQuery({
          page: 1,
          search: term.trim() || undefined,
        });

        const driverId = untracked(() => this.driverIdSignal());

        if (!driverId) {
          return;
        }

        this.walletHttp.getMovementsByDriverId(driverId, query).subscribe({
          next: (response) => {
            this.movementsSignal.set(response.items);
            this.movementsPaginationSignal.set(response.meta);
          },
          error: (error: unknown) => {
            this.movementsErrorSignal.set(this.getErrorMessage(error));
          },
        });
      }),
    ),
  );

  readonly topupWallet = rxMethod<AdminDriverWalletTopupPayload>(
    pipe(
      tap(() => {
        this.topupSavingSignal.set(true);
        this.topupErrorSignal.set(null);
      }),
      exhaustMap((payload) => {
        const driverId = this.driverIdSignal();

        if (!driverId) {
          this.topupSavingSignal.set(false);
          this.topupErrorSignal.set('No se encontró el conductor.');
          throw new Error('No driverId');
        }

        return this.walletHttp.topup(driverId, payload).pipe(
          tapResponse({
            next: () => {
              this.loadWallet(driverId);
            },
            error: (error: unknown) => {
              this.topupErrorSignal.set(this.getErrorMessage(error));
            },
            finalize: () => {
              this.topupSavingSignal.set(false);
            },
          }),
        );
      }),
    ),
  );

  readonly blockWallet = rxMethod<BlockDriverWalletPayload>(
    pipe(
      tap(() => {
        this.blockSavingSignal.set(true);
        this.blockErrorSignal.set(null);
      }),
      exhaustMap((payload) => {
        const driverId = this.driverIdSignal();

        if (!driverId) {
          this.blockSavingSignal.set(false);
          this.blockErrorSignal.set('No se encontró el conductor.');
          throw new Error('No driverId');
        }

        return this.walletHttp.block(driverId, payload).pipe(
          tapResponse({
            next: () => {
              this.loadWallet(driverId);
            },
            error: (error: unknown) => {
              this.blockErrorSignal.set(this.getErrorMessage(error));
            },
            finalize: () => {
              this.blockSavingSignal.set(false);
            },
          }),
        );
      }),
    ),
  );

  readonly unblockWallet = rxMethod<void>(
    pipe(
      tap(() => {
        this.blockSavingSignal.set(true);
        this.blockErrorSignal.set(null);
      }),
      exhaustMap(() => {
        const driverId = this.driverIdSignal();

        if (!driverId) {
          this.blockSavingSignal.set(false);
          this.blockErrorSignal.set('No se encontró el conductor.');
          throw new Error('No driverId');
        }

        return this.walletHttp.unblock(driverId, {}).pipe(
          tapResponse({
            next: () => {
              this.loadWallet(driverId);
            },
            error: (error: unknown) => {
              this.blockErrorSignal.set(this.getErrorMessage(error));
            },
            finalize: () => {
              this.blockSavingSignal.set(false);
            },
          }),
        );
      }),
    ),
  );

  enter(driverId: string): void {
    this.loadWallet(driverId);
    this.loadTopupOptions();
    this.loadWallet(driverId);
  }

  reload(): void {
    const driverId = this.driverIdSignal();

    if (!driverId) {
      return;
    }

    this.loadWallet(driverId);
  }

  setMovementsPage(page: number, limit: number): void {
    this.patchMovementsQuery({
      page,
      limit,
    });

    const driverId = this.driverIdSignal();

    if (!driverId) {
      return;
    }

    this.loadMovementsForDriver(driverId);
  }

  setMovementsDateRange(from: string | null, to: string | null): void {
    this.patchMovementsQuery({
      page: 1,
      from: from || undefined,
      to: to || undefined,
    });

    const driverId = this.driverIdSignal();

    if (!driverId) {
      return;
    }

    this.loadMovementsForDriver(driverId);
  }

  clearMovementsDateRange(): void {
    this.patchMovementsQuery({
      page: 1,
      from: undefined,
      to: undefined,
    });

    const driverId = this.driverIdSignal();

    if (!driverId) {
      return;
    }

    this.loadMovementsForDriver(driverId);
  }

  clearActionErrors(): void {
    this.topupErrorSignal.set(null);
    this.blockErrorSignal.set(null);
  }

  private patchMovementsQuery(patch: Partial<WalletMovementsQuery>): WalletMovementsQuery {
    const query: WalletMovementsQuery = {
      ...this.movementsQuerySignal(),
      ...patch,
    };

    this.movementsQuerySignal.set(query);

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

  readonly loadTopupOptions = rxMethod<void>(
    pipe(
      tap(() => {
        this.topupOptionsLoadingSignal.set(true);
        this.topupOptionsErrorSignal.set(null);
      }),
      switchMap(() =>
        forkJoin({
          collectionPoints: this.walletHttp.getCollectionPointOptions(),
          collectors: this.walletHttp.getAdminCollectorOptions(),
        }).pipe(
          tapResponse({
            next: ({ collectionPoints, collectors }) => {
              this.collectionPointOptionsSignal.set(
                collectionPoints.map((point) => ({
                  label: point.address ? `${point.name} · ${point.address}` : point.name,
                  value: point.id,
                })),
              );

              this.collectorOptionsSignal.set(
                collectors.map((user) => ({
                  label: user.email ? `${user.name} · ${user.email}` : user.name,
                  value: user.id,
                })),
              );
            },
            error: (error: unknown) => {
              this.topupOptionsErrorSignal.set(this.getErrorMessage(error));
            },
            finalize: () => {
              this.topupOptionsLoadingSignal.set(false);
            },
          }),
        ),
      ),
    ),
  );
}
