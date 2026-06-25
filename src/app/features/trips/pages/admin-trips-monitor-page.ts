import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AdminTripsStore } from '../data-access/admin-trips.store';
import { AdminTrip, AdminTripStatus } from '../data-access/admin-trips.models';
import { buildAdminTripsTableConfig } from '../config/admin-trips-table.config';

import { EntityPageCard } from '../../../shared/components/entity-page-card/entity-page-card';
import { DataTable } from '../../../shared/table/data-table/data-table';
import { EntityPageCardAction } from '../../../shared/components/entity-page-card/entity-page-card.types';
import {
  DataTablePageChangeEvent,
  TableActionEvent,
  TableFilterChangeEvent,
} from '../../../shared/table/table.types';

@Component({
  selector: 'app-admin-trips-monitor-page',
  standalone: true,
  imports: [EntityPageCard, DataTable],
  template: `
    <app-entity-page-card
      title="Monitor de viajes"
      subtitle="Supervisa viajes en tiempo real e interviene cuando sea necesario."
      icon="route"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      <section class="admin-trips-monitor__summary">
        <article>
          <span>Activos</span>
          <strong>{{ store.activeTripsCount() }}</strong>
        </article>

        <article>
          <span>Advertencias</span>
          <strong>{{ store.warningTripsCount() }}</strong>
        </article>

        <article>
          <span>Realtime</span>
          <strong [class.is-online]="store.realtimeStatus() === 'connected'">
            {{ realtimeLabel() }}
          </strong>
        </article>

        @if (store.realtimeLastEvent(); as eventName) {
          <article>
            <span>Último evento</span>
            <strong>{{ eventName }}</strong>
          </article>
        }
      </section>

      @if (store.realtimeError(); as realtimeError) {
        <div class="admin-trips-monitor__warning" role="alert">
          {{ realtimeError }}
        </div>
      }

      <app-data-table
        [items]="store.trips()"
        [config]="tableConfig()"
        [loading]="store.listLoading()"
        [error]="store.listError()"
        (retry)="store.reloadTrips()"
        (rowClick)="goToDetail($event)"
        (actionClick)="handleAction($event)"
        (searchChange)="store.setSearch($event)"
        (filterChange)="handleFilterChange($event)"
        (pageChange)="handlePageChange($event)"
      />
    </app-entity-page-card>
  `,
  styles: `
    .admin-trips-monitor__summary {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.85rem;
      margin-bottom: 1.25rem;
    }

    .admin-trips-monitor__summary article {
      padding: 1rem;
      border: 1px solid var(--app-border);
      border-radius: var(--radius-lg);
      background: var(--app-surface);
    }

    .admin-trips-monitor__summary span {
      display: block;
      color: var(--app-muted);
      font-size: 0.78rem;
      font-weight: 750;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .admin-trips-monitor__summary strong {
      display: block;
      margin-top: 0.35rem;
      font-size: 1.05rem;
      font-weight: 900;
    }

    .admin-trips-monitor__summary strong.is-online {
      color: #16a34a;
    }

    .admin-trips-monitor__warning {
      margin-bottom: 1rem;
      padding: 0.85rem 1rem;
      border-radius: var(--radius-md);
      color: #92400e;
      background: #fffbeb;
      border: 1px solid #fde68a;
      font-size: 0.9rem;
      font-weight: 750;
    }

    @media (max-width: 900px) {
      .admin-trips-monitor__summary {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 560px) {
      .admin-trips-monitor__summary {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminTripsMonitorPage {
  readonly store = inject(AdminTripsStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly tableConfig = computed(() =>
    buildAdminTripsTableConfig(
      this.store.query(),
      this.store.pagination(),
      this.store.processingTripId(),
    ),
  );

  readonly cardActions = computed<readonly EntityPageCardAction[]>(() => [
    {
      key: 'refresh',
      label: 'Actualizar',
      icon: 'refresh',
      placement: 'header',
      variant: 'text',
      tone: 'neutral',
    },
  ]);

  readonly realtimeLabel = computed(() => {
    const status = this.store.realtimeStatus();

    const labels: Record<typeof status, string> = {
      idle: 'Inactivo',
      connecting: 'Conectando',
      connected: 'Conectado',
      disconnected: 'Desconectado',
      error: 'Error',
    };

    return labels[status];
  });

  private readonly enterPageEffect = effect(() => {
    this.store.enterMonitor();
  });

  onCardAction(actionKey: string): void {
    if (actionKey === 'refresh') {
      this.store.reloadTrips();
    }
  }

  goToDetail(trip: AdminTrip): void {
    this.router.navigate([trip.id], {
      relativeTo: this.route,
    });
  }

  handleAction(event: TableActionEvent<AdminTrip>): void {
    const { actionKey, item } = event;

    if (actionKey === 'detail') {
      this.goToDetail(item);
      return;
    }

    if (actionKey === 'retry_matching') {
      this.store.retryMatching(item.id, {
        reason: 'Reintento manual desde monitor administrativo.',
        searchRadiusMeters: 5000,
        maxCandidates: 10,
        offerTtlSeconds: 20,
      });

      return;
    }

    if (actionKey === 'cancel') {
      this.goToDetail(item);
    }
  }

  handleFilterChange(event: TableFilterChangeEvent): void {
    if (event.key === 'status') {
      this.store.setStatusFilter(event.value as AdminTripStatus | null);
    }
  }

  handlePageChange(event: DataTablePageChangeEvent): void {
    this.store.setPage(event.pageIndex + 1, event.pageSize);
  }
}
