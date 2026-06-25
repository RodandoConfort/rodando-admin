import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { EntityPageCard } from '../../../shared/components/entity-page-card/entity-page-card';
import { EntityPageCardAction } from '../../../shared/components/entity-page-card/entity-page-card.types';
import { DynamicForm } from '../../../shared/form/dynamic-form/dynamic-form';
import { DynamicFormValue } from '../../../shared/form/dynamic-form-builder';
import { PageLoader } from '../../../shared/feedback/page-loader/page-loader';

import { CashCollectionPointsStore } from '../data-access/cash-collection-points.store';
import { EDIT_CASH_COLLECTION_POINT_FORM_CONFIG } from '../config/cash-collection-points-form.config';
import {
  mapCashCollectionPointToFormValue,
  mapEditCashCollectionPointFormToPayload,
} from '../config/cash-collection-points-form.mapper';

@Component({
  selector: 'app-cash-collection-point-edit-page',
  standalone: true,
  imports: [
    EntityPageCard,
    DynamicForm,
    PageLoader,
  ],
  template: `
    <app-entity-page-card
      title="Editar punto de recaudo"
      subtitle="Actualiza los datos del punto de recaudo."
      icon="edit_location_alt"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      @if (store.detailLoading()) {
        <app-page-loader
          title="Cargando punto..."
          description="Estamos preparando la información para editar."
        />
      } @else if (store.detailError(); as detailError) {
        <div class="cash-collection-point-edit-page__error" role="alert">
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
    .cash-collection-point-edit-page__error {
      padding: 1rem;
      color: var(--app-danger);
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-lg);
      font-weight: 750;
      line-height: 1.5;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashCollectionPointEditPage {
  readonly store = inject(CashCollectionPointsStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly formConfig = EDIT_CASH_COLLECTION_POINT_FORM_CONFIG;

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly pointId = computed(() => this.paramMap().get('id'));

  readonly initialValue = computed(() => {
    const point = this.store.selectedPoint();

    return point ? mapCashCollectionPointToFormValue(point) : null;
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

  private readonly loadPointEffect = effect(() => {
    const id = this.pointId();

    if (!id) {
      return;
    }

    this.store.loadPointDetail(id);
  });

  private readonly navigateAfterUpdateEffect = effect(() => {
    const updated = this.store.updatedPoint();

    if (!updated) {
      return;
    }

    this.store.clearUpdateState();

    this.router.navigate(['..'], {
      relativeTo: this.route,
    });
  });

  submit(value: DynamicFormValue): void {
    const id = this.pointId();

    if (!id) {
      return;
    }

    this.store.updatePoint({
      id,
      payload: mapEditCashCollectionPointFormToPayload(value),
    });
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
