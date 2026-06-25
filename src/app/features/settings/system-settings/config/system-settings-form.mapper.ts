import { DynamicFormValue } from '../../../../shared/form/dynamic-form-builder';
import {
  CreateSystemSettingPayload,
  SystemSetting,
  SystemSettingFormValue,
  SystemSettingGroup,
  SystemSettingValueType,
  UpdateSystemSettingPayload,
} from '../data-access/system-settings.models';

export function mapSystemSettingToFormValue(
  setting?: SystemSetting | null,
): SystemSettingFormValue {
  if (!setting) {
    return {
      key: '',
      group: SystemSettingGroup.GENERAL,
      valueType: SystemSettingValueType.STRING,
      valueText: '',
      valueBoolean: false,
      description: null,
      active: true,
      isPublic: false,
      isSecret: false,
    };
  }

  return {
    key: setting.key,
    group: setting.group,
    valueType: setting.valueType,
    valueText:
      setting.valueType === SystemSettingValueType.JSON
        ? JSON.stringify(setting.value ?? {}, null, 2)
        : setting.valueType === SystemSettingValueType.BOOLEAN
          ? ''
          : String(setting.value ?? ''),
    valueBoolean:
      setting.valueType === SystemSettingValueType.BOOLEAN
        ? Boolean(setting.value)
        : false,
    description: setting.description ?? null,
    active: setting.active,
    isPublic: setting.isPublic,
    isSecret: setting.isSecret,
  };
}

export function mapSystemSettingFormToCreatePayload(
  formValue: DynamicFormValue,
): CreateSystemSettingPayload {
  const valueType = readValueType(formValue);

  return {
    key: readString(formValue, 'key').trim(),
    group: readGroup(formValue),
    valueType,
    value: parseSystemSettingValue(formValue, valueType),
    description: normalizeNullableText(formValue['description']),
    active: readBoolean(formValue, 'active', true),
    isPublic: readBoolean(formValue, 'isPublic', false),
    isSecret: readBoolean(formValue, 'isSecret', false),
  };
}

export function mapSystemSettingFormToUpdatePayload(
  formValue: DynamicFormValue,
): UpdateSystemSettingPayload {
  const valueType = readValueType(formValue);

  return {
    group: readGroup(formValue),
    valueType,
    value: parseSystemSettingValue(formValue, valueType),
    description: normalizeNullableText(formValue['description']),
    active: readBoolean(formValue, 'active', true),
    isPublic: readBoolean(formValue, 'isPublic', false),
    isSecret: readBoolean(formValue, 'isSecret', false),
  };
}

function parseSystemSettingValue(
  formValue: DynamicFormValue,
  valueType: SystemSettingValueType,
): unknown {
  const valueText = readString(formValue, 'valueText');

  if (valueType === SystemSettingValueType.STRING) {
    return valueText.trim();
  }

  if (valueType === SystemSettingValueType.NUMBER) {
    const numberValue = Number(valueText);

    if (!Number.isFinite(numberValue)) {
      throw new Error('El valor debe ser un número válido.');
    }

    return numberValue;
  }

  if (valueType === SystemSettingValueType.BOOLEAN) {
    return readBoolean(formValue, 'valueBoolean', false);
  }

  if (valueType === SystemSettingValueType.JSON) {
    try {
      const parsed = JSON.parse(valueText || '{}');

      if (
        parsed === null ||
        typeof parsed !== 'object' ||
        Array.isArray(parsed)
      ) {
        throw new Error();
      }

      return parsed;
    } catch {
      throw new Error('El valor JSON debe ser un objeto válido.');
    }
  }

  return valueText;
}

function readGroup(formValue: DynamicFormValue): SystemSettingGroup {
  const value = formValue['group'];

  if (
    value === SystemSettingGroup.GENERAL ||
    value === SystemSettingGroup.PRICING ||
    value === SystemSettingGroup.COMMISSION ||
    value === SystemSettingGroup.TRIPS ||
    value === SystemSettingGroup.PAYMENTS
  ) {
    return value;
  }

  return SystemSettingGroup.GENERAL;
}

function readValueType(formValue: DynamicFormValue): SystemSettingValueType {
  const value = formValue['valueType'];

  if (
    value === SystemSettingValueType.STRING ||
    value === SystemSettingValueType.NUMBER ||
    value === SystemSettingValueType.BOOLEAN ||
    value === SystemSettingValueType.JSON
  ) {
    return value;
  }

  return SystemSettingValueType.STRING;
}

function readString(
  formValue: DynamicFormValue,
  key: string,
  fallback = '',
): string {
  const value = formValue[key];

  return typeof value === 'string' ? value : fallback;
}

function readBoolean(
  formValue: DynamicFormValue,
  key: string,
  fallback: boolean,
): boolean {
  const value = formValue[key];

  return typeof value === 'boolean' ? value : fallback;
}

function normalizeNullableText(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();

  return normalized ? normalized : null;
}
