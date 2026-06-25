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
import { DynamicForm } from '../../../../shared/form/dynamic-form/dynamic-form';
import { DynamicFormValue } from '../../../../shared/form/dynamic-form-builder';
import { PageLoader } from '../../../../shared/feedback/page-loader/page-loader';

import { PricePoliciesSegments } from '../components/price-policies-segments/price-policies-segments';
import { EDIT_PRICE_POLICY_FORM_CONFIG } from '../config/price-policies-form.config';
import {
  mapPricePolicyFormToUpdatePayload,
  mapPricePolicyToFormValue,
} from '../config/price-policies-form.mapper';
import { PricePoliciesStore } from '../data-access/price-policies.store';

@Component({
  selector: 'app-price-policy-edit-page',
  standalone: true,
  imports: [
    EntityPageCard,
    DynamicForm,
    PageLoader,
    PricePoliciesSegments,
  ],
  template: `
    <app-entity-page-card
      title="Editar política de precio"
      subtitle="Actualiza el alcance, vigencia, condiciones y reglas de precio."
      icon="edit"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      <app-price-policies-segments />

      @if (store.detailLoading()) {
        <app-page-loader
          title="Cargando política..."
          description="Estamos preparando la información para editar."
        />
      } @else if (store.detailError(); as detailError) {
        <div class="price-policy-edit-page__error" role="alert">
          {{ detailError }}
        </div>
      } @else if (initialValue(); as initialFormValue) {
        <app-dynamic-form
          [config]="formConfig"
          [initialValue]="initialFormValue"
          [saving]="store.updateSaving()"
          [error]="store.updateError()"
          (submitted)="submit($event)"
          (cancelled)="goBack()"
        />
      }
    </app-entity-page-card>
  `,
  styles: `
    .price-policy-edit-page__error {
      padding: 1rem;
      color: var(--app-danger);
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-lg);
      font-weight: 750;
      line-height: 1.5;
    }

    html[data-theme='dark'] .price-policy-edit-page__error {
      color: #fca5a5;
      background: rgb(220 38 38 / 12%);
      border-color: rgb(248 113 113 / 28%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricePolicyEditPage {
  readonly store = inject(PricePoliciesStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly formConfig = EDIT_PRICE_POLICY_FORM_CONFIG;

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly policyId = computed(() => this.paramMap().get('id'));

  readonly initialValue = computed(() => {
    const policy = this.store.selectedPolicy();

    return policy ? mapPricePolicyToFormValue(policy) : null;
  });

  readonly cardActions = computed<readonly EntityPageCardAction[]>(() => [
    {
      key: 'back',
      label: 'Volver',
      icon: 'arrow_back',
      placement: 'header',
      variant: 'text',
      tone: 'neutral',
    },
  ]);

  private readonly clearStateEffect = effect(() => {
    this.store.clearUpdateState();
  });

  private readonly loadPolicyEffect = effect(() => {
    const id = this.policyId();

    if (!id) {
      return;
    }

    this.store.loadPolicyDetail(id);
  });

  private readonly navigateAfterUpdateEffect = effect(() => {
    const updated = this.store.updatedPolicy();

    if (!updated) {
      return;
    }

    this.store.clearUpdateState();

    this.router.navigate(['..'], {
      relativeTo: this.route,
    });
  });

  submit(value: DynamicFormValue): void {
    const id = this.policyId();

    if (!id) {
      return;
    }

    try {
      this.store.updatePolicy({
        id,
        payload: mapPricePolicyFormToUpdatePayload(value),
      });
    } catch (error) {
      this.store.setLocalUpdateError(
        error instanceof Error
          ? error.message
          : 'La política de precio no es válida.',
      );
    }
  }

  onCardAction(actionKey: string): void {
    if (actionKey === 'back') {
      this.goBack();
    }
  }

  goBack(): void {
    this.router.navigate(['..'], {
      relativeTo: this.route,
    });
  }
}
