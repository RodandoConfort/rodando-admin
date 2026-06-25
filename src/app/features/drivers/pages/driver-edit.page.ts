import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicForm } from '../../../shared/form/dynamic-form/dynamic-form';
import { EntityPageCard } from '../../../shared/components/entity-page-card/entity-page-card';
import { PageLoader } from '../../../shared/feedback/page-loader/page-loader';
import { DriversStore } from '../data-access/drivers.store';
import { EntityPageCardAction } from '../../../shared/components/entity-page-card/entity-page-card.types';
import { DynamicFormValue } from '../../../shared/form/dynamic-form-builder';
import { EDIT_DRIVER_PROFILE_FORM_CONFIG } from '../config/driver-profile-form.config';
import { mapDriverProfileToEditFormValue, mapEditDriverProfileFormToPayload } from '../config/driver-profile-form.mapper';

@Component({
  selector: 'app-driver-edit-page',
  standalone: true,
  imports: [
    DynamicForm,
    EntityPageCard,
    PageLoader,
  ],
  template: `
    <app-entity-page-card
      title="Editar conductor"
      subtitle="Actualiza los datos administrativos del perfil del conductor."
      icon="edit"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      @if (store.detailLoading()) {
        <app-page-loader
          title="Cargando conductor..."
          description="Estamos preparando la información para editar."
        />
      } @else if (store.detailError(); as detailError) {
        <div class="driver-edit-page__error" role="alert">
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
    .driver-edit-page__error {
      padding: 1rem;
      color: var(--app-danger);
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-lg);
      font-weight: 750;
      line-height: 1.5;
    }

    html[data-theme='dark'] .driver-edit-page__error {
      color: #fca5a5;
      background: rgb(220 38 38 / 12%);
      border-color: rgb(248 113 113 / 28%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DriverEditPage {
  readonly store = inject(DriversStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly formConfig = EDIT_DRIVER_PROFILE_FORM_CONFIG;

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly driverId = computed(() => this.paramMap().get('id'));

  readonly initialValue = computed(() => {
    const driver = this.store.selected();

    return driver ? mapDriverProfileToEditFormValue(driver) : null;
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

  private readonly loadDriverEffect = effect(() => {
    const id = this.driverId();

    if (!id) {
      return;
    }

    this.store.loadDriverDetail(id);
  });

  private readonly navigateAfterUpdateEffect = effect(() => {
    const updated = this.store.updatedDriverProfile();

    if (!updated) {
      return;
    }

    this.store.clearUpdateState();

    this.router.navigate(['../..'], {
      relativeTo: this.route,
    });
  });

  submit(value: DynamicFormValue): void {
    const id = this.driverId();

    if (!id) {
      return;
    }

    this.store.updateDriver({
      id,
      payload: mapEditDriverProfileFormToPayload(value),
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
