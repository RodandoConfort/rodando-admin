import { Validators } from '@angular/forms';

import { DynamicFormConfig } from '../../../shared/form/form.types';
import { SelectOption } from '../data-access/drivers.models';

export const CREATE_DRIVER_PROFILE_FORM_CONFIG: DynamicFormConfig = {
  columns: 2,
  submitLabel: 'Guardar y continuar',
  submitLoadingLabel: 'Procesando...',
  submitIcon: 'arrow_forward',
  showCancel: false,
  disableSubmitWhenInvalid: true,

  groups: [
    {
      key: 'license',
      title: 'Licencia del conductor',
      description: 'Datos principales de la licencia y su documentación.',
      layout: 'media-right',
      columns: 1,
    },
    {
      key: 'verification',
      title: 'Verificación y aprobación',
      description: 'Estado interno de revisión del conductor.',
      layout: 'checkbox-right',
      columns: 1,
    },
    {
      key: 'status',
      title: 'Estado operativo',
      description: 'Configuración administrativa del conductor.',
      columns: 2,
    },
    {
      key: 'emergency-contact',
      title: 'Información de contacto',
      description: 'Persona de contacto en caso de emergencia.',
      columns: 2,
    },
  ],

  fields: [
    {
      key: 'driverLicenseNumber',
      label: 'Número de licencia',
      type: 'text',
      group: 'license',
      validators: [Validators.required, Validators.maxLength(50)],
    },
    {
      key: 'driverLicenseExpirationDate',
      label: 'Vencimiento de licencia',
      type: 'date',
      group: 'license',
      validators: [Validators.required],
    },
    {
      key: 'driverLicensePictureUrl',
      label: 'Foto de la licencia',
      type: 'image',
      group: 'license',
      hint: 'Sube una foto clara de la licencia del conductor.',
      accept: 'image/png,image/jpeg,image/webp',
    },

    {
      key: 'backgroundCheckStatus',
      label: 'Estado del background check',
      type: 'select',
      group: 'verification',
      defaultValue: 'pending_background_check',
      options: [
        {
          label: 'Pendiente',
          value: 'pending_background_check',
        },
        {
          label: 'Aprobado',
          value: 'approved',
        },
        {
          label: 'Rechazado',
          value: 'rejected',
        },
      ],
    },
    {
      key: 'backgroundCheckDate',
      label: 'Fecha del background check',
      type: 'date',
      group: 'verification',
    },
    {
      key: 'isApproved',
      label: 'Conductor aprobado',
      type: 'checkbox',
      group: 'verification',
      hint: 'Marca esta opción si el conductor ya está aprobado internamente.',
      defaultValue: false,
    },

    {
      key: 'driverStatus',
      label: 'Estado del conductor',
      type: 'select',
      group: 'status',
      defaultValue: 'pending_docs',
      options: [
        {
          label: 'Pendiente de documentos',
          value: 'pending_docs',
        },
        {
          label: 'Activo',
          value: 'active',
        },
        {
          label: 'Suspendido',
          value: 'suspended',
        },
        {
          label: 'De vacaciones',
          value: 'on_vacation',
        },
        {
          label: 'Desactivado',
          value: 'deactivated',
        },
      ],
    },
    {
      key: 'paidPriorityUntil',
      label: 'Prioridad pagada hasta',
      type: 'date',
      group: 'status',
    },

    {
      key: 'emergencyContactName',
      label: 'Nombre del contacto',
      type: 'text',
      group: 'emergency-contact',
      validators: [Validators.required, Validators.maxLength(100)],
    },
    {
      key: 'emergencyContactPhoneNumber',
      label: 'Teléfono del contacto',
      type: 'text',
      group: 'emergency-contact',
      prefixText: '+53',
      placeholder: '50000000',
      validators: [Validators.required, Validators.maxLength(20)],
    },
    {
      key: 'emergencyContactRelationship',
      label: 'Relación',
      type: 'select',
      group: 'emergency-contact',
      validators: [Validators.required],
      options: [
        {
          label: 'Cónyuge',
          value: 'Cónyuge',
        },
        {
          label: 'Familiar',
          value: 'Familiar',
        },
        {
          label: 'Amigo',
          value: 'Amigo',
        },
        {
          label: 'Otro',
          value: 'Otro',
        },
      ],
    },
  ],
};

export function buildDriverVehicleFormConfig(
  vehicleTypeOptions: readonly SelectOption[],
): DynamicFormConfig {
  return {
    columns: 2,
    submitLabel: 'Guardar y continuar',
    submitLoadingLabel: 'Procesando...',
    submitIcon: 'arrow_forward',
    showCancel: false,
    disableSubmitWhenInvalid: true,

    fields: [
      {
        key: 'vehicleTypeId',
        label: 'Tipo de vehículo',
        type: 'select',
        validators: [Validators.required],
        options: vehicleTypeOptions.map((option) => ({
          label: option.label,
          value: option.value,
        })),
      },
      {
        key: 'plateNumber',
        label: 'Matrícula',
        type: 'text',
        validators: [Validators.required, Validators.maxLength(15)],
      },
      {
        key: 'make',
        label: 'Marca',
        type: 'text',
        validators: [Validators.required, Validators.maxLength(50)],
      },
      {
        key: 'model',
        label: 'Modelo',
        type: 'text',
        validators: [Validators.required, Validators.maxLength(50)],
      },
      {
        key: 'color',
        label: 'Color',
        type: 'text',
        validators: [Validators.maxLength(30)],
      },
      {
        key: 'year',
        label: 'Año',
        type: 'number',
        placeholder: 'Ej. 2022',
        validators: [
          Validators.required,
          Validators.min(1900),
          Validators.max(new Date().getFullYear() + 1),
        ],
      },
      {
        key: 'capacity',
        label: 'Capacidad',
        type: 'number',
        placeholder: 'Ej. 4',
        validators: [Validators.min(1), Validators.max(99)],
      },
      {
        key: 'mileage',
        label: 'Kilometraje',
        type: 'number',
        placeholder: 'Ej. 25000',
        validators: [Validators.min(0)],
      },
      {
        key: 'status',
        label: 'Estado del vehículo',
        type: 'select',
        defaultValue: 'pending_review',
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
        label: 'Vehículo activo',
        type: 'checkbox',
        defaultValue: true,
      },
      {
        key: 'inspectionDate',
        label: 'Fecha de inspección',
        type: 'date',
      },
      {
        key: 'lastMaintenanceDate',
        label: 'Último mantenimiento',
        type: 'date',
      },
    ],
  };
}
