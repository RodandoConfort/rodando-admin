import {
  SYSTEM_SETTING_GROUP_OPTIONS,
  SYSTEM_SETTING_VALUE_TYPE_OPTIONS,
  SystemSettingGroup,
  SystemSettingValueType,
} from '../data-access/system-settings.models';

export const SYSTEM_SETTING_FORM_FIELDS = [
  {
    key: 'key',
    label: 'Clave',
    type: 'text',
    placeholder: 'pricing.fuel.current_price',
    required: true,
    maxLength: 120,
    fullWidth: true,
  },
  {
    key: 'group',
    label: 'Grupo',
    type: 'select',
    required: true,
    options: SYSTEM_SETTING_GROUP_OPTIONS,
    defaultValue: SystemSettingGroup.GENERAL,
  },
  {
    key: 'valueType',
    label: 'Tipo de valor',
    type: 'select',
    required: true,
    options: SYSTEM_SETTING_VALUE_TYPE_OPTIONS,
    defaultValue: SystemSettingValueType.STRING,
  },
  {
    key: 'valueText',
    label: 'Valor',
    type: 'textarea',
    required: true,
    rows: 6,
    fullWidth: true,
    placeholder: 'Para JSON escribe un objeto válido. Ej: { "enabled": true }',
  },
  {
    key: 'valueBoolean',
    label: 'Valor booleano',
    type: 'checkbox',
    defaultValue: false,
  },
  {
    key: 'description',
    label: 'Descripción',
    type: 'textarea',
    rows: 3,
    maxLength: 300,
    fullWidth: true,
  },
  {
    key: 'active',
    label: 'Activo',
    type: 'checkbox',
    defaultValue: true,
  },
  {
    key: 'isPublic',
    label: 'Público',
    type: 'checkbox',
    defaultValue: false,
  },
  {
    key: 'isSecret',
    label: 'Secreto',
    type: 'checkbox',
    defaultValue: false,
  },
] as const;

export const CREATE_SYSTEM_SETTING_FORM_CONFIG = {
  fields: SYSTEM_SETTING_FORM_FIELDS,
  submitLabel: 'Crear configuración',
  cancelLabel: 'Cancelar',
} as any;

export const EDIT_SYSTEM_SETTING_FORM_CONFIG = {
  fields: SYSTEM_SETTING_FORM_FIELDS.map((field) =>
    field.key === 'key'
      ? {
          ...field,
          disabled: true,
        }
      : field,
  ),
  submitLabel: 'Guardar cambios',
  cancelLabel: 'Cancelar',
} as any;
