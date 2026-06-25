import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SystemSettingsStore } from '../data-access/system-settings.store';
import { CREATE_SYSTEM_SETTING_FORM_CONFIG } from '../config/system-settings-form.config';
import { mapSystemSettingFormToCreatePayload } from '../config/system-settings-form.mapper';
import { EntityPageCard } from '../../../../shared/components/entity-page-card/entity-page-card';
import { DynamicForm } from '../../../../shared/form/dynamic-form/dynamic-form';
import { EntityPageCardAction } from '../../../../shared/components/entity-page-card/entity-page-card.types';
import { DynamicFormValue } from '../../../../shared/form/dynamic-form-builder';

@Component({
  selector: 'app-system-setting-create-page',
  standalone: true,
  imports: [
    EntityPageCard,
    DynamicForm,
  ],
  template: `
    <app-entity-page-card
      title="Crear configuración"
      subtitle="Registra una variable dinámica del sistema."
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
export class SystemSettingCreatePage {
  readonly store = inject(SystemSettingsStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly formConfig = CREATE_SYSTEM_SETTING_FORM_CONFIG;

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
    const created = this.store.createdSetting();

    if (!created) {
      return;
    }

    this.store.clearCreateState();

    this.router.navigate(['..', created.key], {
      relativeTo: this.route,
    });
  });

  submit(value: DynamicFormValue): void {
    try {
      this.store.createSetting(
        mapSystemSettingFormToCreatePayload(value),
      );
    } catch (error) {
      this.store.setLocalCreateError(
        error instanceof Error
          ? error.message
          : 'El valor de la configuración no es válido.',
      );
    }
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
