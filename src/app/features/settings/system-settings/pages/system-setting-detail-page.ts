import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SystemSettingsStore } from '../data-access/system-settings.store';
import {
  formatSystemSettingValue,
  getSystemSettingGroupLabel,
  getSystemSettingValueTypeLabel,
} from '../data-access/system-settings.models';
import { PageLoader } from '../../../../shared/feedback/page-loader/page-loader';
import { EntityPageCard } from '../../../../shared/components/entity-page-card/entity-page-card';
import { EntityPageCardAction } from '../../../../shared/components/entity-page-card/entity-page-card.types';

@Component({
  selector: 'app-system-setting-detail-page',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, EntityPageCard, PageLoader],
  template: `
    <app-entity-page-card
      title="Detalle de configuración"
      subtitle="Información de la variable dinámica del sistema."
      icon="tune"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      @if (store.detailLoading()) {
        <app-page-loader
          title="Cargando configuración..."
          description="Estamos consultando la variable del sistema."
        />
      } @else if (store.detailError(); as detailError) {
        <div class="system-setting-detail-page__error" role="alert">
          {{ detailError }}
        </div>
      } @else if (store.selectedSetting(); as setting) {
        <section class="system-setting-detail-page">
          <header class="system-setting-detail-page__summary">
            <article>
              <span>Clave</span>
              <strong class="system-setting-detail-page__key">
                {{ setting.key }}
              </strong>
            </article>

            <article>
              <span>Grupo</span>
              <strong>{{ groupLabel(setting.group) }}</strong>
            </article>

            <article>
              <span>Tipo</span>
              <strong>{{ valueTypeLabel(setting.valueType) }}</strong>
            </article>

            <article>
              <span>Estado</span>
              <strong
                class="system-setting-detail-page__status"
                [class.system-setting-detail-page__status--active]="setting.active"
                [class.system-setting-detail-page__status--inactive]="!setting.active"
              >
                {{ setting.active ? 'Activo' : 'Inactivo' }}
              </strong>
            </article>
          </header>

          <section class="system-setting-detail-page__section">
            <h3>Valor</h3>

            @if (isJsonValue(setting.value)) {
              <pre>{{ stringify(setting.value) }}</pre>
            } @else {
              <p>{{ valueLabel(setting) }}</p>
            }
          </section>

          <section
            class="system-setting-detail-page__summary system-setting-detail-page__summary--secondary"
          >
            <article>
              <span>Público</span>
              <strong>{{ setting.isPublic ? 'Sí' : 'No' }}</strong>
            </article>

            <article>
              <span>Secreto</span>
              <strong>{{ setting.isSecret ? 'Sí' : 'No' }}</strong>
            </article>

            <article>
              <span>Actualizado por</span>
              <strong>{{ setting.updatedBy || '—' }}</strong>
            </article>
          </section>

          <section class="system-setting-detail-page__section">
            <h3>Descripción</h3>
            <p>{{ setting.description || 'Sin descripción registrada.' }}</p>
          </section>
        </section>
      }
    </app-entity-page-card>
  `,
  styles: `
    .system-setting-detail-page {
      display: grid;
      gap: 1.5rem;
    }

    .system-setting-detail-page__summary {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1rem;
    }

    .system-setting-detail-page__summary--secondary {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .system-setting-detail-page__summary article,
    .system-setting-detail-page__section {
      display: grid;
      gap: 0.5rem;
      padding: 1rem;
      border: 1px solid var(--app-border);
      border-radius: var(--radius-lg);
      background: var(--app-surface);
    }

    .system-setting-detail-page__summary span {
      color: var(--app-text-muted);
      font-size: 0.8rem;
      font-weight: 750;
    }

    .system-setting-detail-page__summary strong {
      color: var(--app-text);
      font-size: 1rem;
      font-weight: 850;
      overflow-wrap: anywhere;
    }

    .system-setting-detail-page__key {
      font-family:
        ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
      font-size: 0.92rem !important;
    }

    .system-setting-detail-page__status {
      width: fit-content;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      font-size: 0.85rem !important;
    }

    .system-setting-detail-page__status--active {
      color: #166534 !important;
      background: #dcfce7;
    }

    .system-setting-detail-page__status--inactive {
      color: #92400e !important;
      background: #fef3c7;
    }

    .system-setting-detail-page__section h3 {
      margin: 0;
      color: var(--app-text);
      font-size: 1rem;
      font-weight: 850;
    }

    .system-setting-detail-page__section p {
      margin: 0;
      color: var(--app-text-muted);
      font-weight: 650;
      line-height: 1.5;
      overflow-wrap: anywhere;
    }

    .system-setting-detail-page__section pre {
      margin: 0;
      padding: 1rem;
      overflow: auto;
      color: var(--app-text);
      background: var(--app-surface-2);
      border-radius: var(--radius-lg);
      font-size: 0.85rem;
      line-height: 1.5;
    }

    .system-setting-detail-page__error {
      padding: 1rem;
      color: var(--app-danger);
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-lg);
      font-weight: 750;
      line-height: 1.5;
    }

    html[data-theme='dark'] .system-setting-detail-page__error {
      color: #fca5a5;
      background: rgb(220 38 38 / 12%);
      border-color: rgb(248 113 113 / 28%);
    }

    @media (max-width: 1100px) {
      .system-setting-detail-page__summary,
      .system-setting-detail-page__summary--secondary {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 700px) {
      .system-setting-detail-page__summary,
      .system-setting-detail-page__summary--secondary {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemSettingDetailPage {
  readonly store = inject(SystemSettingsStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly settingKey = computed(() => this.paramMap().get('key'));

  readonly cardActions = computed<readonly EntityPageCardAction[]>(() => {
    const setting = this.store.selectedSetting();

    const actions: EntityPageCardAction[] = [
      {
        key: 'back',
        label: 'Volver',
        icon: 'arrow_back',
        placement: 'header',
        variant: 'text',
        tone: 'neutral',
      },
    ];

    if (setting) {
      actions.push(
        {
          key: 'toggle-active',
          label: setting.active ? 'Desactivar' : 'Activar',
          icon: setting.active ? 'toggle_off' : 'toggle_on',
          placement: 'header',
          variant: 'outlined',
          tone: 'neutral',
        },
        {
          key: 'edit',
          label: 'Editar',
          icon: 'edit',
          placement: 'header',
          variant: 'filled',
          tone: 'primary',
        },
      );
    }

    return actions;
  });

  private readonly loadSettingEffect = effect(() => {
    const key = this.settingKey();

    if (!key) {
      return;
    }

    this.store.loadSettingDetail(key);
  });

  onCardAction(actionKey: string): void {
    if (actionKey === 'back') {
      this.goBack();
      return;
    }

    if (actionKey === 'edit') {
      this.goToEdit();
      return;
    }

    if (actionKey === 'toggle-active') {
      const setting = this.store.selectedSetting();

      if (!setting) {
        return;
      }

      this.store.setSettingActive({
        key: setting.key,
        active: !setting.active,
      });
    }
  }

  goToEdit(): void {
    this.router.navigate(['edit'], {
      relativeTo: this.route,
    });
  }

  goBack(): void {
    this.router.navigate(['..'], {
      relativeTo: this.route,
    });
  }

  groupLabel(group: string): string {
    return getSystemSettingGroupLabel(group as any);
  }

  valueTypeLabel(valueType: string): string {
    return getSystemSettingValueTypeLabel(valueType as any);
  }

  valueLabel(setting: Parameters<typeof formatSystemSettingValue>[0]): string {
    return formatSystemSettingValue(setting);
  }

  isJsonValue(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  stringify(value: Record<string, unknown>): string {
    return JSON.stringify(value, null, 2);
  }
}
