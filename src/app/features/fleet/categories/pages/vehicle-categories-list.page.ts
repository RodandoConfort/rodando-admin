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

import { FleetSegments } from '../../components/fleet-segments/fleet-segments';

import { DataTable } from '../../../../shared/table/data-table/data-table';
import {
  DataTablePageChangeEvent,
  TableActionEvent,
  TableFilterChangeEvent,
} from '../../../../shared/table/table.types';

import { VehicleCategoriesStore } from '../data-access/vehicle-categories.store';
import { VehicleCategory } from '../data-access/vehicle-categories.models';
import { buildVehicleCategoriesTableConfig } from '../config/vehicle-categories-table.config';

@Component({
  selector: 'app-vehicle-categories-list-page',
  standalone: true,
  imports: [
    EntityPageCard,
    FleetSegments,
    DataTable,
  ],
  template: `
    <app-entity-page-card
      title="Categorías de vehículos"
      subtitle="Gestiona las categorías administrativas de vehículos."
      icon="category"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      <div class="fleet-page-toolbar">
        <app-fleet-segments />
      </div>

      @if (store.deleteError(); as deleteError) {
        <div class="vehicle-categories-list-page__error" role="alert">
          {{ deleteError }}
        </div>
      }

      <app-data-table
        [items]="store.categories()"
        [config]="tableConfig()"
        [loading]="store.listLoading()"
        [error]="store.listError()"
        (retry)="store.reloadCategories()"
        (create)="goToCreate()"
        (rowClick)="goToDetail($event)"
        (actionClick)="handleAction($event)"
        (searchChange)="store.searchCategories($event)"
        (filterChange)="handleFilterChange($event)"
        (pageChange)="handlePageChange($event)"
      />
    </app-entity-page-card>
  `,
  styles: `
    .fleet-page-toolbar {
      margin-bottom: 1.25rem;
    }

    .vehicle-categories-list-page__error {
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

    html[data-theme='dark'] .vehicle-categories-list-page__error {
      color: #fca5a5;
      background: rgb(220 38 38 / 12%);
      border-color: rgb(248 113 113 / 28%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleCategoriesListPage {
  readonly store = inject(VehicleCategoriesStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly cardActions = computed<readonly EntityPageCardAction[]>(() => [
    {
      key: 'create',
      label: 'Nueva categoría',
      icon: 'add',
      placement: 'header',
      variant: 'filled',
      tone: 'primary',
    },
  ]);

  readonly tableConfig = computed(() =>
    buildVehicleCategoriesTableConfig(
      this.store.query(),
      this.store.pagination(),
      this.store.deletingCategoryId(),
    ),
  );

  private readonly enterPageEffect = effect(() => {
    this.store.enterCategoriesList();
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

  goToDetail(category: VehicleCategory): void {
    this.router.navigate([category.id], {
      relativeTo: this.route,
    });
  }

  handleAction(event: TableActionEvent<VehicleCategory>): void {
    const { actionKey, item } = event;

    if (actionKey === 'edit') {
      this.router.navigate([item.id, 'edit'], {
        relativeTo: this.route,
      });

      return;
    }

    if (actionKey === 'delete') {
      this.store.deleteCategory(item.id);
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
