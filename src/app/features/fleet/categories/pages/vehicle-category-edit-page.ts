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
import { DynamicForm } from '../../../../shared/form/dynamic-form/dynamic-form';
import { DynamicFormValue } from '../../../../shared/form/dynamic-form-builder';

import { VehicleCategoriesStore } from '../data-access/vehicle-categories.store';
import { EDIT_VEHICLE_CATEGORY_FORM_CONFIG } from '../config/vehicle-categories-form.config';
import {
  mapEditVehicleCategoryFormToPayload,
  mapVehicleCategoryToEditFormValue,
} from '../config/vehicle-categories-form.mapper';

@Component({
  selector: 'app-vehicle-category-edit-page',
  standalone: true,
  imports: [
    DynamicForm,
    EntityPageCard,
    PageLoader,
  ],
  template: `
    <app-entity-page-card
      title="Editar categoría"
      subtitle="Actualiza los datos administrativos de la categoría."
      icon="edit"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      @if (store.detailLoading()) {
        <app-page-loader
          title="Cargando categoría..."
          description="Estamos preparando la información para editar."
        />
      } @else if (store.detailError(); as detailError) {
        <div class="vehicle-category-edit-page__error" role="alert">
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
    .vehicle-category-edit-page__error {
      padding: 1rem;
      color: var(--app-danger);
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-lg);
      font-weight: 750;
      line-height: 1.5;
    }

    html[data-theme='dark'] .vehicle-category-edit-page__error {
      color: #fca5a5;
      background: rgb(220 38 38 / 12%);
      border-color: rgb(248 113 113 / 28%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleCategoryEditPage {
  readonly store = inject(VehicleCategoriesStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly formConfig = EDIT_VEHICLE_CATEGORY_FORM_CONFIG;

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

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly categoryId = computed(() => this.paramMap().get('id'));

  readonly initialValue = computed(() => {
    const category = this.store.selectedCategory();

    return category ? mapVehicleCategoryToEditFormValue(category) : null;
  });

  private readonly clearStateEffect = effect(() => {
    this.store.clearUpdateState();
  });

  private readonly loadCategoryEffect = effect(() => {
    const id = this.categoryId();

    if (!id) {
      return;
    }

    this.store.loadCategoryDetail(id);
  });

  private readonly navigateAfterUpdateEffect = effect(() => {
    const updatedCategory = this.store.updatedCategory();

    if (!updatedCategory) {
      return;
    }

    this.store.clearUpdateState();

    this.router.navigate(['..'], {
      relativeTo: this.route,
    });
  });

  submit(value: DynamicFormValue): void {
    const id = this.categoryId();

    if (!id) {
      return;
    }

    this.store.updateCategory({
      id,
      payload: mapEditVehicleCategoryFormToPayload(value),
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
