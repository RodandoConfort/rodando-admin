import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal, untracked } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, exhaustMap, pipe, switchMap, tap } from 'rxjs';

import { SystemSettingsHttp } from './system-settings.http';
import {
  CreateSystemSettingPayload,
  SystemSetting,
  SystemSettingGroup,
  SystemSettingsQuery,
  UpdateSystemSettingPayload,
} from './system-settings.models';
import { PaginationMeta } from '../../../../core/api/pagination.model';

interface UpdateSettingCommand {
  key: string;
  payload: UpdateSystemSettingPayload;
}

interface SetSettingActiveCommand {
  key: string;
  active: boolean;
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
export class SystemSettingsStore {
  private readonly http = inject(SystemSettingsHttp);

  private readonly querySignal = signal<SystemSettingsQuery>({
    page: 1,
    limit: 10,
  });

  private readonly settingsSignal = signal<readonly SystemSetting[]>([]);
  private readonly paginationSignal = signal<PaginationMeta>(EMPTY_PAGINATION_META);

  private readonly listLoadingSignal = signal(false);
  private readonly listErrorSignal = signal<string | null>(null);

  readonly query = this.querySignal.asReadonly();
  readonly settings = this.settingsSignal.asReadonly();
  readonly pagination = this.paginationSignal.asReadonly();
  readonly listLoading = this.listLoadingSignal.asReadonly();
  readonly listError = this.listErrorSignal.asReadonly();

  readonly loadSettings = rxMethod<SystemSettingsQuery>(
    pipe(
      tap(() => {
        this.listLoadingSignal.set(true);
        this.listErrorSignal.set(null);
      }),
      switchMap((query) =>
        this.http.getSettings(query).pipe(
          tapResponse({
            next: (response) => {
              this.settingsSignal.set(response.items);
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

  readonly searchSettings = rxMethod<string>(
    pipe(
      debounceTime(300),
      tap((term) => {
        const query = this.patchQuery({
          page: 1,
          search: term.trim() || undefined,
        });

        this.loadSettings(query);
      }),
    ),
  );

  enterSettingsList(): void {
    const query = untracked(() => this.querySignal());
    this.loadSettings(query);
  }

  reloadSettings(): void {
    const query = untracked(() => this.querySignal());
    this.loadSettings(query);
  }

  setGroupFilter(group: SystemSettingGroup | null): void {
    const query = this.patchQuery({
      page: 1,
      group,
    });

    this.loadSettings(query);
  }

  setActiveFilter(active: boolean | null): void {
    const query = this.patchQuery({
      page: 1,
      active,
    });

    this.loadSettings(query);
  }

  setPublicFilter(isPublic: boolean | null): void {
    const query = this.patchQuery({
      page: 1,
      isPublic,
    });

    this.loadSettings(query);
  }

  setPage(page: number, limit: number): void {
    const query = this.patchQuery({
      page,
      limit,
    });

    this.loadSettings(query);
  }

  private readonly selectedSettingSignal = signal<SystemSetting | null>(null);
  private readonly detailLoadingSignal = signal(false);
  private readonly detailErrorSignal = signal<string | null>(null);

  readonly selectedSetting = this.selectedSettingSignal.asReadonly();
  readonly detailLoading = this.detailLoadingSignal.asReadonly();
  readonly detailError = this.detailErrorSignal.asReadonly();

  readonly loadSettingDetail = rxMethod<string>(
    pipe(
      tap(() => {
        this.detailLoadingSignal.set(true);
        this.detailErrorSignal.set(null);
        this.selectedSettingSignal.set(null);
      }),
      switchMap((key) =>
        this.http.getSettingByKey(key).pipe(
          tapResponse({
            next: (setting) => {
              this.selectedSettingSignal.set(setting);
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

  clearSelectedSetting(): void {
    this.selectedSettingSignal.set(null);
    this.detailErrorSignal.set(null);
  }

  private readonly createSavingSignal = signal(false);
  private readonly createErrorSignal = signal<string | null>(null);
  private readonly createdSettingSignal = signal<SystemSetting | null>(null);

  readonly createSaving = this.createSavingSignal.asReadonly();
  readonly createError = this.createErrorSignal.asReadonly();
  readonly createdSetting = this.createdSettingSignal.asReadonly();

  readonly createSetting = rxMethod<CreateSystemSettingPayload>(
    pipe(
      tap(() => {
        this.createSavingSignal.set(true);
        this.createErrorSignal.set(null);
        this.createdSettingSignal.set(null);
      }),
      exhaustMap((payload) =>
        this.http.createSetting(payload).pipe(
          tapResponse({
            next: (setting) => {
              this.createdSettingSignal.set(setting);
              this.reloadSettings();
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
    this.createdSettingSignal.set(null);
  }

  private readonly updateSavingSignal = signal(false);
  private readonly updateErrorSignal = signal<string | null>(null);
  private readonly updatedSettingSignal = signal<SystemSetting | null>(null);

  readonly updateSaving = this.updateSavingSignal.asReadonly();
  readonly updateError = this.updateErrorSignal.asReadonly();
  readonly updatedSetting = this.updatedSettingSignal.asReadonly();

  readonly updateSetting = rxMethod<UpdateSettingCommand>(
    pipe(
      tap(() => {
        this.updateSavingSignal.set(true);
        this.updateErrorSignal.set(null);
        this.updatedSettingSignal.set(null);
      }),
      exhaustMap(({ key, payload }) =>
        this.http.updateSetting(key, payload).pipe(
          tapResponse({
            next: (setting) => {
              this.updatedSettingSignal.set(setting);
              this.selectedSettingSignal.set(setting);
              this.reloadSettings();
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
    this.updatedSettingSignal.set(null);
  }

  private readonly activeSavingKeySignal = signal<string | null>(null);
  private readonly activeErrorSignal = signal<string | null>(null);

  readonly activeSavingKey = this.activeSavingKeySignal.asReadonly();
  readonly activeError = this.activeErrorSignal.asReadonly();

  readonly setSettingActive = rxMethod<SetSettingActiveCommand>(
    pipe(
      tap(({ key }) => {
        this.activeSavingKeySignal.set(key);
        this.activeErrorSignal.set(null);
      }),
      exhaustMap(({ key, active }) =>
        this.http.setSettingActive(key, active).pipe(
          tapResponse({
            next: (setting) => {
              this.settingsSignal.update((items) =>
                items.map((item) => (item.key === setting.key ? setting : item)),
              );

              const selected = this.selectedSettingSignal();

              if (selected?.key === setting.key) {
                this.selectedSettingSignal.set(setting);
              }
            },
            error: (error: unknown) => {
              this.activeErrorSignal.set(this.getErrorMessage(error));
            },
            finalize: () => {
              this.activeSavingKeySignal.set(null);
            },
          }),
        ),
      ),
    ),
  );

  private patchQuery(patch: Partial<SystemSettingsQuery>): SystemSettingsQuery {
    const query: SystemSettingsQuery = {
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

  setLocalCreateError(message: string): void {
    this.createErrorSignal.set(message);
  }

  setLocalUpdateError(message: string): void {
    this.updateErrorSignal.set(message);
  }
}
