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

import { VehicleTypesStore } from '../data-access/vehicle-types.store';
import { buildEditVehicleTypeFormConfig } from '../config/vehicle-types-form.config';
import {
  mapEditVehicleTypeFormToPayload,
  mapVehicleTypeToEditFormValue,
} from '../config/vehicle-types-form.mapper';

@Component({
  selector: 'app-vehicle-type-edit-page',
  standalone: true,
  imports: [
    DynamicForm,
    EntityPageCard,
    PageLoader,
  ],
  template: `
    <app-entity-page-card
      title="Editar tipo"
      subtitle="Actualiza tarifas, categoría y clases de servicio asociadas."
      icon="edit"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      @if (store.detailLoading() || store.catalogsLoading()) {
        <app-page-loader
          title="Cargando tipo..."
          description="Estamos preparando la información para editar."
        />
      } @else if (store.detailError(); as detailError) {
        <div class="vehicle-type-edit-page__error" role="alert">
          {{ detailError }}
        </div>
      } @else if (store.catalogsError(); as catalogsError) {
        <div class="vehicle-type-edit-page__error" role="alert">
          {{ catalogsError }}
        </div>
      } @else if (initialValue(); as initialFormValue) {
        <app-dynamic-form
          [config]="formConfig()"
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
    .vehicle-type-edit-page__error {
      padding: 1rem;
      color: var(--app-danger);
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-lg);
      font-weight: 750;
      line-height: 1.5;
    }

    html[data-theme='dark'] .vehicle-type-edit-page__error {
      color: #fca5a5;
      background: rgb(220 38 38 / 12%);
      border-color: rgb(248 113 113 / 28%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleTypeEditPage {
  readonly store = inject(VehicleTypesStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly typeId = computed(() => this.paramMap().get('id'));

  readonly formConfig = computed(() =>
    buildEditVehicleTypeFormConfig(
      this.store.categoryOptions(),
      this.store.serviceClassOptions(),
    ),
  );

  readonly initialValue = computed(() => {
    const type = this.store.selectedType();

    return type ? mapVehicleTypeToEditFormValue(type) : null;
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

  private readonly loadCatalogsEffect = effect(() => {
    this.store.loadFormCatalogs();
  });

  private readonly loadTypeEffect = effect(() => {
    const id = this.typeId();

    if (!id) {
      return;
    }

    this.store.loadTypeDetail(id);
  });

  private readonly navigateAfterUpdateEffect = effect(() => {
    const updatedType = this.store.updatedType();

    if (!updatedType) {
      return;
    }

    this.store.clearUpdateState();

    this.router.navigate(['../..'], {
      relativeTo: this.route,
    });
  });

  submit(value: DynamicFormValue): void {
    const id = this.typeId();

    if (!id) {
      return;
    }

    this.store.updateType({
      id,
      payload: mapEditVehicleTypeFormToPayload(value),
    });
  }

  onCardAction(actionKey: string): void {
    if (actionKey === 'back') {
      this.goBack();
    }
  }

  goBack(): void {
    this.router.navigate(['../..'], {
      relativeTo: this.route,
    });
  }
}
