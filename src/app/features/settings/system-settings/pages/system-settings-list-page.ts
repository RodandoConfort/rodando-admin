import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SystemSettingsStore } from '../data-access/system-settings.store';
import { SystemSetting, SystemSettingGroup } from '../data-access/system-settings.models';
import { EntityPageCard } from '../../../../shared/components/entity-page-card/entity-page-card';
import { DataTable } from '../../../../shared/table/data-table/data-table';
import { EntityPageCardAction } from '../../../../shared/components/entity-page-card/entity-page-card.types';
import {
  DataTablePageChangeEvent,
  TableActionEvent,
  TableFilterChangeEvent,
} from '../../../../shared/table/table.types';
import { buildSystemSettingsTableConfig } from '../config/system-settings-table.config';

@Component({
  selector: 'app-system-settings-list-page',
  standalone: true,
  imports: [EntityPageCard, DataTable],
  template: `
    <app-entity-page-card
      title="Configuración del sistema"
      subtitle="Gestiona variables dinámicas como combustible, comisión, demanda y parámetros de viajes."
      icon="tune"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      @if (store.activeError(); as activeError) {
        <div class="system-settings-page__error" role="alert">
          {{ activeError }}
        </div>
      }

      <app-data-table
        [items]="store.settings()"
        [config]="tableConfig()"
        [loading]="store.listLoading()"
        [error]="store.listError()"
        (retry)="store.reloadSettings()"
        (create)="goToCreate()"
        (rowClick)="goToDetail($event)"
        (actionClick)="handleAction($event)"
        (searchChange)="store.searchSettings($event)"
        (filterChange)="handleFilterChange($event)"
        (pageChange)="handlePageChange($event)"
      />
    </app-entity-page-card>
  `,
  styles: `
    .system-settings-page__error {
      margin-bottom: 1.25rem;
      padding: 0.95rem 1rem;
      color: var(--app-danger);
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-lg);
      font-size: 0.9rem;
      font-weight: 750;
      line-height: 1.5;
    }

    html[data-theme='dark'] .system-settings-page__error {
      color: #fca5a5;
      background: rgb(220 38 38 / 12%);
      border-color: rgb(248 113 113 / 28%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemSettingsListPage {
  readonly store = inject(SystemSettingsStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly cardActions = computed<readonly EntityPageCardAction[]>(() => [
    {
      key: 'create',
      label: 'Nueva variable',
      icon: 'add',
      placement: 'header',
      variant: 'filled',
      tone: 'primary',
    },
  ]);

  readonly tableConfig = computed(() =>
    buildSystemSettingsTableConfig(
      this.store.query(),
      this.store.pagination(),
      this.store.activeSavingKey(),
    ),
  );

  private readonly enterPageEffect = effect(() => {
    this.store.enterSettingsList();
  });

  onCardAction(actionKey: string): void {
    if (actionKey === 'create') {
      this.goToCreate();
    }
  }

  goToCreate(): void {
    this.router.navigate(['create'], {
      relativeTo: this.route,
    });
  }

  goToDetail(setting: SystemSetting): void {
    this.router.navigate([setting.key], {
      relativeTo: this.route,
    });
  }

  goToEdit(setting: SystemSetting): void {
    this.router.navigate([setting.key, 'edit'], {
      relativeTo: this.route,
    });
  }

  handleAction(event: TableActionEvent<SystemSetting>): void {
    const { actionKey, item } = event;

    if (actionKey === 'detail') {
      this.goToDetail(item);
      return;
    }

    if (actionKey === 'edit') {
      this.goToEdit(item);
      return;
    }

    if (actionKey === 'toggle-active') {
      this.store.setSettingActive({
        key: item.key,
        active: !item.active,
      });
    }
  }

  handleFilterChange(event: TableFilterChangeEvent): void {
    if (event.key === 'group') {
      this.store.setGroupFilter(event.value as SystemSettingGroup | null);
      return;
    }

    if (event.key === 'active') {
      this.store.setActiveFilter(event.value as boolean | null);
      return;
    }

    if (event.key === 'isPublic') {
      this.store.setPublicFilter(event.value as boolean | null);
    }
  }

  handlePageChange(event: DataTablePageChangeEvent): void {
    this.store.setPage(event.pageIndex + 1, event.pageSize);
  }
}
