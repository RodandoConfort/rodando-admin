import { Injectable, computed, inject, signal, untracked } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, exhaustMap, pipe, switchMap, tap } from 'rxjs';

import { UsersHttp } from './users.http';
import {
  AdminUser,
  AdminUsersQuery,
  ChangeOwnPasswordPayload,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
  UpdateOwnProfilePayload,
  UserProfile,
  UserStatus,
  UserType,
} from './users.models';
import { PaginationMeta } from '../../../core/api/pagination.model';

interface UpdateUserCommand {
  id: string;
  payload: UpdateAdminUserPayload;
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
export class UsersStore {
  private readonly usersHttp = inject(UsersHttp);

  // ─────────────────────────────────────────────
  // LISTADO ADMIN
  // ─────────────────────────────────────────────

  private readonly querySignal = signal<AdminUsersQuery>({
    page: 1,
    limit: 10,
  });

  private readonly usersSignal = signal<readonly AdminUser[]>([]);
  private readonly paginationSignal = signal<PaginationMeta>(EMPTY_PAGINATION_META);

  private readonly listLoadingSignal = signal(false);
  private readonly listErrorSignal = signal<string | null>(null);

  readonly query = this.querySignal.asReadonly();
  readonly users = this.usersSignal.asReadonly();
  readonly pagination = this.paginationSignal.asReadonly();
  readonly listLoading = this.listLoadingSignal.asReadonly();
  readonly listError = this.listErrorSignal.asReadonly();

  readonly hasUsers = computed(() => this.usersSignal().length > 0);

