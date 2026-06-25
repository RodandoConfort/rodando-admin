import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';

import { DynamicFormConfig } from '../../../shared/form/form.types';

function jsonObjectValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {
        invalidJsonObject: true,
      };
    }

    return null;
  } catch {
    return {
      invalidJson: true,
    };
  }
}

export const CREATE_CASH_COLLECTION_POINT_FORM_CONFIG: DynamicFormConfig = {
  columns: 2,

  submitLabel: 'Crear punto',
  submitLoadingLabel: 'Creando...',
  submitIcon: 'add_location_alt',
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
      key: 'location',
      title: 'Ubicación',
      description: 'Coordenadas opcionales en formato longitud/latitud.',
      columns: 2,
    },
    {
      key: 'settings',
      title: 'Configuración',
      columns: 1,
    },
  ],

  fields: [
    {
      key: 'name',
      label: 'Nombre',
      type: 'text',
      group: 'general',
      placeholder: 'Ej. Oficina Central',
      autocomplete: 'off',
      validators: [Validators.required, Validators.maxLength(120)],
    },
    {
      key: 'contactPhone',
      label: 'Teléfono de contacto',
      type: 'text',
      group: 'general',
      placeholder: 'Ej. +5355555555',
      validators: [Validators.maxLength(30)],
    },
    {
      key: 'address',
      label: 'Dirección',
      type: 'textarea',
      group: 'general',
      placeholder: 'Dirección física del punto de recaudo',
      rows: 4,
      validators: [Validators.maxLength(250)],
      fullWidth: true,
    },
    // {
    //   key: 'longitude',
    //   label: 'Longitud',
    //   type: 'number',
    //   group: 'location',
    //   placeholder: 'Ej. -82.3666',
    // },
    // {
    //   key: 'latitude',
    //   label: 'Latitud',
    //   type: 'number',
    //   group: 'location',
    //   placeholder: 'Ej. 23.1136',
    // },
    // {
    //   key: 'openingHoursJson',
    //   label: 'Horario de atención',
    //   type: 'textarea',
    //   group: 'settings',
    //   placeholder: '{ "monday": "08:00-17:00" }',
    //   hint: 'Opcional. Debe ser un objeto JSON válido.',
    //   validators: [
    //     jsonObjectValidator,
    //   ],
    //   fullWidth: true,
    // },
    {
      key: 'isActive',
      label: 'Estado',
      type: 'select',
      group: 'settings',
      defaultValue: true,
      validators: [Validators.required],
      options: [
        {
          label: 'Activo',
          value: true,
        },
        {
          label: 'Inactivo',
          value: false,
        },
      ],
    },
  ],
};

export const EDIT_CASH_COLLECTION_POINT_FORM_CONFIG: DynamicFormConfig = {
  ...CREATE_CASH_COLLECTION_POINT_FORM_CONFIG,
  submitLabel: 'Guardar cambios',
  submitLoadingLabel: 'Guardando...',
  submitIcon: 'save',
};
