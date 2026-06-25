import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { EntityPageCard } from '../../../shared/components/entity-page-card/entity-page-card';
import { EntityPageCardAction } from '../../../shared/components/entity-page-card/entity-page-card.types';
import { PageLoader } from '../../../shared/feedback/page-loader/page-loader';
import { DataTable } from '../../../shared/table/data-table/data-table';
import {
  DataTablePageChangeEvent,
  TableFilterChangeEvent,
} from '../../../shared/table/table.types';

import { CashCollectionPointsStore } from '../data-access/cash-collection-points.store';
import { CashCollectionRecordStatus } from '../data-access/cash-collection-points.models';
import { buildCashCollectionPointRecordsTableConfig } from '../config/cash-collection-points-records-table.config';

@Component({
  selector: 'app-cash-collection-point-detail-page',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    EntityPageCard,
    PageLoader,
    DataTable,
  ],
  template: `
    <app-entity-page-card
      title="Detalle de punto de recaudo"
      subtitle="Información del punto y auditoría de recargas asociadas."
      icon="storefront"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      @if (store.detailLoading()) {
        <app-page-loader
          title="Cargando punto..."
          description="Estamos consultando la información del punto de recaudo."
        />
      } @else if (store.detailError(); as detailError) {
        <div class="cash-collection-point-detail-page__error" role="alert">
          {{ detailError }}
        </div>
      } @else if (store.selectedPoint(); as point) {
        <section class="cash-collection-point-detail-page">
          <header class="cash-collection-point-detail-page__summary">
            <article>
              <span>Nombre</span>
              <strong>{{ point.name }}</strong>
            </article>

            <article>
              <span>Estado</span>
              <strong
                class="cash-collection-point-detail-page__status"
                [class.cash-collection-point-detail-page__status--active]="point.isActive"
                [class.cash-collection-point-detail-page__status--inactive]="!point.isActive"
              >
                {{ point.isActive ? 'Activo' : 'Inactivo' }}
              </strong>
            </article>

            <article>
              <span>Teléfono</span>
              <strong>{{ point.contactPhone || '—' }}</strong>
            </article>

          </header>

          <section class="cash-collection-point-detail-page__section">
            <h3>Dirección</h3>
            <p>{{ point.address || 'Sin dirección registrada.' }}</p>
          </section>

          <section class="cash-collection-point-detail-page__records">
            <h3>Records de recaudo</h3>

            <app-data-table
              [items]="store.records()"
              [config]="recordsTableConfig()"
              [loading]="store.recordsLoading()"
              [error]="store.recordsError()"
              (retry)="reloadRecords()"
              (searchChange)="store.searchRecords($event)"
              (filterChange)="handleRecordsFilterChange($event)"
              (pageChange)="handleRecordsPageChange($event)"
            />
          </section>
        </section>
      }
    </app-entity-page-card>
  `,
  styles: `
    .cash-collection-point-detail-page {
      display: grid;
      gap: 1.5rem;
    }

    .cash-collection-point-detail-page__summary {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1rem;
    }

    .cash-collection-point-detail-page__summary article,
    .cash-collection-point-detail-page__section {
      display: grid;
      gap: 0.5rem;
      padding: 1rem;
      border: 1px solid var(--app-border);
      border-radius: var(--radius-lg);
      background: var(--app-surface);
    }

    .cash-collection-point-detail-page__summary span {
      color: var(--app-text-muted);
      font-size: 0.8rem;
      font-weight: 750;
    }

    .cash-collection-point-detail-page__summary strong {
      color: var(--app-text);
      font-size: 1rem;
      font-weight: 850;
    }

    .cash-collection-point-detail-page__status {
      width: fit-content;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      font-size: 0.85rem !important;
    }

    .cash-collection-point-detail-page__status--active {
      color: #166534 !important;
      background: #dcfce7;
    }

    .cash-collection-point-detail-page__status--inactive {
      color: #92400e !important;
      background: #fef3c7;
    }

    .cash-collection-point-detail-page__section h3,
    .cash-collection-point-detail-page__records h3 {
      margin: 0;
      color: var(--app-text);
      font-size: 1rem;
      font-weight: 850;
    }

    .cash-collection-point-detail-page__section p {
      margin: 0;
      color: var(--app-text-muted);
      font-weight: 650;
      line-height: 1.5;
    }

    .cash-collection-point-detail-page__section pre {
      margin: 0;
      padding: 1rem;
      overflow: auto;
      color: var(--app-text);
      background: var(--app-surface-2);
      border-radius: var(--radius-lg);
      font-size: 0.85rem;
      line-height: 1.5;
    }

    .cash-collection-point-detail-page__records {
      display: grid;
      gap: 1rem;
    }

    .cash-collection-point-detail-page__error {
      padding: 1rem;
      color: var(--app-danger);
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-lg);
      font-weight: 750;
      line-height: 1.5;
    }

    @media (max-width: 1100px) {
      .cash-collection-point-detail-page__summary {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 700px) {
      .cash-collection-point-detail-page__summary {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashCollectionPointDetailPage {
  readonly store = inject(CashCollectionPointsStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly pointId = computed(() => this.paramMap().get('id'));

  readonly recordsTableConfig = computed(() =>
    buildCashCollectionPointRecordsTableConfig(
      this.store.recordsQuery(),
      this.store.recordsPagination(),
    ),
  );

  readonly cardActions = computed<readonly EntityPageCardAction[]>(() => [
    {
      key: 'back',
      label: 'Volver',
      icon: 'arrow_back',
      placement: 'header',
      variant: 'text',
      tone: 'neutral',
    },
    {
      key: 'edit',
      label: 'Editar',
      icon: 'edit',
      placement: 'header',
      variant: 'filled',
      tone: 'primary',
    },
  ]);

  private readonly loadPointEffect = effect(() => {
    const id = this.pointId();

    if (!id) {
      return;
    }

    this.store.enterPointDetail(id);
  });

  onCardAction(actionKey: string): void {
    if (actionKey === 'back') {
      this.goBack();
      return;
    }

    if (actionKey === 'edit') {
      this.goToEdit();
    }
  }

  reloadRecords(): void {
    const id = this.pointId();

    if (!id) {
      return;
    }

    this.store.loadRecords(id);
  }

  handleRecordsFilterChange(event: TableFilterChangeEvent): void {
    if (event.key === 'status') {
      this.store.setRecordsStatusFilter(
        event.value as CashCollectionRecordStatus | null,
      );
    }
  }

  handleRecordsPageChange(event: DataTablePageChangeEvent): void {
    this.store.setRecordsPage(
      event.pageIndex + 1,
      event.pageSize,
    );
  }

  goToEdit(): void {
    this.router.navigate(['edit'], {
      relativeTo: this.route,
    });
  }

  goBack(): void {
    this.router.navigate(['..'], {
      relativeTo: this.route,
    });
  }

  stringify(value: Record<string, unknown>): string {
    return JSON.stringify(value, null, 2);
  }
}
