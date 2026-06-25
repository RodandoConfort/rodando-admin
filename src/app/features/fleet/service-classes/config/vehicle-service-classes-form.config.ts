import { Validators } from '@angular/forms';

import { DynamicFormConfig } from '../../../../shared/form/form.types';

export const CREATE_VEHICLE_SERVICE_CLASS_FORM_CONFIG: DynamicFormConfig = {
  layout: 'image-aside',
  columns: 1,

  submitLabel: 'Crear clase',
  submitLoadingLabel: 'Creando...',
  submitIcon: 'add_circle',
  showCancel: true,
  cancelLabel: 'Cancelar',
  disableSubmitWhenInvalid: true,

  fields: [
    {
      key: 'iconUrl',
      label: 'Ícono de la clase',
      type: 'image',
      hint: 'Selecciona una imagen representativa para esta clase de servicio.',
      accept: 'image/png,image/jpeg,image/webp',
    },
    {
      key: 'name',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Ej. Economy',
      autocomplete: 'off',
      validators: [
        Validators.required,
        Validators.maxLength(100),
      ],
    },
    {
      key: 'description',
      label: 'Descripción',
      type: 'text',
      placeholder: 'Ej. Opción económica para viajes diarios',
      validators: [
        Validators.maxLength(500),
      ],
    },
    {
      key: 'baseFareMultiplier',
      label: 'Multiplicador tarifa base',
      type: 'number',
      placeholder: 'Ej. 1.00',
      defaultValue: 1,
      validators: [
        Validators.required,
        Validators.min(0),
      ],
    },
    {
      key: 'costPerKmMultiplier',
      label: 'Multiplicador costo por km',
      type: 'number',
      placeholder: 'Ej. 1.00',
      defaultValue: 1,
      validators: [
        Validators.required,
        Validators.min(0),
      ],
    },
    {
      key: 'costPerMinuteMultiplier',
      label: 'Multiplicador costo por minuto',
      type: 'number',
      placeholder: 'Ej. 1.00',
      defaultValue: 1,
      validators: [
        Validators.required,
        Validators.min(0),
      ],
    },
    {
      key: 'minFareMultiplier',
      label: 'Multiplicador tarifa mínima',
      type: 'number',
      placeholder: 'Ej. 1.00',
      defaultValue: 1,
      validators: [
        Validators.required,
        Validators.min(0),
      ],
    },
    {
      key: 'minCapacity',
      label: 'Capacidad mínima',
      type: 'number',
      placeholder: 'Ej. 2',
      validators: [
        Validators.required,
        Validators.min(1),
      ],
    },
    {
      key: 'maxCapacity',
      label: 'Capacidad máxima',
      type: 'number',
      placeholder: 'Ej. 6',
      validators: [
        Validators.required,
        Validators.min(1),
      ],
    },
    {
      key: 'displayOrder',
      label: 'Orden de visualización',
      type: 'number',
      placeholder: 'Ej. 1',
      defaultValue: 1,
      validators: [
        Validators.required,
        Validators.min(1),
      ],
    },
    {
      key: 'isActive',
      label: 'Estado',
      type: 'select',
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
      defaultValue: true,
    },
  ],
};

export const EDIT_VEHICLE_SERVICE_CLASS_FORM_CONFIG: DynamicFormConfig = {
  ...CREATE_VEHICLE_SERVICE_CLASS_FORM_CONFIG,
  submitLabel: 'Guardar cambios',
  submitLoadingLabel: 'Guardando...',
  submitIcon: 'save',
};
