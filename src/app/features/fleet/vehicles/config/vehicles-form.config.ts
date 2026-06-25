import { Validators } from '@angular/forms';

import { DynamicFormConfig } from '../../../../shared/form/form.types';
import { SelectOption } from '../data-access/vehicles.models';

export function buildEditVehicleFormConfig(
  vehicleTypeOptions: readonly SelectOption[],
): DynamicFormConfig {
  return {
    columns: 2,

    submitLabel: 'Guardar cambios',
    submitLoadingLabel: 'Guardando...',
    submitIcon: 'save',
    showCancel: true,
    cancelLabel: 'Cancelar',
    disableSubmitWhenInvalid: true,

    groups: [
      {
        key: 'vehicle',
        title: 'Datos del vehículo',
        description: 'Información física e identificativa del vehículo.',
        columns: 2,
      },
      {
        key: 'operation',
        title: 'Operación',
        description: 'Estado administrativo y configuración operativa.',
        columns: 2,
      },
      {
        key: 'maintenance',
        title: 'Mantenimiento',
        description: 'Datos de inspección, kilometraje y mantenimiento.',
        columns: 2,
      },
    ],

    fields: [
      {
        key: 'vehicleTypeId',
        label: 'Tipo de vehículo',
        type: 'select',
        placeholder: 'Selecciona un tipo',
        group: 'vehicle',
        validators: [
          Validators.required,
        ],
        options: vehicleTypeOptions,
      },
      {
        key: 'make',
        label: 'Marca',
        type: 'text',
        placeholder: 'Ej. Toyota',
        group: 'vehicle',
        validators: [
          Validators.required,
          Validators.maxLength(50),
        ],
      },
      {
        key: 'model',
        label: 'Modelo',
        type: 'text',
        placeholder: 'Ej. Corolla',
        group: 'vehicle',
        validators: [
          Validators.required,
          Validators.maxLength(50),
        ],
      },
      {
        key: 'year',
        label: 'Año',
        type: 'number',
        placeholder: 'Ej. 2020',
        group: 'vehicle',
        validators: [
          Validators.required,
          Validators.min(1900),
        ],
      },
      {
        key: 'plateNumber',
        label: 'Placa',
        type: 'text',
        placeholder: 'Ej. ABC123',
        group: 'vehicle',
        validators: [
          Validators.required,
          Validators.maxLength(15),
        ],
      },
      {
        key: 'color',
        label: 'Color',
        type: 'text',
        placeholder: 'Ej. Rojo',
        group: 'vehicle',
        validators: [
          Validators.maxLength(30),
        ],
      },
      {
        key: 'capacity',
        label: 'Capacidad',
        type: 'number',
        placeholder: 'Ej. 4',
        group: 'operation',
        validators: [
          Validators.required,
          Validators.min(1),
        ],
      },
      {
        key: 'status',
        label: 'Estado',
        type: 'select',
        group: 'operation',
        validators: [
          Validators.required,
        ],
        options: [
          {
            label: 'Pendiente de revisión',
            value: 'pending_review',
          },
          {
            label: 'Aprobado',
            value: 'approved',
          },
          {
            label: 'En servicio',
            value: 'in_service',
          },
          {
            label: 'Rechazado',
            value: 'rejected',
          },
          {
            label: 'Mantenimiento',
            value: 'maintenance',
          },
          {
            label: 'No disponible',
            value: 'unavailable',
          },
        ],
      },
      {
        key: 'isActive',
        label: 'Activo',
        type: 'select',
        group: 'operation',
        validators: [
          Validators.required,
        ],
        options: [
          {
            label: 'Sí',
            value: true,
          },
          {
            label: 'No',
            value: false,
          },
        ],
      },
      {
        key: 'inspectionDate',
        label: 'Fecha de inspección',
        type: 'date',
        group: 'maintenance',
      },
      {
        key: 'lastMaintenanceDate',
        label: 'Último mantenimiento',
        type: 'date',
        group: 'maintenance',
      },
      {
        key: 'mileage',
        label: 'Kilometraje',
        type: 'number',
        placeholder: 'Ej. 30000',
        group: 'maintenance',
        validators: [
          Validators.min(0),
        ],
      },
    ],
  };
}
