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
import { DynamicForm } from '../../../../shared/form/dynamic-form/dynamic-form';
import { EntityPageCardAction } from '../../../../shared/components/entity-page-card/entity-page-card.types';
import { DynamicFormValue } from '../../../../shared/form/dynamic-form-builder';

import { SystemSettingsStore } from '../data-access/system-settings.store';
import { EDIT_SYSTEM_SETTING_FORM_CONFIG } from '../config/system-settings-form.config';
import {
  mapSystemSettingFormToUpdatePayload,
  mapSystemSettingToFormValue,
} from '../config/system-settings-form.mapper';
import { PageLoader } from '../../../../shared/feedback/page-loader/page-loader';

@Component({
  selector: 'app-system-setting-edit-page',
  standalone: true,
  imports: [
    EntityPageCard,
    DynamicForm,
    PageLoader,
  ],
  template: `
    <app-entity-page-card
      title="Editar configuración"
      subtitle="Actualiza el valor y los metadatos de la variable del sistema."
      icon="edit"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      @if (store.detailLoading()) {
        <app-page-loader
          title="Cargando configuración..."
          description="Estamos preparando la información para editar."
        />
      } @else if (store.detailError(); as detailError) {
        <div class="system-setting-edit-page__error" role="alert">
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
    .system-setting-edit-page__error {
      padding: 1rem;
      color: var(--app-danger);
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-lg);
      font-weight: 750;
      line-height: 1.5;
    }

    html[data-theme='dark'] .system-setting-edit-page__error {
      color: #fca5a5;
      background: rgb(220 38 38 / 12%);
      border-color: rgb(248 113 113 / 28%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemSettingEditPage {
  readonly store = inject(SystemSettingsStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly formConfig = EDIT_SYSTEM_SETTING_FORM_CONFIG;

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly settingKey = computed(() => this.paramMap().get('key'));

  readonly initialValue = computed(() => {
    const setting = this.store.selectedSetting();

    return setting ? mapSystemSettingToFormValue(setting) : null;
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

  private readonly loadSettingEffect = effect(() => {
    const key = this.settingKey();

    if (!key) {
      return;
    }

    this.store.loadSettingDetail(key);
  });

  private readonly navigateAfterUpdateEffect = effect(() => {
    const updated = this.store.updatedSetting();

    if (!updated) {
      return;
    }

    this.store.clearUpdateState();

    this.router.navigate(['..'], {
      relativeTo: this.route,
    });
  });

  submit(value: DynamicFormValue): void {
    const key = this.settingKey();

    if (!key) {
      return;
    }

    try {
      this.store.updateSetting({
        key,
        payload: mapSystemSettingFormToUpdatePayload(value),
      });
    } catch (error) {
      this.store.setLocalUpdateError(
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
