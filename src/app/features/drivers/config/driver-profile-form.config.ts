import { Validators } from '@angular/forms';

import { DynamicFormConfig } from '../../../shared/form/form.types';

export const EDIT_DRIVER_PROFILE_FORM_CONFIG: DynamicFormConfig = {
  columns: 2,

  submitLabel: 'Guardar cambios',
  submitLoadingLabel: 'Guardando...',
  submitIcon: 'save',
  showCancel: true,
  cancelLabel: 'Cancelar',
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
      validators: [
        Validators.required,
        Validators.maxLength(50),
      ],
    },
    {
      key: 'driverLicenseExpirationDate',
      label: 'Vencimiento de licencia',
      type: 'date',
      group: 'license',
      validators: [
        Validators.required,
      ],
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
      validators: [
        Validators.required,
      ],
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
    },

    {
      key: 'driverStatus',
      label: 'Estado del conductor',
      type: 'select',
      group: 'status',
      validators: [
        Validators.required,
      ],
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
      validators: [
        Validators.maxLength(100),
      ],
    },
    {
      key: 'emergencyContactPhoneNumber',
      label: 'Teléfono del contacto',
      type: 'text',
      group: 'emergency-contact',
      prefixText: '+53',
      placeholder: '50000000',
      validators: [
        Validators.maxLength(20),
      ],
    },
    {
      key: 'emergencyContactRelationship',
      label: 'Relación',
      type: 'select',
      group: 'emergency-contact',
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
