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

import { VehiclesStore } from '../data-access/vehicles.store';
import { buildEditVehicleFormConfig } from '../config/vehicles-form.config';
import {
  mapEditVehicleFormToPayload,
  mapVehicleToEditFormValue,
} from '../config/vehicles-form.mapper';

@Component({
  selector: 'app-vehicle-edit-page',
  standalone: true,
  imports: [
    DynamicForm,
    EntityPageCard,
    PageLoader,
  ],
  template: `
    <app-entity-page-card
      title="Editar vehículo"
      subtitle="Actualiza datos administrativos, estado y mantenimiento."
      icon="edit"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      @if (store.detailLoading() || store.catalogsLoading()) {
        <app-page-loader
          title="Cargando vehículo..."
          description="Estamos preparando la información para editar."
        />
      } @else if (store.detailError(); as detailError) {
        <div class="vehicle-edit-page__error" role="alert">
          {{ detailError }}
        </div>
      } @else if (store.catalogsError(); as catalogsError) {
        <div class="vehicle-edit-page__error" role="alert">
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
    .vehicle-edit-page__error {
      padding: 1rem;
      color: var(--app-danger);
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-lg);
      font-weight: 750;
      line-height: 1.5;
    }

    html[data-theme='dark'] .vehicle-edit-page__error {
      color: #fca5a5;
      background: rgb(220 38 38 / 12%);
      border-color: rgb(248 113 113 / 28%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleEditPage {
  readonly store = inject(VehiclesStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly vehicleId = computed(() => this.paramMap().get('id'));

  readonly formConfig = computed(() =>
    buildEditVehicleFormConfig(
      this.store.vehicleTypeOptions(),
    ),
  );

  readonly initialValue = computed(() => {
    const vehicle = this.store.selectedVehicle();

    return vehicle ? mapVehicleToEditFormValue(vehicle) : null;
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

  private readonly loadVehicleEffect = effect(() => {
    const id = this.vehicleId();

    if (!id) {
      return;
    }

    this.store.loadVehicleDetail(id);
  });

  private readonly navigateAfterUpdateEffect = effect(() => {
    const updatedVehicle = this.store.updatedVehicle();

    if (!updatedVehicle) {
      return;
    }

    this.store.clearUpdateState();

    this.router.navigate(['../..'], {
      relativeTo: this.route,
    });
  });

  submit(value: DynamicFormValue): void {
    const id = this.vehicleId();

    if (!id) {
      return;
    }

    this.store.updateVehicle({
      id,
      payload: mapEditVehicleFormToPayload(value),
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
