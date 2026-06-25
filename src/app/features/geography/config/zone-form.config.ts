import { Validators } from '@angular/forms';

import {
  DynamicFormConfig,
  DynamicSelectOption,
} from '../../../shared/form/form.types';
import { jsonMultiPolygonValidator } from './city-form.config';

export function buildCreateZoneFormConfig(
  cityOptions: readonly DynamicSelectOption<string>[],
): DynamicFormConfig {
  return {
    columns: 2,

    submitLabel: 'Crear zona',
    submitLoadingLabel: 'Creando...',
    submitIcon: 'map',
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
        key: 'geometry',
        title: 'Geometría',
        description: 'La zona requiere un GeoJSON MultiPolygon válido.',
        columns: 1,
      },
    ],

    fields: [
      {
        key: 'cityId',
        label: 'Ciudad',
        type: 'select',
        group: 'general',
        placeholder: 'Selecciona una ciudad',
        validators: [
          Validators.required,
        ],
        options: cityOptions,
      },
      {
        key: 'name',
        label: 'Nombre',
        type: 'text',
        group: 'general',
        placeholder: 'Ej. Centro',
        validators: [
          Validators.required,
          Validators.maxLength(120),
        ],
      },
      {
        key: 'kind',
        label: 'Tipo',
        type: 'text',
        group: 'general',
        placeholder: 'Ej. urbana, aeropuerto, premium',
        validators: [
          Validators.maxLength(60),
        ],
      },
      {
        key: 'priority',
        label: 'Prioridad',
        type: 'number',
        group: 'general',
        defaultValue: 100,
        validators: [
          Validators.required,
          Validators.min(0),
          Validators.max(100000),
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
        group: 'geometry',
        placeholder: '{ "type": "MultiPolygon", "coordinates": [...] }',
        rows: 7,
        fullWidth: true,
        validators: [
          Validators.required,
          jsonMultiPolygonValidator,
        ],
      },
    ],
  };
}

export const EDIT_ZONE_FORM_CONFIG: DynamicFormConfig = {
  columns: 2,

  submitLabel: 'Guardar cambios',
  submitLoadingLabel: 'Guardando...',
  submitIcon: 'save',
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
      key: 'geometry',
      title: 'Geometría',
      description: 'Deja este campo vacío si no quieres modificar la geometría.',
      columns: 1,
    },
  ],

  fields: [
    {
      key: 'name',
      label: 'Nombre',
      type: 'text',
      group: 'general',
      validators: [
        Validators.required,
        Validators.maxLength(120),
      ],
    },
    {
      key: 'kind',
      label: 'Tipo',
      type: 'text',
      group: 'general',
      validators: [
        Validators.maxLength(60),
      ],
    },
    {
      key: 'priority',
      label: 'Prioridad',
      type: 'number',
      group: 'general',
      validators: [
        Validators.required,
        Validators.min(0),
        Validators.max(100000),
      ],
    },
    {
      key: 'active',
      label: 'Estado',
      type: 'select',
      group: 'general',
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
      group: 'geometry',
      rows: 7,
      fullWidth: true,
      validators: [
        jsonMultiPolygonValidator,
      ],
    },
  ],
};
