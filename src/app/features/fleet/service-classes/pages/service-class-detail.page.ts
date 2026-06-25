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

import { VehicleServiceClassesStore } from '../data-access/vehicle-service-classes.store';

function formatMultiplier(value: number): string {
  return `x${Number(value ?? 0).toFixed(2)}`;
}

@Component({
  selector: 'app-vehicle-service-class-detail-page',
  standalone: true,
  imports: [
    DatePipe,
    MatIconModule,
    EntityPageCard,
    PageLoader,
  ],
  template: `
    <app-entity-page-card
      title="Detalle de clase"
      subtitle="Información comercial y operativa de la clase de servicio."
      icon="workspace_premium"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      @if (store.detailLoading()) {
        <app-page-loader
          title="Cargando clase..."
          description="Estamos preparando la información del detalle."
        />
      } @else if (store.detailError(); as detailError) {
        <div class="vehicle-service-class-detail-page__error" role="alert">
          {{ detailError }}
        </div>
      } @else if (serviceClass(); as item) {
        <section class="vehicle-service-class-detail-page">
          <header class="vehicle-service-class-detail-page__hero">
            <div class="vehicle-service-class-detail-page__avatar">
              @if (item.iconUrl) {
                <img [src]="item.iconUrl" [alt]="item.name" />
              } @else {
                <mat-icon>workspace_premium</mat-icon>
              }
            </div>

            <div class="vehicle-service-class-detail-page__hero-content">
              <h2>{{ item.name }}</h2>

              <span
                class="vehicle-service-class-detail-page__badge"
                [class.vehicle-service-class-detail-page__badge--active]="item.isActive"
                [class.vehicle-service-class-detail-page__badge--inactive]="!item.isActive"
              >
                {{ item.isActive ? 'Activa' : 'Inactiva' }}
              </span>
            </div>
          </header>

          <div class="vehicle-service-class-detail-page__grid">
            <article class="vehicle-service-class-detail-page__card vehicle-service-class-detail-page__card--wide">
              <span>Descripción</span>
              <strong>{{ item.description || 'Sin descripción' }}</strong>
            </article>

            <article class="vehicle-service-class-detail-page__card">
              <span>Tarifa base</span>
              <strong>{{ multiplier(item.baseFareMultiplier) }}</strong>
            </article>

            <article class="vehicle-service-class-detail-page__card">
              <span>Costo por km</span>
              <strong>{{ multiplier(item.costPerKmMultiplier) }}</strong>
            </article>

            <article class="vehicle-service-class-detail-page__card">
              <span>Costo por minuto</span>
              <strong>{{ multiplier(item.costPerMinuteMultiplier) }}</strong>
            </article>

            <article class="vehicle-service-class-detail-page__card">
              <span>Tarifa mínima</span>
              <strong>{{ multiplier(item.minFareMultiplier) }}</strong>
            </article>

            <article class="vehicle-service-class-detail-page__card">
              <span>Capacidad mínima</span>
              <strong>{{ item.minCapacity }}</strong>
            </article>

            <article class="vehicle-service-class-detail-page__card">
              <span>Capacidad máxima</span>
              <strong>{{ item.maxCapacity }}</strong>
            </article>

            <article class="vehicle-service-class-detail-page__card">
              <span>Orden de visualización</span>
              <strong>{{ item.displayOrder ?? '—' }}</strong>
            </article>

            <article class="vehicle-service-class-detail-page__card">
              <span>Fecha de creación</span>
              <strong>
                {{ item.createdAt ? (item.createdAt | date: 'dd/MM/yyyy, HH:mm') : '—' }}
              </strong>
            </article>

            <article class="vehicle-service-class-detail-page__card">
              <span>Última actualización</span>
              <strong>
                {{ item.updatedAt ? (item.updatedAt | date: 'dd/MM/yyyy, HH:mm') : '—' }}
              </strong>
            </article>

            <article class="vehicle-service-class-detail-page__card vehicle-service-class-detail-page__card--wide">
              <span>Tipos de vehículos asociados</span>

              @if ((item.vehicleTypeNames?.length ?? 0) > 0) {
                <div class="vehicle-service-class-detail-page__chips">
                  @for (vehicleTypeName of item.vehicleTypeNames; track vehicleTypeName) {
                    <strong class="vehicle-service-class-detail-page__chip">
                      {{ vehicleTypeName }}
                    </strong>
                  }
                </div>
              } @else {
                <strong>No tiene tipos de vehículos asociados.</strong>
              }
            </article>
          </div>
        </section>
      }
    </app-entity-page-card>
  `,
  styles: `
    .vehicle-service-class-detail-page {
      display: grid;
      gap: 1.5rem;
    }

    .vehicle-service-class-detail-page__hero {
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

    .vehicle-service-class-detail-page__avatar {
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

    .vehicle-service-class-detail-page__avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .vehicle-service-class-detail-page__avatar mat-icon {
      width: 2rem;
      height: 2rem;
      font-size: 2rem;
    }

    .vehicle-service-class-detail-page__hero-content {
      display: grid;
      gap: 0.5rem;
    }

    .vehicle-service-class-detail-page__hero h2 {
      margin: 0;
      color: var(--app-text);
      font-size: 1.4rem;
      font-weight: 850;
    }

    .vehicle-service-class-detail-page__badge {
      display: inline-flex;
      width: fit-content;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 800;
    }

    .vehicle-service-class-detail-page__badge--active {
      color: #166534;
      background: #dcfce7;
    }

    .vehicle-service-class-detail-page__badge--inactive {
      color: #92400e;
      background: #fef3c7;
    }

    html[data-theme='dark'] .vehicle-service-class-detail-page__badge--active {
      color: #86efac;
      background: rgb(34 197 94 / 14%);
    }

    html[data-theme='dark'] .vehicle-service-class-detail-page__badge--inactive {
      color: #fcd34d;
      background: rgb(245 158 11 / 14%);
    }

    .vehicle-service-class-detail-page__grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
    }

    .vehicle-service-class-detail-page__card {
      display: grid;
      gap: 0.5rem;
      padding: 1rem;
      border: 1px solid var(--app-border);
      border-radius: var(--radius-lg);
      background: var(--app-surface);
    }

    .vehicle-service-class-detail-page__card--wide {
      grid-column: 1 / -1;
    }

    .vehicle-service-class-detail-page__card span {
      color: var(--app-text-muted);
      font-size: 0.8rem;
      font-weight: 750;
    }

    .vehicle-service-class-detail-page__card strong {
      color: var(--app-text);
      font-size: 0.95rem;
      font-weight: 800;
      line-height: 1.5;
    }

    .vehicle-service-class-detail-page__chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
    }

    .vehicle-service-class-detail-page__chip {
      display: inline-flex;
      width: fit-content;
      padding: 0.45rem 0.75rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--app-primary) 14%, transparent);
      color: var(--app-primary);
      font-size: 0.82rem;
    }

    .vehicle-service-class-detail-page__error {
      padding: 1rem;
      color: var(--app-danger);
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-lg);
      font-weight: 750;
      line-height: 1.5;
    }

    html[data-theme='dark'] .vehicle-service-class-detail-page__error {
      color: #fca5a5;
      background: rgb(220 38 38 / 12%);
      border-color: rgb(248 113 113 / 28%);
    }

    @media (max-width: 900px) {
      .vehicle-service-class-detail-page__grid {
        grid-template-columns: 1fr;
      }

      .vehicle-service-class-detail-page__hero {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleServiceClassDetailPage {
  readonly store = inject(VehicleServiceClassesStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly serviceClassId = computed(() => this.paramMap().get('id'));
  readonly serviceClass = computed(() => this.store.selectedServiceClass());

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
    const id = this.serviceClassId();

    if (!id) {
      return;
    }

    this.store.loadServiceClassDetail(id);
  });

  multiplier(value: number): string {
    return formatMultiplier(value);
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
