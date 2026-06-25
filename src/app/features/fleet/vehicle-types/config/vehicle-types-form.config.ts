import { Validators } from '@angular/forms';

import { DynamicFormConfig } from '../../../../shared/form/form.types';
import { SelectOption } from '../data-access/vehicle-types.models';

export function buildCreateVehicleTypeFormConfig(
  categoryOptions: readonly SelectOption[],
  serviceClassOptions: readonly SelectOption[],
): DynamicFormConfig {
  return {
    layout: 'image-aside',
    columns: 1,

    submitLabel: 'Crear tipo',
    submitLoadingLabel: 'Creando...',
    submitIcon: 'add_circle',
    showCancel: true,
    cancelLabel: 'Cancelar',
    disableSubmitWhenInvalid: true,

    fields: [
      {
        key: 'iconUrl',
        label: 'Ícono del tipo',
        type: 'image',
        hint: 'Selecciona una imagen representativa para este tipo de vehículo.',
        accept: 'image/png,image/jpeg,image/webp',
      },
      {
        key: 'name',
        label: 'Nombre',
        type: 'text',
        placeholder: 'Ej. SUV Compacto',
        autocomplete: 'off',
        validators: [
          Validators.required,
          Validators.maxLength(100),
        ],
      },
      {
        key: 'categoryId',
        label: 'Categoría',
        type: 'select',
        placeholder: 'Selecciona una categoría',
        validators: [
          Validators.required,
        ],
        options: categoryOptions,
      },
      {
        key: 'serviceClassIds',
        label: 'Clases de servicio',
        type: 'select',
        multiple: true,
        placeholder: 'Selecciona una o varias clases',
        hint: 'Este tipo de vehículo podrá operar en las clases seleccionadas.',
        validators: [
          Validators.required,
        ],
        options: serviceClassOptions,
      },
      {
        key: 'description',
        label: 'Descripción',
        type: 'text',
        placeholder: 'Ej. SUV compacto con capacidad para 5 pasajeros',
        validators: [
          Validators.maxLength(500),
        ],
      },
      {
        key: 'defaultCapacity',
        label: 'Capacidad por defecto',
        type: 'number',
        placeholder: 'Ej. 4',
        validators: [
          Validators.required,
          Validators.min(1),
        ],
      },
      {
        key: 'baseFare',
        label: 'Tarifa base',
        type: 'number',
        placeholder: 'Ej. 3.50',
        validators: [
          Validators.required,
          Validators.min(0),
        ],
      },
      {
        key: 'costPerKm',
        label: 'Costo por kilómetro',
        type: 'number',
        placeholder: 'Ej. 1.25',
        validators: [
          Validators.required,
          Validators.min(0),
        ],
      },
      {
        key: 'costPerMinute',
        label: 'Costo por minuto',
        type: 'number',
        placeholder: 'Ej. 0.35',
        validators: [
          Validators.required,
          Validators.min(0),
        ],
      },
      {
        key: 'minFare',
        label: 'Tarifa mínima',
        type: 'number',
        placeholder: 'Ej. 5.00',
        validators: [
          Validators.required,
          Validators.min(0),
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
}

export function buildEditVehicleTypeFormConfig(
  categoryOptions: readonly SelectOption[],
  serviceClassOptions: readonly SelectOption[],
): DynamicFormConfig {
  return {
    ...buildCreateVehicleTypeFormConfig(categoryOptions, serviceClassOptions),
    submitLabel: 'Guardar cambios',
    submitLoadingLabel: 'Guardando...',
    submitIcon: 'save',
  };
}
