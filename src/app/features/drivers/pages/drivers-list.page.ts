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

import {
  BackgroundCheckStatus,
  DriverProfile,
  DriverStatus,
} from '../data-access/drivers.models';
import { DriversStore } from '../data-access/drivers.store';
import { buildDriversTableConfig } from '../config/drivers-table-config';

@Component({
  selector: 'app-drivers-list-page',
  standalone: true,
  imports: [
    EntityPageCard,
    DataTable,
  ],
  template: `
    <app-entity-page-card
      title="Conductores"
      subtitle="Gestión administrativa de perfiles de conductores."
      icon="badge"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      @if (store.deleteError(); as deleteError) {
        <div class="drivers-list-page__error" role="alert">
          {{ deleteError }}
        </div>
      }

      <app-data-table
        [items]="store.items()"
        [config]="tableConfig()"
        [loading]="store.loading()"
        [error]="store.error()"
        (retry)="store.reloadDrivers()"
        (create)="goToCreate()"
        (rowClick)="goToDetail($event)"
        (actionClick)="handleAction($event)"
        (searchChange)="store.searchDrivers($event)"
        (filterChange)="handleFilterChange($event)"
        (pageChange)="handlePageChange($event)"
      />
    </app-entity-page-card>
  `,
  styles: `
    .drivers-list-page__error {
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

    html[data-theme='dark'] .drivers-list-page__error {
      color: #fca5a5;
      background: rgb(220 38 38 / 12%);
      border-color: rgb(248 113 113 / 28%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DriversListPage {
  readonly store = inject(DriversStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly cardActions = computed<readonly EntityPageCardAction[]>(() => [
    {
      key: 'create',
      label: 'Nuevo conductor',
      icon: 'person_add',
      placement: 'header',
      variant: 'filled',
      tone: 'primary',
    },
  ]);

  readonly tableConfig = computed(() =>
    buildDriversTableConfig(
      this.store.query(),
      this.store.pagination(),
      this.store.deletingDriverId(),
    ),
  );

  private readonly enterPageEffect = effect(() => {
    this.store.enterDriversList();
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

  goToDetail(driver: DriverProfile): void {
    this.router.navigate([driver.id], {
      relativeTo: this.route,
    });
  }

  goToEdit(driver: DriverProfile): void {
    this.router.navigate([driver.id, 'edit'], {
      relativeTo: this.route,
    });
  }

  handleAction(event: TableActionEvent<DriverProfile>): void {
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
      this.store.deleteDriver(item.id);
    }
  }

  handleFilterChange(event: TableFilterChangeEvent): void {
    if (event.key === 'backgroundCheckStatus') {
      this.store.setBackgroundCheckStatusFilter(
        event.value as BackgroundCheckStatus | null,
      );

      return;
    }

    if (event.key === 'driverStatus') {
      this.store.setDriverStatusFilter(
        event.value as DriverStatus | null,
      );

      return;
    }

    if (event.key === 'isApproved') {
      this.store.setApprovedFilter(event.value as boolean | null);
    }
  }

  handlePageChange(event: DataTablePageChangeEvent): void {
    this.store.setPage(
      event.pageIndex + 1,
      event.pageSize,
    );
  }
}
