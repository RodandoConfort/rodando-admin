import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';

import { EntityPageCard } from '../../../../shared/components/entity-page-card/entity-page-card';
import { EntityPageCardAction } from '../../../../shared/components/entity-page-card/entity-page-card.types';
import { PageLoader } from '../../../../shared/feedback/page-loader/page-loader';

import { VehicleTypesStore } from '../data-access/vehicle-types.store';

function formatMoney(value: number): string {
  return `$${Number(value ?? 0).toFixed(2)}`;
}

function formatRate(value: number): string {
  return `$${Number(value ?? 0).toFixed(4)}`;
}

@Component({
  selector: 'app-vehicle-type-detail-page',
  standalone: true,
  imports: [
    DatePipe,
    MatIconModule,
    EntityPageCard,
    PageLoader,
  ],
  template: `
    <app-entity-page-card
      title="Detalle de tipo"
      subtitle="Información operativa, tarifaria y comercial del tipo de vehículo."
      icon="airport_shuttle"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      @if (store.detailLoading()) {
        <app-page-loader
          title="Cargando tipo..."
          description="Estamos preparando la información del detalle."
        />
      } @else if (store.detailError(); as detailError) {
        <div class="vehicle-type-detail-page__error" role="alert">
          {{ detailError }}
        </div>
      } @else if (vehicleType(); as item) {
        <section class="vehicle-type-detail-page">
          <header class="vehicle-type-detail-page__hero">
            <div class="vehicle-type-detail-page__avatar">
              @if (item.iconUrl) {
                <img [src]="item.iconUrl" [alt]="item.name" />
              } @else {
                <mat-icon>airport_shuttle</mat-icon>
              }
            </div>

            <div class="vehicle-type-detail-page__hero-content">
              <h2>{{ item.name }}</h2>

              <div class="vehicle-type-detail-page__meta">
                <span>{{ item.categoryName || 'Sin categoría' }}</span>

                <span
                  class="vehicle-type-detail-page__badge"
                  [class.vehicle-type-detail-page__badge--active]="item.isActive"
                  [class.vehicle-type-detail-page__badge--inactive]="!item.isActive"
                >
                  {{ item.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
            </div>
          </header>

          <div class="vehicle-type-detail-page__grid">
            <article class="vehicle-type-detail-page__card vehicle-type-detail-page__card--wide">
              <span>Descripción</span>
              <strong>{{ item.description || 'Sin descripción' }}</strong>
            </article>

            <article class="vehicle-type-detail-page__card">
              <span>Capacidad por defecto</span>
              <strong>{{ item.defaultCapacity }}</strong>
            </article>

            <article class="vehicle-type-detail-page__card">
              <span>Tarifa base</span>
              <strong>{{ money(item.baseFare) }}</strong>
            </article>

            <article class="vehicle-type-detail-page__card">
              <span>Costo por km</span>
              <strong>{{ rate(item.costPerKm) }}</strong>
            </article>

            <article class="vehicle-type-detail-page__card">
              <span>Costo por minuto</span>
              <strong>{{ rate(item.costPerMinute) }}</strong>
            </article>

            <article class="vehicle-type-detail-page__card">
              <span>Tarifa mínima</span>
              <strong>{{ money(item.minFare) }}</strong>
            </article>

            <article class="vehicle-type-detail-page__card">
              <span>Fecha de creación</span>
              <strong>
                {{ item.createdAt ? (item.createdAt | date: 'dd/MM/yyyy, HH:mm') : '—' }}
              </strong>
            </article>

            <article class="vehicle-type-detail-page__card">
              <span>Última actualización</span>
              <strong>
                {{ item.updatedAt ? (item.updatedAt | date: 'dd/MM/yyyy, HH:mm') : '—' }}
              </strong>
            </article>

            <article class="vehicle-type-detail-page__card vehicle-type-detail-page__card--wide">
              <span>Clases de servicio asociadas</span>

              @if ((item.serviceClassNames?.length ?? 0) > 0) {
                <div class="vehicle-type-detail-page__chips">
                  @for (serviceClassName of item.serviceClassNames; track serviceClassName) {
                    <strong class="vehicle-type-detail-page__chip">
                      {{ serviceClassName }}
                    </strong>
                  }
                </div>
              } @else {
                <strong>No tiene clases de servicio asociadas.</strong>
              }
            </article>
          </div>
        </section>
      }
    </app-entity-page-card>
  `,
  styles: `
    .vehicle-type-detail-page {
      display: grid;
      gap: 1.5rem;
    }

    .vehicle-type-detail-page__hero {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      border: 1px solid var(--app-border);
      border-radius: var(--radius-xl);
      background: color-mix(
        in srgb,
        var(--app-surface-2) 72%,
        var(--app-surface)
      );
    }

    .vehicle-type-detail-page__avatar {
      width: 4.25rem;
      height: 4.25rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-radius: 1.25rem;
      background: color-mix(in srgb, var(--app-primary) 18%, transparent);
      color: var(--app-primary);
    }

    .vehicle-type-detail-page__avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .vehicle-type-detail-page__avatar mat-icon {
      width: 2rem;
      height: 2rem;
      font-size: 2rem;
    }

    .vehicle-type-detail-page__hero-content {
      display: grid;
      gap: 0.5rem;
    }

    .vehicle-type-detail-page__hero h2 {
      margin: 0;
      color: var(--app-text);
      font-size: 1.4rem;
      font-weight: 850;
    }

    .vehicle-type-detail-page__meta {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
      color: var(--app-text-muted);
      font-weight: 750;
    }

    .vehicle-type-detail-page__badge {
      display: inline-flex;
      width: fit-content;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 800;
    }

    .vehicle-type-detail-page__badge--active {
      color: #166534;
      background: #dcfce7;
    }

    .vehicle-type-detail-page__badge--inactive {
      color: #92400e;
      background: #fef3c7;
    }

    html[data-theme='dark'] .vehicle-type-detail-page__badge--active {
      color: #86efac;
      background: rgb(34 197 94 / 14%);
    }

    html[data-theme='dark'] .vehicle-type-detail-page__badge--inactive {
      color: #fcd34d;
      background: rgb(245 158 11 / 14%);
    }

    .vehicle-type-detail-page__grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
    }

    .vehicle-type-detail-page__card {
      display: grid;
      gap: 0.5rem;
      padding: 1rem;
      border: 1px solid var(--app-border);
      border-radius: var(--radius-lg);
      background: var(--app-surface);
    }

    .vehicle-type-detail-page__card--wide {
      grid-column: 1 / -1;
    }

    .vehicle-type-detail-page__card span {
      color: var(--app-text-muted);
      font-size: 0.8rem;
      font-weight: 750;
    }

    .vehicle-type-detail-page__card strong {
      color: var(--app-text);
      font-size: 0.95rem;
      font-weight: 800;
      line-height: 1.5;
    }

    .vehicle-type-detail-page__chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
    }

    .vehicle-type-detail-page__chip {
      display: inline-flex;
      width: fit-content;
      padding: 0.45rem 0.75rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--app-primary) 14%, transparent);
      color: var(--app-primary);
      font-size: 0.82rem;
    }

    .vehicle-type-detail-page__error {
      padding: 1rem;
      color: var(--app-danger);
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-lg);
      font-weight: 750;
      line-height: 1.5;
    }

    html[data-theme='dark'] .vehicle-type-detail-page__error {
      color: #fca5a5;
      background: rgb(220 38 38 / 12%);
      border-color: rgb(248 113 113 / 28%);
    }

    @media (max-width: 900px) {
      .vehicle-type-detail-page__grid {
        grid-template-columns: 1fr;
      }

      .vehicle-type-detail-page__hero {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleTypeDetailPage {
  readonly store = inject(VehicleTypesStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly vehicleTypeId = computed(() => this.paramMap().get('id'));
  readonly vehicleType = computed(() => this.store.selectedType());

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
    const id = this.vehicleTypeId();

    if (!id) {
      return;
    }

    this.store.loadTypeDetail(id);
  });

  money(value: number): string {
    return formatMoney(value);
  }

  rate(value: number): string {
    return formatRate(value);
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
