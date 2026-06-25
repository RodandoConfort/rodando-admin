import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EntityPageCard } from '../../../../shared/components/entity-page-card/entity-page-card';
import { EntityPageCardAction } from '../../../../shared/components/entity-page-card/entity-page-card.types';
import { DataTable } from '../../../../shared/table/data-table/data-table';
import {
  DataTablePageChangeEvent,
  TableActionEvent,
  TableFilterChangeEvent,
} from '../../../../shared/table/table.types';

import { PricePoliciesSegments } from '../components/price-policies-segments/price-policies-segments';
import { buildPricePoliciesTableConfig } from '../config/price-policies-table.config';
import { PricePoliciesStore } from '../data-access/price-policies.store';
import {
  PricePolicy,
  PricePolicyScopeType,
} from '../data-access/price-policies.models';

@Component({
  selector: 'app-price-policies-list-page',
  standalone: true,
  imports: [
    EntityPageCard,
    DataTable,
    PricePoliciesSegments,
  ],
  template: `
    <app-entity-page-card
      title="Políticas de precio"
      subtitle="Gestiona reglas globales, por ciudad o por zona para el cálculo de tarifas."
      icon="payments"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      <app-price-policies-segments />

      @if (store.activeError(); as activeError) {
        <div class="price-policies-page__error" role="alert">
          {{ activeError }}
        </div>
      }

      <app-data-table
        [items]="store.policies()"
        [config]="tableConfig()"
        [loading]="store.listLoading()"
        [error]="store.listError()"
        (retry)="store.reloadPolicies()"
        (create)="goToCreate()"
        (rowClick)="goToDetail($event)"
        (actionClick)="handleAction($event)"
        (searchChange)="store.searchPolicies($event)"
        (filterChange)="handleFilterChange($event)"
        (pageChange)="handlePageChange($event)"
      />
    </app-entity-page-card>
  `,
  styles: `
    .price-policies-page__error {
      margin-bottom: 1.25rem;
      padding: 0.95rem 1rem;
      color: var(--app-danger);
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-lg);
      font-size: 0.9rem;
      font-weight: 750;
      line-height: 1.5;
    }

    html[data-theme='dark'] .price-policies-page__error {
      color: #fca5a5;
      background: rgb(220 38 38 / 12%);
      border-color: rgb(248 113 113 / 28%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricePoliciesListPage {
  readonly store = inject(PricePoliciesStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly cardActions = computed<readonly EntityPageCardAction[]>(() => [
    {
      key: 'create',
      label: 'Nueva política',
      icon: 'add',
      placement: 'header',
      variant: 'filled',
      tone: 'primary',
    },
  ]);

  readonly tableConfig = computed(() =>
    buildPricePoliciesTableConfig(
      this.store.query(),
      this.store.pagination(),
      this.store.activeSavingId(),
    ),
  );

  private readonly enterPageEffect = effect(() => {
    this.store.enterPoliciesList();
  });

  onCardAction(actionKey: string): void {
    if (actionKey === 'create') {
      this.goToCreate();
    }
  }

  goToCreate(): void {
    this.router.navigate(['create'], {
      relativeTo: this.route,
    });
  }

  goToDetail(policy: PricePolicy): void {
    this.router.navigate([policy.id], {
      relativeTo: this.route,
    });
  }

  goToEdit(policy: PricePolicy): void {
    this.router.navigate([policy.id, 'edit'], {
      relativeTo: this.route,
    });
  }

  handleAction(event: TableActionEvent<PricePolicy>): void {
    const { actionKey, item } = event;

    if (actionKey === 'detail') {
      this.goToDetail(item);
      return;
    }

    if (actionKey === 'edit') {
      this.goToEdit(item);
      return;
    }

    if (actionKey === 'toggle-active') {
      this.store.setPolicyActive({
        id: item.id,
        active: !item.active,
      });
    }
  }

  handleFilterChange(event: TableFilterChangeEvent): void {
    if (event.key === 'scopeType') {
      this.store.setScopeFilter(event.value as PricePolicyScopeType | null);
      return;
    }

    if (event.key === 'active') {
      this.store.setActiveFilter(event.value as boolean | null);
    }
  }

  handlePageChange(event: DataTablePageChangeEvent): void {
    this.store.setPage(
      event.pageIndex + 1,
      event.pageSize,
    );
  }
}
