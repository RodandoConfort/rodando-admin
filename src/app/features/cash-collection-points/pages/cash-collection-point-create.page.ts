import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EntityPageCard } from '../../../shared/components/entity-page-card/entity-page-card';
import { EntityPageCardAction } from '../../../shared/components/entity-page-card/entity-page-card.types';
import { DynamicForm } from '../../../shared/form/dynamic-form/dynamic-form';
import { DynamicFormValue } from '../../../shared/form/dynamic-form-builder';

import { CashCollectionPointsStore } from '../data-access/cash-collection-points.store';
import { CREATE_CASH_COLLECTION_POINT_FORM_CONFIG } from '../config/cash-collection-points-form.config';
import { mapCashCollectionPointFormToPayload } from '../config/cash-collection-points-form.mapper';

@Component({
  selector: 'app-cash-collection-point-create-page',
  standalone: true,
  imports: [
    EntityPageCard,
    DynamicForm,
  ],
  template: `
    <app-entity-page-card
      title="Crear punto de recaudo"
      subtitle="Registra un punto físico donde se reciben depósitos en efectivo."
      icon="add_location_alt"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
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
export class CashCollectionPointCreatePage {
  readonly store = inject(CashCollectionPointsStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly formConfig = CREATE_CASH_COLLECTION_POINT_FORM_CONFIG;

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
    const created = this.store.createdPoint();

    if (!created) {
      return;
    }

    this.store.clearCreateState();

    this.router.navigate(['..', created.id], {
      relativeTo: this.route,
    });
  });

  submit(value: DynamicFormValue): void {
    this.store.createPoint(
      mapCashCollectionPointFormToPayload(value),
    );
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