  readonly loadUsers = rxMethod<AdminUsersQuery>(
    pipe(
      tap(() => {
        this.listLoadingSignal.set(true);
        this.listErrorSignal.set(null);
      }),
      switchMap((query) =>
        this.usersHttp.getUsers(query).pipe(
          tapResponse({
            next: (response) => {
              this.usersSignal.set(response.items);
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

  // readonly searchByEmail = rxMethod<string>(
  //   pipe(
  //     debounceTime(300),
  //     tap((email) => {
  //       const query = this.patchQuery({
  //         page: 1,
  //         email: email.trim() || undefined,
  //       });

  //       this.loadUsers(query);
  //     }),
  //   ),
  // );

  readonly searchUsers = rxMethod<string>(
    pipe(
      debounceTime(300),
      tap((term) => {
        const query = this.patchQuery({
          page: 1,
          search: term.trim() || undefined,
        });

        this.loadUsers(query);
      }),
    ),
  );

  enterUsersList(): void {
    const query = untracked(() => this.querySignal());
    this.loadUsers(query);
  }

  reloadUsers(): void {
    const query = untracked(() => this.querySignal());
    this.loadUsers(query);
  }

  setUserTypeFilter(userType: UserType | null): void {
    const query = this.patchQuery({
      page: 1,
      userType,
    });

    this.loadUsers(query);
  }

  setStatusFilter(status: UserStatus | null): void {
    const query = this.patchQuery({
      page: 1,
      status,
    });

    this.loadUsers(query);
  }

  setPage(page: number, limit: number): void {
    const query = this.patchQuery({
      page,
      limit,
    });

    this.loadUsers(query);
  }

  // ─────────────────────────────────────────────
  // DETALLE ADMIN
  // ─────────────────────────────────────────────

  private readonly selectedUserSignal = signal<AdminUser | null>(null);
  private readonly detailLoadingSignal = signal(false);
  private readonly detailErrorSignal = signal<string | null>(null);

  readonly selectedUser = this.selectedUserSignal.asReadonly();
  readonly detailLoading = this.detailLoadingSignal.asReadonly();
  readonly detailError = this.detailErrorSignal.asReadonly();

  readonly loadUserDetail = rxMethod<string>(
    pipe(
      tap(() => {
        this.detailLoadingSignal.set(true);
        this.detailErrorSignal.set(null);
        this.selectedUserSignal.set(null);
      }),
      switchMap((id) =>
        this.usersHttp.getUserById(id).pipe(
          tapResponse({
            next: (user) => {
              this.selectedUserSignal.set(user);
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

  clearSelectedUser(): void {
    this.selectedUserSignal.set(null);
    this.detailErrorSignal.set(null);
  }

  // ─────────────────────────────────────────────
  // CREAR USUARIO ADMIN
  // ─────────────────────────────────────────────

  private readonly createSavingSignal = signal(false);
  private readonly createErrorSignal = signal<string | null>(null);
  private readonly createdUserSignal = signal<AdminUser | null>(null);

  readonly createSaving = this.createSavingSignal.asReadonly();
  readonly createError = this.createErrorSignal.asReadonly();
  readonly createdUser = this.createdUserSignal.asReadonly();

  readonly createUser = rxMethod<CreateAdminUserPayload>(
    pipe(
      tap(() => {
        this.createSavingSignal.set(true);
        this.createErrorSignal.set(null);
        this.createdUserSignal.set(null);
      }),
      exhaustMap((payload) =>
        this.usersHttp.createUser(payload).pipe(
          tapResponse({
            next: (user) => {
              this.createdUserSignal.set(user);
              this.reloadUsers();
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
    this.createdUserSignal.set(null);
  }

  // ─────────────────────────────────────────────
  // EDITAR USUARIO ADMIN
  // ─────────────────────────────────────────────

  private readonly updateSavingSignal = signal(false);
  private readonly updateErrorSignal = signal<string | null>(null);
  private readonly updatedUserSignal = signal<AdminUser | null>(null);

  readonly updateSaving = this.updateSavingSignal.asReadonly();
  readonly updateError = this.updateErrorSignal.asReadonly();
  readonly updatedUser = this.updatedUserSignal.asReadonly();

  readonly updateUser = rxMethod<UpdateUserCommand>(
    pipe(
      tap(() => {
        this.updateSavingSignal.set(true);
        this.updateErrorSignal.set(null);
        this.updatedUserSignal.set(null);
      }),
      exhaustMap(({ id, payload }) =>
        this.usersHttp.updateUser(id, payload).pipe(
          tapResponse({
            next: (user) => {
              this.updatedUserSignal.set(user);
              this.selectedUserSignal.set(user);
              this.reloadUsers();
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
    this.updatedUserSignal.set(null);
  }

  // ─────────────────────────────────────────────
  // ELIMINAR USUARIO ADMIN
  // ─────────────────────────────────────────────

  private readonly deletingUserIdSignal = signal<string | null>(null);
  private readonly deleteErrorSignal = signal<string | null>(null);

  readonly deletingUserId = this.deletingUserIdSignal.asReadonly();
  readonly deleteError = this.deleteErrorSignal.asReadonly();

  readonly deleteUser = rxMethod<string>(
    pipe(
      tap((id) => {
        this.deletingUserIdSignal.set(id);
        this.deleteErrorSignal.set(null);
      }),
      exhaustMap((id) =>
        this.usersHttp.deleteUser(id).pipe(
          tapResponse({
            next: () => {
              this.reloadUsers();

              const selectedUser = this.selectedUserSignal();

              if (selectedUser?.id === id) {
                this.clearSelectedUser();
              }
            },
            error: (error: unknown) => {
              this.deleteErrorSignal.set(this.getErrorMessage(error));
            },
            finalize: () => {
              this.deletingUserIdSignal.set(null);
            },
          }),
        ),
      ),
    ),
  );

  // ─────────────────────────────────────────────
  // PERFIL AUTH
  // ─────────────────────────────────────────────

  private readonly profileSignal = signal<UserProfile | null>(null);
  private readonly profileLoadingSignal = signal(false);
  private readonly profileErrorSignal = signal<string | null>(null);

  readonly profile = this.profileSignal.asReadonly();
  readonly profileLoading = this.profileLoadingSignal.asReadonly();
  readonly profileError = this.profileErrorSignal.asReadonly();

  readonly loadProfile = rxMethod<void>(
    pipe(
      tap(() => {
        this.profileLoadingSignal.set(true);
        this.profileErrorSignal.set(null);
      }),
      switchMap(() =>
        this.usersHttp.getProfile().pipe(
          tapResponse({
            next: (profile) => {
              this.profileSignal.set(profile);
            },
            error: (error: unknown) => {
              this.profileErrorSignal.set(this.getErrorMessage(error));
            },
            finalize: () => {
              this.profileLoadingSignal.set(false);
            },
          }),
        ),
      ),
    ),
  );

  // ─────────────────────────────────────────────
  // ACTUALIZAR PERFIL AUTH
  // ─────────────────────────────────────────────

  private readonly profileSavingSignal = signal(false);
  private readonly profileSaveErrorSignal = signal<string | null>(null);
  private readonly profileSavedSignal = signal(false);

  readonly profileSaving = this.profileSavingSignal.asReadonly();
  readonly profileSaveError = this.profileSaveErrorSignal.asReadonly();
  readonly profileSaved = this.profileSavedSignal.asReadonly();

  readonly updateProfile = rxMethod<UpdateOwnProfilePayload>(
    pipe(
      tap(() => {
        this.profileSavingSignal.set(true);
        this.profileSaveErrorSignal.set(null);
        this.profileSavedSignal.set(false);
      }),
      exhaustMap((payload) =>
        this.usersHttp.updateProfile(payload).pipe(
          tapResponse({
            next: (profile) => {
              this.profileSignal.set(profile);
              this.profileSavedSignal.set(true);
            },
            error: (error: unknown) => {
              this.profileSaveErrorSignal.set(this.getErrorMessage(error));
            },
            finalize: () => {
              this.profileSavingSignal.set(false);
            },
          }),
        ),
      ),
    ),
  );

  clearProfileSaveState(): void {
    this.profileSaveErrorSignal.set(null);
    this.profileSavedSignal.set(false);
  }

  // ─────────────────────────────────────────────
  // CAMBIAR PASSWORD AUTH
  // ─────────────────────────────────────────────

  private readonly passwordSavingSignal = signal(false);
  private readonly passwordErrorSignal = signal<string | null>(null);
  private readonly passwordChangedSignal = signal(false);

  readonly passwordSaving = this.passwordSavingSignal.asReadonly();
  readonly passwordError = this.passwordErrorSignal.asReadonly();
  readonly passwordChanged = this.passwordChangedSignal.asReadonly();

  readonly changePassword = rxMethod<ChangeOwnPasswordPayload>(
    pipe(
      tap(() => {
        this.passwordSavingSignal.set(true);
        this.passwordErrorSignal.set(null);
        this.passwordChangedSignal.set(false);
      }),
      exhaustMap((payload) =>
        this.usersHttp.changePassword(payload).pipe(
          tapResponse({
            next: () => {
              this.passwordChangedSignal.set(true);
            },
            error: (error: unknown) => {
              this.passwordErrorSignal.set(this.getErrorMessage(error));
            },
            finalize: () => {
              this.passwordSavingSignal.set(false);
            },
          }),
        ),
      ),
    ),
  );

  clearPasswordState(): void {
    this.passwordErrorSignal.set(null);
    this.passwordChangedSignal.set(false);
  }

  // ─────────────────────────────────────────────
  // PRIVADOS
  // ─────────────────────────────────────────────

  private patchQuery(patch: Partial<AdminUsersQuery>): AdminUsersQuery {
    const query: AdminUsersQuery = {
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
