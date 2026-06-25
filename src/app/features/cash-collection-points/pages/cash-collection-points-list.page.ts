import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EntityPageCard } from '../../../shared/components/entity-page-card/entity-page-card';
import { EntityPageCardAction } from '../../../shared/components/entity-page-card/entity-page-card.types';
import { DataTable } from '../../../shared/table/data-table/data-table';
import {
  DataTablePageChangeEvent,
  TableActionEvent,
  TableFilterChangeEvent,
} from '../../../shared/table/table.types';

import { CashCollectionPointsStore } from '../data-access/cash-collection-points.store';
import { CashCollectionPoint } from '../data-access/cash-collection-points.models';
import { buildCashCollectionPointsTableConfig } from '../config/cash-collection-points-table.config';

@Component({
  selector: 'app-cash-collection-points-list-page',
  standalone: true,
  imports: [
    EntityPageCard,
    DataTable,
  ],
  template: `
    <app-entity-page-card
      title="Puntos de recaudo"
      subtitle="Gestiona las oficinas o puntos donde se reciben recargas en efectivo."
      icon="storefront"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      @if (store.deleteError(); as deleteError) {
        <div class="cash-collection-points-page__error" role="alert">
          {{ deleteError }}
        </div>
      }

      <app-data-table
        [items]="store.points()"
        [config]="tableConfig()"
        [loading]="store.listLoading()"
        [error]="store.listError()"
        (retry)="store.reloadPoints()"
        (create)="goToCreate()"
        (rowClick)="goToDetail($event)"
        (actionClick)="handleAction($event)"
        (searchChange)="store.searchPoints($event)"
        (filterChange)="handleFilterChange($event)"
        (pageChange)="handlePageChange($event)"
      />
    </app-entity-page-card>
  `,
  styles: `
    .cash-collection-points-page__error {
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

    html[data-theme='dark'] .cash-collection-points-page__error {
      color: #fca5a5;
      background: rgb(220 38 38 / 12%);
      border-color: rgb(248 113 113 / 28%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashCollectionPointsListPage {
  readonly store = inject(CashCollectionPointsStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly cardActions = computed<readonly EntityPageCardAction[]>(() => [
    {
      key: 'create',
      label: 'Nuevo punto',
      icon: 'add_location_alt',
      placement: 'header',
      variant: 'filled',
      tone: 'primary',
    },
  ]);

  readonly tableConfig = computed(() =>
    buildCashCollectionPointsTableConfig(
      this.store.query(),
      this.store.pagination(),
      this.store.deletingPointId(),
    ),
  );

  private readonly enterPageEffect = effect(() => {
    this.store.enterPointsList();
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

  goToDetail(point: CashCollectionPoint): void {
    this.router.navigate([point.id], {
      relativeTo: this.route,
    });
  }

  goToEdit(point: CashCollectionPoint): void {
    this.router.navigate([point.id, 'edit'], {
      relativeTo: this.route,
    });
  }

  handleAction(event: TableActionEvent<CashCollectionPoint>): void {
    const { actionKey, item } = event;

    if (actionKey === 'detail') {
      this.goToDetail(item);
      return;
    }

    if (actionKey === 'edit') {
      this.goToEdit(item);
      return;
    }

    if (actionKey === 'delete') {
      this.store.deletePoint(item.id);
    }
  }

  handleFilterChange(event: TableFilterChangeEvent): void {
    if (event.key === 'isActive') {
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
