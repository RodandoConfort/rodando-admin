import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { EntityPageCard } from '../../../../shared/components/entity-page-card/entity-page-card';
import { EntityPageCardAction } from '../../../../shared/components/entity-page-card/entity-page-card.types';

import { ZonesStore } from '../../data-access/zones.store';

@Component({
  selector: 'app-zone-detail-page',
  standalone: true,
  imports: [EntityPageCard],
  template: `
    <app-entity-page-card
      title="Detalle de zona"
      subtitle="Consulta ciudad, prioridad, estado y geometría asociada."
      icon="map"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      @if (store.detailLoading()) {
        <p>Cargando zona...</p>
      } @else if (store.detailError(); as error) {
        <p class="geography-detail__error">{{ error }}</p>
      } @else if (store.selected(); as zone) {
        <section class="geography-detail">
          <article>
            <span>Zona</span>
            <strong>{{ zone.name }}</strong>
          </article>

          <article>
            <span>Ciudad</span>
            <strong>{{ zone.city?.name ?? zone.cityName ?? '—' }}</strong>
          </article>

          <article>
            <span>Tipo</span>
            <strong>{{ zone.kind || '—' }}</strong>
          </article>

          <article>
            <span>Prioridad</span>
            <strong>{{ zone.priority }}</strong>
          </article>

          <article>
            <span>Estado</span>
            <strong>{{ zone.active ? 'Activa' : 'Inactiva' }}</strong>
          </article>

          <article>
            <span>Geometría</span>
            <strong>{{ zone.geom ? 'Configurada' : 'Sin configurar' }}</strong>
          </article>
        </section>
      }
    </app-entity-page-card>
  `,
  styles: `
    .geography-detail {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
    }

    .geography-detail article {
      display: grid;
      gap: 0.5rem;
      padding: 1rem;
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: var(--radius-lg);
    }

    .geography-detail span {
      color: var(--app-text-muted);
      font-size: 0.82rem;
      font-weight: 800;
    }

    .geography-detail strong {
      color: var(--app-text);
      font-size: 1rem;
      font-weight: 900;
    }

    .geography-detail__error {
      color: var(--app-danger);
      font-weight: 800;
    }

    @media (width <= 900px) {
      .geography-detail {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZoneDetailPage {
  readonly store = inject(ZonesStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly zoneId = computed(() => this.paramMap().get('id'));

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

  private readonly loadEffect = effect(() => {
    const id = this.zoneId();

    if (!id) {
      return;
    }

    this.store.loadZone(id);
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
}
