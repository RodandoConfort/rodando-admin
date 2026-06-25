import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal, untracked } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, exhaustMap, pipe, switchMap, tap } from 'rxjs';

import { PaginationMeta } from '../../../../core/api/pagination.model';

import { PricePoliciesHttp } from './price-policies.http';
import {
  CreatePricePolicyPayload,
  PricePoliciesQuery,
  PricePolicy,
  PricePolicyScopeType,
  UpdatePricePolicyPayload,
} from './price-policies.models';

interface UpdatePolicyCommand {
  id: string;
  payload: UpdatePricePolicyPayload;
}

interface SetPolicyActiveCommand {
  id: string;
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
export class PricePoliciesStore {
  private readonly http = inject(PricePoliciesHttp);

  private readonly querySignal = signal<PricePoliciesQuery>({
    page: 1,
    limit: 10,
  });

  private readonly policiesSignal = signal<readonly PricePolicy[]>([]);
  private readonly paginationSignal = signal<PaginationMeta>(EMPTY_PAGINATION_META);

  private readonly listLoadingSignal = signal(false);
  private readonly listErrorSignal = signal<string | null>(null);

  readonly query = this.querySignal.asReadonly();
  readonly policies = this.policiesSignal.asReadonly();
  readonly pagination = this.paginationSignal.asReadonly();
  readonly listLoading = this.listLoadingSignal.asReadonly();
  readonly listError = this.listErrorSignal.asReadonly();

  readonly loadPolicies = rxMethod<PricePoliciesQuery>(
    pipe(
      tap(() => {
        this.listLoadingSignal.set(true);
        this.listErrorSignal.set(null);
      }),
      switchMap((query) =>
        this.http.getPolicies(query).pipe(
          tapResponse({
            next: (response) => {
              this.policiesSignal.set(response.items);
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

  readonly searchPolicies = rxMethod<string>(
    pipe(
      debounceTime(300),
      tap((term) => {
        const query = this.patchQuery({
          page: 1,
          search: term.trim() || undefined,
        });

        this.loadPolicies(query);
      }),
    ),
  );

  enterPoliciesList(): void {
    const query = untracked(() => this.querySignal());
    this.loadPolicies(query);
  }

  reloadPolicies(): void {
    const query = untracked(() => this.querySignal());
    this.loadPolicies(query);
  }

  setScopeFilter(scopeType: PricePolicyScopeType | null): void {
    const query = this.patchQuery({
      page: 1,
      scopeType,
    });

    this.loadPolicies(query);
  }

  setActiveFilter(active: boolean | null): void {
    const query = this.patchQuery({
      page: 1,
      active,
    });

    this.loadPolicies(query);
  }

  setPage(page: number, limit: number): void {
    const query = this.patchQuery({
      page,
      limit,
    });

    this.loadPolicies(query);
  }

  private readonly selectedPolicySignal = signal<PricePolicy | null>(null);
  private readonly detailLoadingSignal = signal(false);
  private readonly detailErrorSignal = signal<string | null>(null);

  readonly selectedPolicy = this.selectedPolicySignal.asReadonly();
  readonly detailLoading = this.detailLoadingSignal.asReadonly();
  readonly detailError = this.detailErrorSignal.asReadonly();

  readonly loadPolicyDetail = rxMethod<string>(
    pipe(
      tap(() => {
        this.detailLoadingSignal.set(true);
        this.detailErrorSignal.set(null);
        this.selectedPolicySignal.set(null);
      }),
      switchMap((id) =>
        this.http.getPolicyById(id).pipe(
          tapResponse({
            next: (policy) => {
              this.selectedPolicySignal.set(policy);
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

  clearSelectedPolicy(): void {
    this.selectedPolicySignal.set(null);
    this.detailErrorSignal.set(null);
  }

  private readonly createSavingSignal = signal(false);
  private readonly createErrorSignal = signal<string | null>(null);
  private readonly createdPolicySignal = signal<PricePolicy | null>(null);

  readonly createSaving = this.createSavingSignal.asReadonly();
  readonly createError = this.createErrorSignal.asReadonly();
  readonly createdPolicy = this.createdPolicySignal.asReadonly();

  readonly createPolicy = rxMethod<CreatePricePolicyPayload>(
    pipe(
      tap(() => {
        this.createSavingSignal.set(true);
        this.createErrorSignal.set(null);
        this.createdPolicySignal.set(null);
      }),
      exhaustMap((payload) =>
        this.http.createPolicy(payload).pipe(
          tapResponse({
            next: (policy) => {
              this.createdPolicySignal.set(policy);
              this.reloadPolicies();
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
    this.createdPolicySignal.set(null);
  }

  setLocalCreateError(message: string): void {
    this.createErrorSignal.set(message);
  }

  private readonly updateSavingSignal = signal(false);
  private readonly updateErrorSignal = signal<string | null>(null);
  private readonly updatedPolicySignal = signal<PricePolicy | null>(null);

  readonly updateSaving = this.updateSavingSignal.asReadonly();
  readonly updateError = this.updateErrorSignal.asReadonly();
  readonly updatedPolicy = this.updatedPolicySignal.asReadonly();

  readonly updatePolicy = rxMethod<UpdatePolicyCommand>(
    pipe(
      tap(() => {
        this.updateSavingSignal.set(true);
        this.updateErrorSignal.set(null);
        this.updatedPolicySignal.set(null);
      }),
      exhaustMap(({ id, payload }) =>
        this.http.updatePolicy(id, payload).pipe(
          tapResponse({
            next: (policy) => {
              this.updatedPolicySignal.set(policy);
              this.selectedPolicySignal.set(policy);
              this.reloadPolicies();
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
    this.updatedPolicySignal.set(null);
  }

  setLocalUpdateError(message: string): void {
    this.updateErrorSignal.set(message);
  }

  private readonly activeSavingIdSignal = signal<string | null>(null);
  private readonly activeErrorSignal = signal<string | null>(null);

  readonly activeSavingId = this.activeSavingIdSignal.asReadonly();
  readonly activeError = this.activeErrorSignal.asReadonly();

  readonly setPolicyActive = rxMethod<SetPolicyActiveCommand>(
    pipe(
      tap(({ id }) => {
        this.activeSavingIdSignal.set(id);
        this.activeErrorSignal.set(null);
      }),
      exhaustMap(({ id, active }) =>
        this.http.setPolicyActive(id, active).pipe(
          tapResponse({
            next: (policy) => {
              this.policiesSignal.update((items) =>
                items.map((item) => (item.id === policy.id ? policy : item)),
              );

              const selected = this.selectedPolicySignal();

              if (selected?.id === policy.id) {
                this.selectedPolicySignal.set(policy);
              }
            },
            error: (error: unknown) => {
              this.activeErrorSignal.set(this.getErrorMessage(error));
            },
            finalize: () => {
              this.activeSavingIdSignal.set(null);
            },
          }),
        ),
      ),
    ),
  );

  private patchQuery(patch: Partial<PricePoliciesQuery>): PricePoliciesQuery {
    const query: PricePoliciesQuery = {
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
