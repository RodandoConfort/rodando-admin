import { Validators } from '@angular/forms';

import { DynamicFormConfig } from '../../../../shared/form/form.types';

export const CREATE_VEHICLE_CATEGORY_FORM_CONFIG: DynamicFormConfig = {
  layout: 'image-aside',
  columns: 1,

  submitLabel: 'Crear categoría',
  submitLoadingLabel: 'Creando...',
  submitIcon: 'add_circle',
  showCancel: true,
  cancelLabel: 'Cancelar',
  disableSubmitWhenInvalid: true,

  fields: [
    {
      key: 'iconUrl',
      label: 'Ícono de la categoría',
      type: 'image',
      hint: 'Selecciona una imagen representativa para esta categoría.',
      accept: 'image/png,image/jpeg,image/webp',
    },
    {
      key: 'name',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Ej. Sedán',
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
      placeholder: 'Ej. Vehículos de tipo sedán de 4 puertas',
      validators: [
        Validators.maxLength(500),
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
    },
  ],
};

export const EDIT_VEHICLE_CATEGORY_FORM_CONFIG: DynamicFormConfig = {
  layout: 'image-aside',
  columns: 1,

  submitLabel: 'Guardar cambios',
  submitLoadingLabel: 'Guardando...',
  submitIcon: 'save',
  showCancel: true,
  cancelLabel: 'Cancelar',
  disableSubmitWhenInvalid: true,

  fields: [
    {
      key: 'iconUrl',
      label: 'Ícono de la categoría',
      type: 'image',
      hint: 'Puedes actualizar la imagen representativa de la categoría.',
      accept: 'image/png,image/jpeg,image/webp',
    },
    {
      key: 'name',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Ej. Sedán',
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
      placeholder: 'Ej. Vehículos de tipo sedán de 4 puertas',
      validators: [
        Validators.maxLength(500),
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
    },
  ],
};
