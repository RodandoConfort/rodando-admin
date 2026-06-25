import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EntityPageCard } from '../../../../shared/components/entity-page-card/entity-page-card';
import { DataTable } from '../../../../shared/table/data-table/data-table';
import {
  DataTablePageChangeEvent,
  TableActionEvent,
  TableFilterChangeEvent,
} from '../../../../shared/table/table.types';

import { FleetSegments } from '../../components/fleet-segments/fleet-segments';

import {
  Vehicle,
  VehicleStatus,
} from '../data-access/vehicles.models';
import { VehiclesStore } from '../data-access/vehicles.store';
import { buildVehiclesTableConfig } from '../config/vehicles-table.config';

@Component({
  selector: 'app-vehicles-list-page',
  standalone: true,
  imports: [
    EntityPageCard,
    FleetSegments,
    DataTable,
  ],
  template: `
    <app-entity-page-card
      title="Vehículos"
      subtitle="Consulta y administra los vehículos registrados desde el onboarding de conductores."
      icon="directions_car"
      [actions]="[]"
    >
      <div class="fleet-page-toolbar">
        <app-fleet-segments />
      </div>

      <app-data-table
        [items]="store.vehicles()"
        [config]="tableConfig()"
        [loading]="store.listLoading()"
        [error]="store.listError()"
        (retry)="store.reloadVehicles()"
        (rowClick)="goToDetail($event)"
        (actionClick)="handleAction($event)"
        (searchChange)="store.searchVehicles($event)"
        (filterChange)="handleFilterChange($event)"
        (pageChange)="handlePageChange($event)"
      />
    </app-entity-page-card>
  `,
  styles: `
    .fleet-page-toolbar {
      margin-bottom: 1.25rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehiclesListPage {
  readonly store = inject(VehiclesStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly tableConfig = computed(() =>
    buildVehiclesTableConfig(
      this.store.query(),
      this.store.pagination(),
      this.store.categoryOptions(),
      this.store.serviceClassOptions(),
      this.store.vehicleTypeOptions(),
    ),
  );

  private readonly enterPageEffect = effect(() => {
    this.store.enterVehiclesList();
  });

  goToDetail(vehicle: Vehicle): void {
    this.router.navigate([vehicle.id], {
      relativeTo: this.route,
    });
  }

  goToEdit(vehicle: Vehicle): void {
    this.router.navigate([vehicle.id, 'edit'], {
      relativeTo: this.route,
    });
  }

  handleAction(event: TableActionEvent<Vehicle>): void {
    const { actionKey, item } = event;

    if (actionKey === 'detail') {
      this.goToDetail(item);
      return;
    }

    if (actionKey === 'edit') {
      this.goToEdit(item);
    }
  }

  handleFilterChange(event: TableFilterChangeEvent): void {
    if (event.key === 'categoryId') {
      this.store.setCategoryFilter(event.value as string | null);
      return;
    }

    if (event.key === 'serviceClassId') {
      this.store.setServiceClassFilter(event.value as string | null);
      return;
    }

    if (event.key === 'vehicleTypeId') {
      this.store.setVehicleTypeFilter(event.value as string | null);
      return;
    }

    if (event.key === 'status') {
      this.store.setStatusFilter(event.value as VehicleStatus | null);
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
