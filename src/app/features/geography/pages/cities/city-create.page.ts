import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EntityPageCard } from '../../../../shared/components/entity-page-card/entity-page-card';
import { EntityPageCardAction } from '../../../../shared/components/entity-page-card/entity-page-card.types';
import { DynamicForm } from '../../../../shared/form/dynamic-form/dynamic-form';
import { DynamicFormValue } from '../../../../shared/form/dynamic-form-builder';

import { CitiesStore } from '../../data-access/cities.store';
import { CREATE_CITY_FORM_CONFIG } from '../../config/city-form.config';
import { mapCityFormToCreatePayload } from '../../config/geography-form.mapper';

@Component({
  selector: 'app-city-create-page',
  standalone: true,
  imports: [
    EntityPageCard,
    DynamicForm,
  ],
  template: `
    <app-entity-page-card
      title="Crear ciudad"
      subtitle="Registra una ciudad operativa para agrupar zonas y tarifas."
      icon="add_location_alt"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      <app-dynamic-form
        [config]="formConfig"
        [saving]="store.saving()"
        [error]="store.saveError()"
        (submitted)="submit($event)"
        (cancelled)="goBack()"
      />
    </app-entity-page-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CityCreatePage {
  readonly store = inject(CitiesStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly formConfig = CREATE_CITY_FORM_CONFIG;

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
    this.store.clearSaveState();
  });

  private readonly navigateAfterSaveEffect = effect(() => {
    const saved = this.store.saved();

    if (!saved) {
      return;
    }

    this.store.clearSaveState();

    this.router.navigate(['..', saved.id], {
      relativeTo: this.route,
    });
  });

  submit(value: DynamicFormValue): void {
    this.store.createCity(mapCityFormToCreatePayload(value));
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
