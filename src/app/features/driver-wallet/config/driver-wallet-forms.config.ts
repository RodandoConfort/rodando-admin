import { Validators } from '@angular/forms';

import { DynamicFormConfig, DynamicSelectOption } from '../../../shared/form/form.types';

export function buildDriverWalletTopupFormConfig(
  collectionPointOptions: readonly DynamicSelectOption<string>[],
  collectorOptions: readonly DynamicSelectOption<string>[],
): DynamicFormConfig {
  return {
    columns: 2,

    submitLabel: 'Recargar wallet',
    submitLoadingLabel: 'Recargando...',
    submitIcon: 'payments',
    showCancel: true,
    cancelLabel: 'Cancelar',
    disableSubmitWhenInvalid: true,

    fields: [
      {
        key: 'amount',
        label: 'Importe',
        type: 'number',
        placeholder: 'Ej. 150.00',
        validators: [Validators.required, Validators.min(0.01)],
      },
      {
        key: 'currency',
        label: 'Moneda',
        type: 'select',
        defaultValue: 'CUP',
        validators: [Validators.required],
        options: [
          {
            label: 'CUP',
            value: 'CUP',
          },
        ],
      },
      {
        key: 'collectionPointId',
        label: 'Punto de recaudo',
        type: 'select',
        placeholder: 'Selecciona el punto de recaudo',
        validators: [Validators.required],
        options: collectionPointOptions,
      },
      {
        key: 'collectedByUserId',
        label: 'Operador que recibe',
        type: 'select',
        placeholder: 'Selecciona el operador',
        validators: [Validators.required],
        options: collectorOptions,
      },
      {
        key: 'reason',
        label: 'Motivo',
        type: 'text',
        defaultValue: 'Recarga manual desde panel administrativo',
        validators: [Validators.maxLength(250)],
      },
      {
        key: 'externalReference',
        label: 'Referencia externa',
        type: 'text',
        placeholder: 'Ej. RC-000123',
        validators: [Validators.maxLength(200)],
      },
      {
        key: 'notes',
        label: 'Notas internas',
        type: 'textarea',
        placeholder: 'Notas opcionales de la operación',
        rows: 3,
        fullWidth: true,
        validators: [Validators.maxLength(500)],
      },
    ],
  };
}

export const DRIVER_WALLET_BLOCK_FORM_CONFIG: DynamicFormConfig = {
  columns: 1,

  submitLabel: 'Bloquear wallet',
  submitLoadingLabel: 'Bloqueando...',
  submitIcon: 'lock',
  showCancel: true,
  cancelLabel: 'Cancelar',
  disableSubmitWhenInvalid: false,

  fields: [
    {
      key: 'reason',
      label: 'Motivo del bloqueo',
      type: 'text',
      placeholder: 'Ej. Sospecha de fraude en transacción',
      validators: [Validators.maxLength(250)],
    },
    {
      key: 'comment',
      label: 'Comentario',
      type: 'textarea',
      placeholder: 'Comentario adicional para auditoría',
      validators: [Validators.maxLength(500)],
    },
  ],
};
