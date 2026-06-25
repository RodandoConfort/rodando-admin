import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { EntityPageCard } from '../../../../shared/components/entity-page-card/entity-page-card';
import { EntityPageCardAction } from '../../../../shared/components/entity-page-card/entity-page-card.types';
import { DynamicForm } from '../../../../shared/form/dynamic-form/dynamic-form';
import { DynamicFormValue } from '../../../../shared/form/dynamic-form-builder';

import { CitiesStore } from '../../data-access/cities.store';
import { EDIT_CITY_FORM_CONFIG } from '../../config/city-form.config';
import {
  mapCityFormToUpdatePayload,
  mapCityToFormValue,
} from '../../config/geography-form.mapper';

@Component({
  selector: 'app-city-edit-page',
  standalone: true,
  imports: [
    EntityPageCard,
    DynamicForm,
  ],
  template: `
    <app-entity-page-card
      title="Editar ciudad"
      subtitle="Actualiza la información operativa de la ciudad."
      icon="edit_location_alt"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      @if (store.detailLoading()) {
        <p>Cargando ciudad...</p>
      } @else if (store.detailError(); as error) {
        <p class="geography-page__error">{{ error }}</p>
      } @else if (initialValue(); as formValue) {
        <app-dynamic-form
          [config]="formConfig"
          [initialValue]="formValue"
          [saving]="store.saving()"
          [error]="store.saveError()"
          (submitted)="submit($event)"
          (cancelled)="goBack()"
        />
      }
    </app-entity-page-card>
  `,
  styles: `
    .geography-page__error {
      margin: 0;
      padding: 1rem;
      color: var(--app-danger);
      border: 1px solid rgb(248 113 113 / 28%);
      border-radius: var(--radius-lg);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CityEditPage {
  readonly store = inject(CitiesStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly formConfig = EDIT_CITY_FORM_CONFIG;

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly cityId = computed(() => this.paramMap().get('id'));

  readonly initialValue = computed(() => {
    const city = this.store.selected();

    return city ? mapCityToFormValue(city) : null;
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

  private readonly loadEffect = effect(() => {
    const id = this.cityId();

    if (!id) {
      return;
    }

    this.store.loadCity(id);
  });

  private readonly navigateAfterSaveEffect = effect(() => {
    const saved = this.store.saved();

    if (!saved) {
      return;
    }

    this.store.clearSaveState();

    this.router.navigate(['..'], {
      relativeTo: this.route,
    });
  });

  submit(value: DynamicFormValue): void {
    const id = this.cityId();

    if (!id) {
      return;
    }

    this.store.updateCity({
      id,
      payload: mapCityFormToUpdatePayload(value),
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
