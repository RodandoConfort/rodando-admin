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
import { CitiesStore } from '../../data-access/cities.store';
import { City } from '../../data-access/geography.models';
import { buildCitiesTableConfig } from '../../config/cities-table.config';

@Component({
  selector: 'app-cities-list-page',
  standalone: true,
  imports: [
    EntityPageCard,
    GeographySegments,
    DataTable,
  ],
  template: `
    <app-entity-page-card
      title="Ciudades"
      subtitle="Gestiona las ciudades operativas, su país y zona horaria."
      icon="location_city"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      <app-geography-segments />

      <app-data-table
        [items]="store.cities()"
        [config]="tableConfig()"
        [loading]="store.listLoading()"
        [error]="store.listError()"
        (retry)="store.reloadCities()"
        (create)="goToCreate()"
        (rowClick)="goToDetail($event)"
        (actionClick)="handleAction($event)"
        (searchChange)="store.searchCities($event)"
        (filterChange)="handleFilterChange($event)"
        (pageChange)="handlePageChange($event)"
      />
    </app-entity-page-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CitiesListPage {
  readonly store = inject(CitiesStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly cardActions = computed<readonly EntityPageCardAction[]>(() => [
    {
      key: 'create',
      label: 'Nueva ciudad',
      icon: 'add_location_alt',
      placement: 'header',
      variant: 'filled',
      tone: 'primary',
    },
  ]);

  readonly tableConfig = computed(() =>
    buildCitiesTableConfig(
      this.store.query(),
      this.store.pagination(),
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

  goToDetail(city: City): void {
    this.router.navigate([city.id], {
      relativeTo: this.route,
    });
  }

  goToEdit(city: City): void {
    this.router.navigate([city.id, 'edit'], {
      relativeTo: this.route,
    });
  }

  handleAction(event: TableActionEvent<City>): void {
    if (event.actionKey === 'detail') {
      this.goToDetail(event.item);
      return;
    }

    if (event.actionKey === 'edit') {
      this.goToEdit(event.item);
    }
  }

  handleFilterChange(event: TableFilterChangeEvent): void {
    if (event.key === 'active') {
      this.store.setActiveFilter(event.value as boolean | null);
    }
  }

  handlePageChange(event: DataTablePageChangeEvent): void {
    this.store.setPage(event.pageIndex + 1, event.pageSize);
  }
}
