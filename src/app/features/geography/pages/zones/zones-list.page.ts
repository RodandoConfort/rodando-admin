import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EntityPageCard } from '../../../../shared/components/entity-page-card/entity-page-card';
import { EntityPageCardAction } from '../../../../shared/components/entity-page-card/entity-page-card.types';
import { DataTable } from '../../../../shared/table/data-table/data-table';
import {
  DataTablePageChangeEvent,
  TableActionEvent,
  TableFilterChangeEvent,
} from '../../../../shared/table/table.types';

import { GeographySegments } from '../../components/geography-segments/geography-segments';
import { Zone } from '../../data-access/geography.models';
import { ZonesStore } from '../../data-access/zones.store';
import { buildZonesTableConfig } from '../../config/zones-table.config';

@Component({
  selector: 'app-zones-list-page',
  standalone: true,
  imports: [
    EntityPageCard,
    GeographySegments,
    DataTable,
  ],
  template: `
    <app-entity-page-card
      title="Zonas"
      subtitle="Gestiona zonas operativas por ciudad, prioridad y cobertura."
      icon="map"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      <app-geography-segments />

      <app-data-table
        [items]="store.zones()"
        [config]="tableConfig()"
        [loading]="store.listLoading()"
        [error]="store.listError()"
        (retry)="store.reloadZones()"
        (create)="goToCreate()"
        (rowClick)="goToDetail($event)"
        (actionClick)="handleAction($event)"
        (searchChange)="store.searchZones($event)"
        (filterChange)="handleFilterChange($event)"
        (pageChange)="handlePageChange($event)"
      />
    </app-entity-page-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZonesListPage {
  readonly store = inject(ZonesStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly cardActions = computed<readonly EntityPageCardAction[]>(() => [
    {
      key: 'create',
      label: 'Nueva zona',
      icon: 'add_location_alt',
      placement: 'header',
      variant: 'filled',
      tone: 'primary',
    },
  ]);

  readonly tableConfig = computed(() =>
    buildZonesTableConfig(
      this.store.query(),
      this.store.pagination(),
      this.store.cityOptions(),
    ),
  );

  private readonly enterPageEffect = effect(() => {
    this.store.enterList();
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

  goToDetail(zone: Zone): void {
    this.router.navigate([zone.id], {
      relativeTo: this.route,
    });
  }

  goToEdit(zone: Zone): void {
    this.router.navigate([zone.id, 'edit'], {
      relativeTo: this.route,
    });
  }

  handleAction(event: TableActionEvent<Zone>): void {
    if (event.actionKey === 'detail') {
      this.goToDetail(event.item);
      return;
    }

    if (event.actionKey === 'edit') {
      this.goToEdit(event.item);
    }
  }

  handleFilterChange(event: TableFilterChangeEvent): void {
    if (event.key === 'cityId') {
      this.store.setCityFilter(event.value as string | null);
      return;
    }

    if (event.key === 'active') {
      this.store.setActiveFilter(event.value as boolean | null);
    }
  }

  handlePageChange(event: DataTablePageChangeEvent): void {
    this.store.setPage(event.pageIndex + 1, event.pageSize);
  }
}
