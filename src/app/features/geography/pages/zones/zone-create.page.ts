import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EntityPageCard } from '../../../../shared/components/entity-page-card/entity-page-card';
import { EntityPageCardAction } from '../../../../shared/components/entity-page-card/entity-page-card.types';
import { DynamicForm } from '../../../../shared/form/dynamic-form/dynamic-form';
import { DynamicFormValue } from '../../../../shared/form/dynamic-form-builder';

import { ZonesStore } from '../../data-access/zones.store';
import { buildCreateZoneFormConfig } from '../../config/zone-form.config';
import { mapZoneFormToCreatePayload } from '../../config/geography-form.mapper';

@Component({
  selector: 'app-zone-create-page',
  standalone: true,
  imports: [
    EntityPageCard,
    DynamicForm,
  ],
  template: `
    <app-entity-page-card
      title="Crear zona"
      subtitle="Registra una zona operativa asociada a una ciudad."
      icon="add_location_alt"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      <app-dynamic-form
        [config]="formConfig()"
        [saving]="store.saving()"
        [error]="store.saveError()"
        (submitted)="submit($event)"
        (cancelled)="goBack()"
      />
    </app-entity-page-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZoneCreatePage {
  readonly store = inject(ZonesStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly formConfig = computed(() =>
    buildCreateZoneFormConfig(this.store.cityOptions()),
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

  private readonly enterEffect = effect(() => {
    this.store.enterCreate();
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
    this.store.createZone(mapZoneFormToCreatePayload(value));
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
