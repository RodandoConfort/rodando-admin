import { PaginationMeta } from '../../../../core/api/pagination.model';

import {
  formatSystemSettingValue,
  getSystemSettingGroupLabel,
  getSystemSettingValueTypeLabel,
  SYSTEM_SETTING_GROUP_OPTIONS,
  SystemSetting,
  SystemSettingsQuery,
} from '../data-access/system-settings.models';

export function buildSystemSettingsTableConfig(
  query: SystemSettingsQuery,
  pagination: PaginationMeta,
  activeSavingKey: string | null,
) {
  return {
    search: {
      enabled: true,
      placeholder: 'Buscar por clave o descripción...',
      value: query.search ?? '',
    },
    filters: [
      {
        key: 'group',
        label: 'Grupo',
        type: 'select',
        value: query.group ?? null,
        options: [
          {
            label: 'Todos',
            value: null,
          },
          ...SYSTEM_SETTING_GROUP_OPTIONS,
        ],
      },
      {
        key: 'active',
        label: 'Estado',
        type: 'select',
        value: query.active ?? null,
        options: [
          {
            label: 'Todos',
            value: null,
          },
          {
            label: 'Activos',
            value: true,
          },
          {
            label: 'Inactivos',
            value: false,
          },
        ],
      },
      {
        key: 'isPublic',
        label: 'Visibilidad',
        type: 'select',
        value: query.isPublic ?? null,
        options: [
          {
            label: 'Todas',
            value: null,
          },
          {
            label: 'Públicas',
            value: true,
          },
          {
            label: 'Privadas',
            value: false,
          },
        ],
      },
    ],
    columns: [
      {
        key: 'key',
        label: 'Clave',
        value: (row: SystemSetting) => row.key,
      },
      {
        key: 'group',
        label: 'Grupo',
        value: (row: SystemSetting) => getSystemSettingGroupLabel(row.group),
      },
      {
        key: 'valueType',
        label: 'Tipo',
        value: (row: SystemSetting) =>
          getSystemSettingValueTypeLabel(row.valueType),
      },
      {
        key: 'value',
        label: 'Valor',
        value: (row: SystemSetting) => formatSystemSettingValue(row),
      },
      {
        key: 'active',
        label: 'Activo',
        type: 'boolean',
        value: (row: SystemSetting) => row.active,
      },
      {
        key: 'isPublic',
        label: 'Público',
        type: 'boolean',
        value: (row: SystemSetting) => row.isPublic,
      },
      {
        key: 'isSecret',
        label: 'Secreto',
        type: 'boolean',
        value: (row: SystemSetting) => row.isSecret,
      },
    ],
    actions: [
      {
        key: 'detail',
        label: 'Ver detalle',
        icon: 'visibility',
      },
      {
        key: 'edit',
        label: 'Editar',
        icon: 'edit',
      },
      {
        key: 'toggle-active',
        label: 'Activar/desactivar',
        icon: 'power_settings_new',
        disabled: (row: SystemSetting) => activeSavingKey === row.key,
      },
    ],
    pagination,
    emptyState: {
      icon: 'tune',
      title: 'No hay configuraciones',
      description: 'No se encontraron variables del sistema con esos filtros.',
    },
    createButtonLabel: 'Nueva variable',
  } as any;
}
