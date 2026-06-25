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

import { FleetSegments } from '../../components/fleet-segments/fleet-segments';

import { VehicleTypesStore } from '../data-access/vehicle-types.store';
import { VehicleType } from '../data-access/vehicle-types.models';
import { buildVehicleTypesTableConfig } from '../config/vehicle-types-table.config';

@Component({
  selector: 'app-vehicle-types-list-page',
  standalone: true,
  imports: [
    EntityPageCard,
    FleetSegments,
    DataTable,
  ],
  template: `
    <app-entity-page-card
      title="Tipos de vehículos"
      subtitle="Gestiona los tipos operativos, tarifas y clases de servicio asociadas."
      icon="airport_shuttle"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      <div class="fleet-page-toolbar">
        <app-fleet-segments />
      </div>

      @if (store.deleteError(); as deleteError) {
        <div class="vehicle-types-list-page__error" role="alert">
          {{ deleteError }}
        </div>
      }

      <app-data-table
        [items]="store.types()"
        [config]="tableConfig()"
        [loading]="store.listLoading()"
        [error]="store.listError()"
        (retry)="store.reloadTypes()"
        (create)="goToCreate()"
        (rowClick)="goToDetail($event)"
        (actionClick)="handleAction($event)"
        (searchChange)="store.searchTypes($event)"
        (filterChange)="handleFilterChange($event)"
        (pageChange)="handlePageChange($event)"
      />
    </app-entity-page-card>
  `,
  styles: `
    .fleet-page-toolbar {
      margin-bottom: 1.25rem;
    }

    .vehicle-types-list-page__error {
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

    html[data-theme='dark'] .vehicle-types-list-page__error {
      color: #fca5a5;
      background: rgb(220 38 38 / 12%);
      border-color: rgb(248 113 113 / 28%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleTypesListPage {
  readonly store = inject(VehicleTypesStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly cardActions = computed<readonly EntityPageCardAction[]>(() => [
    {
      key: 'create',
      label: 'Nuevo tipo',
      icon: 'add',
      placement: 'header',
      variant: 'filled',
      tone: 'primary',
    },
  ]);

  readonly tableConfig = computed(() =>
    buildVehicleTypesTableConfig(
      this.store.query(),
      this.store.pagination(),
      this.store.deletingTypeId(),
      this.store.categoryOptions(),
    ),
  );

  private readonly enterPageEffect = effect(() => {
    this.store.enterTypesList();
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

  goToDetail(type: VehicleType): void {
    this.router.navigate([type.id], {
      relativeTo: this.route,
    });
  }

  goToEdit(type: VehicleType): void {
    this.router.navigate([type.id, 'edit'], {
      relativeTo: this.route,
    });
  }

  handleAction(event: TableActionEvent<VehicleType>): void {
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
      this.store.deleteType(item.id);
    }
  }

  handleFilterChange(event: TableFilterChangeEvent): void {
    if (event.key === 'categoryId') {
      this.store.setCategoryFilter(event.value as string | null);
      return;
    }

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
