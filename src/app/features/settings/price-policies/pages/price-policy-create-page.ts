import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EntityPageCard } from '../../../../shared/components/entity-page-card/entity-page-card';
import { EntityPageCardAction } from '../../../../shared/components/entity-page-card/entity-page-card.types';
import { DynamicForm } from '../../../../shared/form/dynamic-form/dynamic-form';
import { DynamicFormValue } from '../../../../shared/form/dynamic-form-builder';

import { PricePoliciesSegments } from '../components/price-policies-segments/price-policies-segments';
import { CREATE_PRICE_POLICY_FORM_CONFIG } from '../config/price-policies-form.config';
import { PricePoliciesStore } from '../data-access/price-policies.store';
import { mapPricePolicyFormToCreatePayload } from '../config/price-policies-form.mapper';

@Component({
  selector: 'app-price-policy-create-page',
  standalone: true,
  imports: [
    EntityPageCard,
    DynamicForm,
    PricePoliciesSegments,
  ],
  template: `
    <app-entity-page-card
      title="Crear política de precio"
      subtitle="Registra una regla global, por ciudad o por zona para ajustar tarifas."
      icon="add_circle"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      <app-price-policies-segments />

      <app-dynamic-form
        [config]="formConfig"
        [saving]="store.createSaving()"
        [error]="store.createError()"
        (submitted)="submit($event)"
        (cancelled)="goBack()"
      />
    </app-entity-page-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricePolicyCreatePage {
  readonly store = inject(PricePoliciesStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly formConfig = CREATE_PRICE_POLICY_FORM_CONFIG;

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
    this.store.clearCreateState();
  });

  private readonly navigateAfterCreateEffect = effect(() => {
    const created = this.store.createdPolicy();

    if (!created) {
      return;
    }

    this.store.clearCreateState();

    this.router.navigate(['..', created.id], {
      relativeTo: this.route,
    });
  });

  submit(value: DynamicFormValue): void {
    try {
      this.store.createPolicy(
        mapPricePolicyFormToCreatePayload(value),
      );
    } catch (error) {
      this.store.setLocalCreateError(
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
