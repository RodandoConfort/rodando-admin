import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';

import { EntityPageCard } from '../../../../shared/components/entity-page-card/entity-page-card';
import { DynamicForm } from '../../../../shared/form/dynamic-form/dynamic-form';
import { DynamicFormValue } from '../../../../shared/form/dynamic-form-builder';

import { PricePoliciesSegments } from '../components/price-policies-segments/price-policies-segments';
import { buildPricePolicySimulatorFormConfig } from '../config/price-policy-simulator-form.config';
import {
  mapPricePolicySimulatorFormToInput,
  readSimulatorPolicyId,
} from '../config/price-policy-simulator.mapper';
import { PricePoliciesStore } from '../data-access/price-policies.store';
import { PricePolicy } from '../data-access/price-policies.models';
import {
  PricePolicySimulatorResult,
  simulatePricePolicyQuote,
} from '../simulator/price-policy-simulator.util';

@Component({
  selector: 'app-price-policy-simulator-page',
  standalone: true,
  imports: [
    EntityPageCard,
    DynamicForm,
    PricePoliciesSegments,
  ],
  template: `
    <app-entity-page-card
      title="Simulador de precios"
      subtitle="Selecciona una política, introduce los datos del viaje y simula el precio final antes de ajustar la configuración."
      icon="calculate"
    >
      <app-price-policies-segments />

      @if (store.listError(); as listError) {
        <div class="price-policy-simulator-page__error" role="alert">
          {{ listError }}
        </div>
      }

      <section class="price-policy-simulator-page">
        <section class="price-policy-simulator-page__intro">
          <strong>Cómo usarlo</strong>
          <p>
            El simulador toma una política de precio existente y calcula cuánto
            costaría un viaje con los datos introducidos. Sirve para probar
            cambios antes de modificar reglas reales del sistema.
          </p>
        </section>

        <app-dynamic-form
          [config]="formConfig()"
          [saving]="false"
          [error]="formError()"
          (submitted)="simulate($event)"
          (cancelled)="clearResult()"
        />

        @if (selectedPolicy(); as policy) {
          <section class="price-policy-simulator-page__policy">
            <span>Política seleccionada</span>
            <strong>{{ policy.name }}</strong>
            <small>
              Alcance {{ policy.scopeType }} · prioridad {{ policy.priority }}
              · {{ policy.active ? 'activa' : 'inactiva' }}
            </small>
          </section>
        }

        @if (result(); as simulated) {
          <section class="price-policy-simulator-page__result">
            <article class="price-policy-simulator-page__total">
              <span>Precio final estimado</span>
              <strong>{{ simulated.total }} CUP</strong>
            </article>

            <article>
              <span>Subtotal antes de multiplicadores</span>
              <strong>{{ simulated.subtotal }} CUP</strong>
            </article>

            <article>
              <span>Total sin extras</span>
              <strong>{{ simulated.totalNoExtras }} CUP</strong>
            </article>

            <article>
              <span>Multiplicador final</span>
              <strong>{{ simulated.finalMultiplier }}</strong>
            </article>
          </section>

          <section class="price-policy-simulator-page__breakdown">
            <article>
              <h3>Detalle del cálculo</h3>

              <dl>
                <div>
                  <dt>Tarifa base aplicada</dt>
                  <dd>{{ simulated.base }} CUP</dd>
                </div>

                <div>
                  <dt>Importe por distancia</dt>
                  <dd>{{ simulated.distanceAmount }} CUP</dd>
                </div>

                <div>
                  <dt>Importe por tiempo</dt>
                  <dd>{{ simulated.timeAmount }} CUP</dd>
                </div>

                <div>
                  <dt>Tarifa mínima aplicada</dt>
                  <dd>{{ simulated.minimumFareApplied ? 'Sí' : 'No' }}</dd>
                </div>

                <div>
                  <dt>Tope máximo aplicado</dt>
                  <dd>{{ simulated.capApplied ? 'Sí' : 'No' }}</dd>
                </div>

                <div>
                  <dt>Tope configurado</dt>
                  <dd>{{ simulated.cap ?? '—' }}</dd>
                </div>
              </dl>
            </article>

            <article>
              <h3>Multiplicadores</h3>

              <dl>
                <div>
                  <dt>Política</dt>
                  <dd>{{ simulated.policyMultiplier }}</dd>
                </div>

                <div>
                  <dt>Combustible</dt>
                  <dd>{{ simulated.fuelMultiplier }}</dd>
                </div>

                <div>
                  <dt>Demanda</dt>
                  <dd>{{ simulated.demandMultiplier }}</dd>
                </div>

                <div>
                  <dt>Horario</dt>
                  <dd>{{ simulated.hourMultiplier }}</dd>
                </div>
              </dl>
            </article>
          </section>

          <section class="price-policy-simulator-page__raw">
            <h3>Rate card generado</h3>
            <pre>{{ stringify(simulated.rateCard) }}</pre>
          </section>
        } @else {
          <section class="price-policy-simulator-page__empty">
            <strong>Aún no hay simulación</strong>
            <p>
              Completa los valores del formulario y pulsa “Simular precio” para
              ver el resultado.
            </p>
          </section>
        }
      </section>
    </app-entity-page-card>
  `,
  styles: `
    .price-policy-simulator-page {
      display: grid;
      gap: 1.5rem;
    }

    .price-policy-simulator-page__intro,
    .price-policy-simulator-page__policy,
    .price-policy-simulator-page__empty,
    .price-policy-simulator-page__raw,
    .price-policy-simulator-page__breakdown article {
      display: grid;
      gap: 0.5rem;
      padding: 1rem;
      border: 1px solid var(--app-border);
      border-radius: var(--radius-lg);
      background: var(--app-surface);
    }

    .price-policy-simulator-page__intro strong,
    .price-policy-simulator-page__empty strong,
    .price-policy-simulator-page__policy strong {
      color: var(--app-text);
      font-weight: 900;
    }

    .price-policy-simulator-page__intro p,
    .price-policy-simulator-page__empty p,
    .price-policy-simulator-page__policy small {
      margin: 0;
      color: var(--app-text-muted);
      font-size: 0.9rem;
      font-weight: 650;
      line-height: 1.5;
    }

    .price-policy-simulator-page__policy span {
      color: var(--app-text-muted);
      font-size: 0.78rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .price-policy-simulator-page__result {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1rem;
    }

    .price-policy-simulator-page__result article {
      display: grid;
      gap: 0.35rem;
      padding: 1rem;
      border: 1px solid var(--app-border);
      border-radius: var(--radius-lg);
      background: var(--app-surface);
    }

    .price-policy-simulator-page__result span {
      color: var(--app-text-muted);
      font-size: 0.8rem;
      font-weight: 750;
    }

    .price-policy-simulator-page__result strong {
      color: var(--app-text);
      font-size: 1rem;
      font-weight: 900;
    }

    .price-policy-simulator-page__total {
      background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--app-primary) 14%, var(--app-surface)),
        var(--app-surface)
      ) !important;
      border-color: color-mix(
        in srgb,
        var(--app-primary) 38%,
        var(--app-border)
      ) !important;
    }

    .price-policy-simulator-page__total strong {
      color: var(--app-primary);
      font-size: 1.55rem;
    }

    .price-policy-simulator-page__breakdown {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }

    .price-policy-simulator-page__breakdown h3,
    .price-policy-simulator-page__raw h3 {
      margin: 0;
      color: var(--app-text);
      font-size: 1rem;
      font-weight: 850;
    }

    .price-policy-simulator-page__breakdown dl {
      display: grid;
      gap: 0.7rem;
      margin: 0;
    }

    .price-policy-simulator-page__breakdown dl div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding-bottom: 0.65rem;
      border-bottom: 1px solid var(--app-border);
    }

    .price-policy-simulator-page__breakdown dt {
      color: var(--app-text-muted);
      font-weight: 700;
    }

    .price-policy-simulator-page__breakdown dd {
      margin: 0;
      color: var(--app-text);
      font-weight: 900;
    }

    .price-policy-simulator-page__raw pre {
      margin: 0;
      padding: 1rem;
      overflow: auto;
      color: var(--app-text);
      background: var(--app-surface-2);
      border-radius: var(--radius-lg);
      font-size: 0.85rem;
      line-height: 1.5;
    }

    .price-policy-simulator-page__error {
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

    html[data-theme='dark'] .price-policy-simulator-page__error {
      color: #fca5a5;
      background: rgb(220 38 38 / 12%);
      border-color: rgb(248 113 113 / 28%);
    }

    @media (max-width: 1100px) {
      .price-policy-simulator-page__result,
      .price-policy-simulator-page__breakdown {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 720px) {
      .price-policy-simulator-page__result,
      .price-policy-simulator-page__breakdown {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricePolicySimulatorPage {
  readonly store = inject(PricePoliciesStore);

  readonly formError = signal<string | null>(null);
  readonly selectedPolicy = signal<PricePolicy | null>(null);
  readonly result = signal<PricePolicySimulatorResult | null>(null);

  readonly formConfig = computed(() =>
    buildPricePolicySimulatorFormConfig(this.store.policies()),
  );

  private readonly enterPageEffect = effect(() => {
    this.store.enterPoliciesList();
  });

  simulate(value: DynamicFormValue): void {
    this.formError.set(null);

    const policyId = readSimulatorPolicyId(value);

    if (!policyId) {
      this.formError.set('Selecciona una política para simular.');
      this.result.set(null);
      this.selectedPolicy.set(null);
      return;
    }

    const policy =
      this.store.policies().find((item) => item.id === policyId) ?? null;

    if (!policy) {
      this.formError.set('No se encontró la política seleccionada.');
      this.result.set(null);
      this.selectedPolicy.set(null);
      return;
    }

    const input = mapPricePolicySimulatorFormToInput(value, policy);
    const simulated = simulatePricePolicyQuote(input);

    this.selectedPolicy.set(policy);
    this.result.set(simulated);
  }

  clearResult(): void {
    this.formError.set(null);
    this.result.set(null);
    this.selectedPolicy.set(null);
  }

  stringify(value: Record<string, unknown>): string {
    return JSON.stringify(value, null, 2);
  }
}
