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

import { VehicleCategoriesStore } from '../data-access/vehicle-categories.store';
import { CREATE_VEHICLE_CATEGORY_FORM_CONFIG } from '../config/vehicle-categories-form.config';
import { mapCreateVehicleCategoryFormToPayload } from '../config/vehicle-categories-form.mapper';

@Component({
  selector: 'app-vehicle-category-create-page',
  standalone: true,
  imports: [
    DynamicForm,
    EntityPageCard,
  ],
  template: `
    <app-entity-page-card
      title="Crear categoría"
      subtitle="Alta administrativa de una categoría de vehículos."
      icon="add_circle"
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
export class VehicleCategoryCreatePage {
  readonly store = inject(VehicleCategoriesStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly formConfig = CREATE_VEHICLE_CATEGORY_FORM_CONFIG;

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
    const createdCategory = this.store.createdCategory();

    if (!createdCategory) {
      return;
    }

    this.store.clearCreateState();

    this.router.navigate(['..', createdCategory.id], {
      relativeTo: this.route,
    });
  });

  submit(value: DynamicFormValue): void {
    this.store.createCategory(
      mapCreateVehicleCategoryFormToPayload(value),
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
