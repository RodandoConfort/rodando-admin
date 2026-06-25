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
import { PageLoader } from '../../../../shared/feedback/page-loader/page-loader';

import { VehicleTypesStore } from '../data-access/vehicle-types.store';
import { buildCreateVehicleTypeFormConfig } from '../config/vehicle-types-form.config';
import { mapCreateVehicleTypeFormToPayload } from '../config/vehicle-types-form.mapper';

@Component({
  selector: 'app-vehicle-type-create-page',
  standalone: true,
  imports: [
    DynamicForm,
    EntityPageCard,
    PageLoader,
  ],
  template: `
    <app-entity-page-card
      title="Crear tipo"
      subtitle="Alta administrativa de un tipo de vehículo."
      icon="add_circle"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      @if (store.catalogsLoading()) {
        <app-page-loader
          title="Cargando catálogos..."
          description="Estamos preparando las categorías y clases de servicio."
        />
      } @else if (store.catalogsError(); as catalogsError) {
        <div class="vehicle-type-create-page__error" role="alert">
          {{ catalogsError }}
        </div>
      } @else {
        <app-dynamic-form
          [config]="formConfig()"
          [saving]="store.createSaving()"
          [error]="store.createError()"
          (submitted)="submit($event)"
          (cancelled)="goBack()"
        />
      }
    </app-entity-page-card>
  `,
  styles: `
    .vehicle-type-create-page__error {
      padding: 1rem;
      color: var(--app-danger);
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-lg);
      font-weight: 750;
      line-height: 1.5;
    }

    html[data-theme='dark'] .vehicle-type-create-page__error {
      color: #fca5a5;
      background: rgb(220 38 38 / 12%);
      border-color: rgb(248 113 113 / 28%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleTypeCreatePage {
  readonly store = inject(VehicleTypesStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly formConfig = computed(() =>
    buildCreateVehicleTypeFormConfig(
      this.store.categoryOptions(),
      this.store.serviceClassOptions(),
    ),
  );

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

  private readonly loadCatalogsEffect = effect(() => {
    this.store.loadFormCatalogs();
  });

  private readonly clearStateEffect = effect(() => {
    this.store.clearCreateState();
  });

  private readonly navigateAfterCreateEffect = effect(() => {
    const createdType = this.store.createdType();

    if (!createdType) {
      return;
    }

    this.store.clearCreateState();

    this.router.navigate(['..'], {
      relativeTo: this.route,
    });
  });

  submit(value: DynamicFormValue): void {
    this.store.createType(
      mapCreateVehicleTypeFormToPayload(value),
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
