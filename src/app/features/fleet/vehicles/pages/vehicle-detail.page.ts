import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';

import { EntityPageCard } from '../../../../shared/components/entity-page-card/entity-page-card';
import { EntityPageCardAction } from '../../../../shared/components/entity-page-card/entity-page-card.types';
import { PageLoader } from '../../../../shared/feedback/page-loader/page-loader';

import { VehiclesStore } from '../data-access/vehicles.store';
import { VehicleStatus } from '../data-access/vehicles.models';

function getStatusLabel(status: VehicleStatus): string {
  const labels: Record<VehicleStatus, string> = {
    pending_review: 'Pendiente de revisión',
    approved: 'Aprobado',
    in_service: 'En servicio',
    rejected: 'Rechazado',
    maintenance: 'Mantenimiento',
    unavailable: 'No disponible',
  };

  return labels[status] ?? status;
}

@Component({
  selector: 'app-vehicle-detail-page',
  standalone: true,
  imports: [DatePipe, MatIconModule, EntityPageCard, PageLoader],
  template: `
    <app-entity-page-card
      title="Detalle de vehículo"
      subtitle="Información administrativa y operativa del vehículo."
      icon="directions_car"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      @if (store.detailLoading()) {
        <app-page-loader
          title="Cargando vehículo..."
          description="Estamos preparando la información del detalle."
        />
      } @else if (store.detailError(); as detailError) {
        <div class="vehicle-detail-page__error" role="alert">
          {{ detailError }}
        </div>
      } @else if (vehicle(); as item) {
        <section class="vehicle-detail-page">
          <header class="vehicle-detail-page__hero">
            <div class="vehicle-detail-page__avatar">
              <mat-icon>directions_car</mat-icon>
            </div>

            <div class="vehicle-detail-page__hero-content">
              <h2>{{ item.make }} {{ item.model }}</h2>

              <div class="vehicle-detail-page__meta">
                <span>{{ item.plateNumber }}</span>
                <span>{{ item.year }}</span>

                <span
                  class="vehicle-detail-page__badge"
                  [class.vehicle-detail-page__badge--active]="item.isActive"
                  [class.vehicle-detail-page__badge--inactive]="!item.isActive"
                >
                  {{ item.isActive ? 'Activo' : 'Inactivo' }}
                </span>

                <span class="vehicle-detail-page__badge vehicle-detail-page__badge--neutral">
                  {{ statusLabel(item.status) }}
                </span>
              </div>
            </div>
          </header>

          <div class="vehicle-detail-page__grid">
            <article class="vehicle-detail-page__card">
              <span>Conductor</span>
              <strong>{{ item.driverName || item.driver?.name || '—' }}</strong>
            </article>

            <article class="vehicle-detail-page__card">
              <span>Tipo de vehículo</span>
              <strong>{{ item.vehicleTypeName || item.vehicleType?.name || '—' }}</strong>
            </article>

            <article class="vehicle-detail-page__card">
              <span>Categoría</span>
              <strong>
                {{ item.categoryName || item.vehicleType?.category?.name || '—' }}
              </strong>
            </article>

            <article class="vehicle-detail-page__card vehicle-detail-page__card--wide">
              <span>Clases de servicio</span>

              @if ((item.serviceClassNames?.length ?? 0) > 0) {
                <div class="vehicle-detail-page__chips">
                  @for (serviceClassName of item.serviceClassNames; track serviceClassName) {
                    <strong class="vehicle-detail-page__chip">
                      {{ serviceClassName }}
                    </strong>
                  }
                </div>
              } @else if ((item.vehicleType?.serviceClasses?.length ?? 0) > 0) {
                <div class="vehicle-detail-page__chips">
                  @for (
                    serviceClass of item.vehicleType?.serviceClasses ?? [];
                    track serviceClass.id
                  ) {
                    <strong class="vehicle-detail-page__chip">
                      {{ serviceClass.name }}
                    </strong>
                  }
                </div>
              } @else {
                <strong>—</strong>
              }
            </article>

            <article class="vehicle-detail-page__card">
              <span>Marca</span>
              <strong>{{ item.make }}</strong>
            </article>

            <article class="vehicle-detail-page__card">
              <span>Modelo</span>
              <strong>{{ item.model }}</strong>
            </article>

            <article class="vehicle-detail-page__card">
              <span>Año</span>
              <strong>{{ item.year }}</strong>
            </article>

            <article class="vehicle-detail-page__card">
              <span>Placa</span>
              <strong>{{ item.plateNumber }}</strong>
            </article>

            <article class="vehicle-detail-page__card">
              <span>Color</span>
              <strong>{{ item.color || '—' }}</strong>
            </article>

            <article class="vehicle-detail-page__card">
              <span>Capacidad</span>
              <strong>{{ item.capacity }}</strong>
            </article>

            <article class="vehicle-detail-page__card">
              <span>Kilometraje</span>
              <strong>{{ item.mileage ?? '—' }}</strong>
            </article>

            <article class="vehicle-detail-page__card">
              <span>Fecha de inspección</span>
              <strong>
                {{ item.inspectionDate ? (item.inspectionDate | date: 'dd/MM/yyyy') : '—' }}
              </strong>
            </article>

            <article class="vehicle-detail-page__card">
              <span>Último mantenimiento</span>
              <strong>
                {{
                  item.lastMaintenanceDate ? (item.lastMaintenanceDate | date: 'dd/MM/yyyy') : '—'
                }}
              </strong>
            </article>

            <article class="vehicle-detail-page__card">
              <span>Fecha de creación</span>
              <strong>
                {{ item.createdAt ? (item.createdAt | date: 'dd/MM/yyyy, HH:mm') : '—' }}
              </strong>
            </article>

            <article class="vehicle-detail-page__card">
              <span>Última actualización</span>
              <strong>
                {{ item.updatedAt ? (item.updatedAt | date: 'dd/MM/yyyy, HH:mm') : '—' }}
              </strong>
            </article>
          </div>
        </section>
      }
    </app-entity-page-card>
  `,
  styles: `
    .vehicle-detail-page {
      display: grid;
      gap: 1.5rem;
    }

    .vehicle-detail-page__hero {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      border: 1px solid var(--app-border);
      border-radius: var(--radius-xl);
      background: color-mix(in srgb, var(--app-surface-2) 72%, var(--app-surface));
    }

    .vehicle-detail-page__avatar {
      width: 4.25rem;
      height: 4.25rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 1.25rem;
      background: color-mix(in srgb, var(--app-primary) 18%, transparent);
      color: var(--app-primary);
    }

    .vehicle-detail-page__avatar mat-icon {
      width: 2rem;
      height: 2rem;
      font-size: 2rem;
    }

    .vehicle-detail-page__hero-content {
      display: grid;
      gap: 0.5rem;
    }

    .vehicle-detail-page__hero h2 {
      margin: 0;
      color: var(--app-text);
      font-size: 1.4rem;
      font-weight: 850;
    }

    .vehicle-detail-page__meta {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
      color: var(--app-text-muted);
      font-weight: 750;
    }

    .vehicle-detail-page__badge {
      display: inline-flex;
      width: fit-content;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 800;
    }

    .vehicle-detail-page__badge--active {
      color: #166534;
      background: #dcfce7;
    }

    .vehicle-detail-page__badge--inactive {
      color: #92400e;
      background: #fef3c7;
    }

    .vehicle-detail-page__badge--neutral {
      color: var(--app-text-muted);
      background: color-mix(in srgb, var(--app-surface-2) 85%, var(--app-border));
    }

    html[data-theme='dark'] .vehicle-detail-page__badge--active {
      color: #86efac;
      background: rgb(34 197 94 / 14%);
    }

    html[data-theme='dark'] .vehicle-detail-page__badge--inactive {
      color: #fcd34d;
      background: rgb(245 158 11 / 14%);
    }

    .vehicle-detail-page__grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
    }

    .vehicle-detail-page__card {
      display: grid;
      gap: 0.5rem;
      padding: 1rem;
      border: 1px solid var(--app-border);
      border-radius: var(--radius-lg);
      background: var(--app-surface);
    }

    .vehicle-detail-page__card--wide {
      grid-column: 1 / -1;
    }

    .vehicle-detail-page__card span {
      color: var(--app-text-muted);
      font-size: 0.8rem;
      font-weight: 750;
    }

    .vehicle-detail-page__card strong {
      color: var(--app-text);
      font-size: 0.95rem;
      font-weight: 800;
      line-height: 1.5;
    }

    .vehicle-detail-page__chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
    }

    .vehicle-detail-page__chip {
      display: inline-flex;
      width: fit-content;
      padding: 0.45rem 0.75rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--app-primary) 14%, transparent);
      color: var(--app-primary);
      font-size: 0.82rem;
    }

    .vehicle-detail-page__error {
      padding: 1rem;
      color: var(--app-danger);
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-lg);
      font-weight: 750;
      line-height: 1.5;
    }

    html[data-theme='dark'] .vehicle-detail-page__error {
      color: #fca5a5;
      background: rgb(220 38 38 / 12%);
      border-color: rgb(248 113 113 / 28%);
    }

    @media (max-width: 900px) {
      .vehicle-detail-page__grid {
        grid-template-columns: 1fr;
      }

      .vehicle-detail-page__hero {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleDetailPage {
  readonly store = inject(VehiclesStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly vehicleId = computed(() => this.paramMap().get('id'));
  readonly vehicle = computed(() => this.store.selectedVehicle());

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

  private readonly loadDetailEffect = effect(() => {
    const id = this.vehicleId();

    if (!id) {
      return;
    }

    this.store.loadVehicleDetail(id);
  });

  statusLabel(status: VehicleStatus): string {
    return getStatusLabel(status);
  }

  onCardAction(actionKey: string): void {
    if (actionKey === 'back') {
      this.goBack();
      return;
    }

    if (actionKey === 'edit') {
      this.goToEdit();
    }
  }

  goBack(): void {
    this.router.navigate(['..'], {
      relativeTo: this.route,
    });
  }

  goToEdit(): void {
    this.router.navigate(['edit'], {
      relativeTo: this.route,
    });
  }
}
