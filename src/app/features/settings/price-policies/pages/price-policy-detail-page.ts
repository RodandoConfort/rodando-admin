import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { EntityPageCard } from '../../../../shared/components/entity-page-card/entity-page-card';
import { EntityPageCardAction } from '../../../../shared/components/entity-page-card/entity-page-card.types';
import { PageLoader } from '../../../../shared/feedback/page-loader/page-loader';

import { PricePoliciesSegments } from '../components/price-policies-segments/price-policies-segments';
import { PricePoliciesStore } from '../data-access/price-policies.store';
import {
  formatPricePolicyPrice,
  formatPricePolicyScopeTarget,
  getPricePolicyScopeLabel,
  PricePolicy,
} from '../data-access/price-policies.models';

@Component({
  selector: 'app-price-policy-detail-page',
  standalone: true,
  imports: [
    EntityPageCard,
    PageLoader,
    PricePoliciesSegments,
  ],
  template: `
    <app-entity-page-card
      title="Detalle de política de precio"
      subtitle="Consulta el alcance, vigencia, condiciones y reglas aplicadas al cálculo."
      icon="payments"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      <app-price-policies-segments />

      @if (store.detailLoading()) {
        <app-page-loader
          title="Cargando política..."
          description="Estamos consultando la política de precio."
        />
      } @else if (store.detailError(); as detailError) {
        <div class="price-policy-detail-page__error" role="alert">
          {{ detailError }}
        </div>
      } @else if (store.selectedPolicy(); as policy) {
        <section class="price-policy-detail-page">
          <header class="price-policy-detail-page__summary">
            <article>
              <span>Nombre</span>
              <strong>{{ policy.name }}</strong>
            </article>

            <article>
              <span>Alcance</span>
              <strong>{{ scopeLabel(policy) }}</strong>
            </article>

            <article>
              <span>Destino</span>
              <strong>{{ targetLabel(policy) }}</strong>
            </article>

            <article>
              <span>Estado</span>
              <strong
                class="price-policy-detail-page__status"
                [class.price-policy-detail-page__status--active]="policy.active"
                [class.price-policy-detail-page__status--inactive]="!policy.active"
              >
                {{ policy.active ? 'Activa' : 'Inactiva' }}
              </strong>
            </article>
          </header>

          <section class="price-policy-detail-page__summary price-policy-detail-page__summary--secondary">
            <article>
              <span>Prioridad</span>
              <strong>{{ policy.priority }}</strong>
            </article>

            <article>
              <span>Zona horaria</span>
              <strong>{{ policy.timezone || 'UTC' }}</strong>
            </article>

            <article>
              <span>Vigente desde</span>
              <strong>{{ policy.effectiveFrom || '—' }}</strong>
            </article>

            <article>
              <span>Vigente hasta</span>
              <strong>{{ policy.effectiveTo || '—' }}</strong>
            </article>
          </section>

          <section class="price-policy-detail-page__section">
            <h3>Resumen de precio</h3>
            <p>{{ priceLabel(policy) }}</p>
          </section>

          <section class="price-policy-detail-page__section">
            <h3>Condiciones</h3>
            <pre>{{ stringify(policy.conditions || {}) }}</pre>
          </section>

          <section class="price-policy-detail-page__section">
            <h3>Reglas de precio</h3>
            <pre>{{ stringify(policy.price || {}) }}</pre>
          </section>
        </section>
      }
    </app-entity-page-card>
  `,
  styles: `
    .price-policy-detail-page {
      display: grid;
      gap: 1.5rem;
    }

    .price-policy-detail-page__summary {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1rem;
    }

    .price-policy-detail-page__summary--secondary {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .price-policy-detail-page__summary article,
    .price-policy-detail-page__section {
      display: grid;
      gap: 0.5rem;
      padding: 1rem;
      border: 1px solid var(--app-border);
      border-radius: var(--radius-lg);
      background: var(--app-surface);
    }

    .price-policy-detail-page__summary span {
      color: var(--app-text-muted);
      font-size: 0.8rem;
      font-weight: 750;
    }

    .price-policy-detail-page__summary strong {
      color: var(--app-text);
      font-size: 1rem;
      font-weight: 850;
      overflow-wrap: anywhere;
    }

    .price-policy-detail-page__status {
      width: fit-content;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      font-size: 0.85rem !important;
    }

    .price-policy-detail-page__status--active {
      color: #166534 !important;
      background: #dcfce7;
    }

    .price-policy-detail-page__status--inactive {
      color: #92400e !important;
      background: #fef3c7;
    }

    .price-policy-detail-page__section h3 {
      margin: 0;
      color: var(--app-text);
      font-size: 1rem;
      font-weight: 850;
    }

    .price-policy-detail-page__section p {
      margin: 0;
      color: var(--app-text-muted);
      font-weight: 650;
      line-height: 1.5;
    }

    .price-policy-detail-page__section pre {
      margin: 0;
      padding: 1rem;
      overflow: auto;
      color: var(--app-text);
      background: var(--app-surface-2);
      border-radius: var(--radius-lg);
      font-size: 0.85rem;
      line-height: 1.5;
    }

    .price-policy-detail-page__error {
      padding: 1rem;
      color: var(--app-danger);
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-lg);
      font-weight: 750;
      line-height: 1.5;
    }

    html[data-theme='dark'] .price-policy-detail-page__error {
      color: #fca5a5;
      background: rgb(220 38 38 / 12%);
      border-color: rgb(248 113 113 / 28%);
    }

    @media (max-width: 1100px) {
      .price-policy-detail-page__summary,
      .price-policy-detail-page__summary--secondary {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 700px) {
      .price-policy-detail-page__summary,
      .price-policy-detail-page__summary--secondary {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricePolicyDetailPage {
  readonly store = inject(PricePoliciesStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly policyId = computed(() => this.paramMap().get('id'));

  readonly cardActions = computed<readonly EntityPageCardAction[]>(() => {
    const policy = this.store.selectedPolicy();

    const actions: EntityPageCardAction[] = [
      {
        key: 'back',
        label: 'Volver',
        icon: 'arrow_back',
        placement: 'header',
        variant: 'text',
        tone: 'neutral',
      },
    ];

    if (policy) {
      actions.push(
        {
          key: 'toggle-active',
          label: policy.active ? 'Desactivar' : 'Activar',
          icon: policy.active ? 'toggle_off' : 'toggle_on',
          placement: 'header',
          variant: 'outlined',
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
      );
    }

    return actions;
  });

  private readonly loadPolicyEffect = effect(() => {
    const id = this.policyId();

    if (!id) {
      return;
    }

    this.store.loadPolicyDetail(id);
  });

  onCardAction(actionKey: string): void {
    if (actionKey === 'back') {
      this.goBack();
      return;
    }

    if (actionKey === 'edit') {
      this.goToEdit();
      return;
    }

    if (actionKey === 'toggle-active') {
      const policy = this.store.selectedPolicy();

      if (!policy) {
        return;
      }

      this.store.setPolicyActive({
        id: policy.id,
        active: !policy.active,
      });
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

  scopeLabel(policy: PricePolicy): string {
    return getPricePolicyScopeLabel(policy.scopeType);
  }

  targetLabel(policy: PricePolicy): string {
    return formatPricePolicyScopeTarget(policy);
  }

  priceLabel(policy: PricePolicy): string {
    return formatPricePolicyPrice(policy);
  }

  stringify(value: Record<string, unknown>): string {
    return JSON.stringify(value, null, 2);
  }
}
