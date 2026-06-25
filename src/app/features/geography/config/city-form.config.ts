import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';

import { DynamicFormConfig } from '../../../shared/form/form.types';

export function jsonMultiPolygonValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const value = control.value;

  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);

    if (
      parsed?.type !== 'MultiPolygon' ||
      !Array.isArray(parsed.coordinates)
    ) {
      return {
        invalidMultiPolygon: true,
      };
    }

    return null;
  } catch {
    return {
      invalidJson: true,
    };
  }
}

export const CREATE_CITY_FORM_CONFIG: DynamicFormConfig = {
  columns: 2,

  submitLabel: 'Crear ciudad',
  submitLoadingLabel: 'Creando...',
  submitIcon: 'location_city',
  showCancel: true,
  cancelLabel: 'Cancelar',
  disableSubmitWhenInvalid: true,

  groups: [
    {
      key: 'general',
      title: 'Datos generales',
      columns: 2,
    },
    {
      key: 'advanced',
      title: 'Configuración avanzada',
      description: 'La geometría es opcional. Puedes dejarla vacía y agregarla más adelante.',
      columns: 1,
    },
  ],

  fields: [
    {
      key: 'name',
      label: 'Nombre',
      type: 'text',
      group: 'general',
      placeholder: 'Ej. Santiago de Cuba',
      validators: [
        Validators.required,
        Validators.maxLength(120),
      ],
    },
    {
      key: 'countryCode',
      label: 'País',
      type: 'text',
      group: 'general',
      placeholder: 'CU',
      defaultValue: 'CU',
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(2),
      ],
    },
    {
      key: 'timezone',
      label: 'Zona horaria',
      type: 'text',
      group: 'general',
      placeholder: 'America/Havana',
      defaultValue: 'America/Havana',
      validators: [
        Validators.required,
        Validators.maxLength(80),
      ],
    },
    {
      key: 'active',
      label: 'Estado',
      type: 'select',
      group: 'general',
      defaultValue: true,
      validators: [
        Validators.required,
      ],
      options: [
        {
          label: 'Activa',
          value: true,
        },
        {
          label: 'Inactiva',
          value: false,
        },
      ],
    },
    {
      key: 'geomJson',
      label: 'Geometría GeoJSON',
      type: 'textarea',
      group: 'advanced',
      placeholder: '{ "type": "MultiPolygon", "coordinates": [...] }',
      rows: 6,
      fullWidth: true,
      validators: [
        jsonMultiPolygonValidator,
      ],
    },
  ],
};

export const EDIT_CITY_FORM_CONFIG: DynamicFormConfig = {
  ...CREATE_CITY_FORM_CONFIG,
  submitLabel: 'Guardar cambios',
  submitLoadingLabel: 'Guardando...',
  submitIcon: 'save',
};
