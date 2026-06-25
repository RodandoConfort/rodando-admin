import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { SelectField } from '../../../shared/form/fields/select-field/select-field';
import { DynamicFieldConfig } from '../../../shared/form/form.types';

import {
  AdminCancelTripPayload,
  AdminOverrideTripStatusPayload,
  AdminSendTripMessagePayload,
  AdminTrip,
  AdminTripMessageTarget,
  AdminTripStatus,
} from '../data-access/admin-trips.models';

@Component({
  selector: 'app-admin-trip-actions-panel',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    SelectField,
  ],
  template: `
    <section class="admin-trip-actions">
      <header class="admin-trip-actions__header">
        <h3>Acciones administrativas</h3>
        <p>
          Corrige fases del viaje solo ante incidencias operativas o errores de la app.
        </p>
      </header>

      @if (actionError(); as error) {
        <div class="admin-trip-actions__error" role="alert">
          {{ error }}
        </div>
      }

      @if (actionSuccess(); as success) {
        <div class="admin-trip-actions__success" role="status">
          {{ success }}
        </div>
      }

      <div class="admin-trip-actions__section">
        <h4>Corregir estado del viaje</h4>

        <app-select-field
          [field]="targetStatusField()"
          [control]="targetStatusControl"
        />

        <mat-form-field appearance="outline">
          <mat-label>Motivo</mat-label>
          <textarea
            matInput
            rows="3"
            [value]="reason()"
            (input)="reason.set($any($event.target).value)"
            placeholder="Ej. El driver reportó que el viaje terminó pero la app no lo cerró."
          ></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nota interna</mat-label>
          <textarea
            matInput
            rows="2"
            [value]="internalNote()"
            (input)="internalNote.set($any($event.target).value)"
            placeholder="Opcional, visible solo para auditoría interna."
          ></textarea>
        </mat-form-field>

        <!-- @if (targetStatusControl.value === 'completed') {
          <div class="admin-trip-actions__completion-grid">
            <mat-form-field appearance="outline">
              <mat-label>Distancia real km</mat-label>
              <input
                matInput
                type="number"
                min="0"
                [value]="actualDistanceKm() ?? ''"
                (input)="actualDistanceKm.set(toOptionalNumber($any($event.target).value))"
              />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Duración real min</mat-label>
              <input
                matInput
                type="number"
                min="0"
                [value]="actualDurationMin() ?? ''"
                (input)="actualDurationMin.set(toOptionalNumber($any($event.target).value))"
              />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Tarifa final</mat-label>
              <input
                matInput
                type="number"
                min="0"
                [value]="fareTotal() ?? ''"
                (input)="fareTotal.set(toOptionalNumber($any($event.target).value))"
              />
            </mat-form-field>
          </div>
        } -->

        <div class="admin-trip-actions__buttons">
          <button
            mat-flat-button
            type="button"
            [disabled]="!canOverrideStatus() || actionLoading()"
            (click)="overrideStatus.emit(buildOverridePayload())"
          >
            <mat-icon>published_with_changes</mat-icon>
            Aplicar corrección
          </button>

          <button
            mat-stroked-button
            type="button"
            class="admin-trip-actions__danger"
            [disabled]="!canCancel() || actionLoading()"
            (click)="cancelTrip.emit(buildCancelPayload())"
          >
            <mat-icon>cancel</mat-icon>
            Cancelar viaje
          </button>
        </div>
      </div>

      <div class="admin-trip-actions__section">
        <h4>Mensaje operacional</h4>

        <mat-form-field appearance="outline">
          <mat-label>Mensaje para pasajero/driver</mat-label>
          <textarea
            matInput
            rows="3"
            [value]="message()"
            (input)="message.set($any($event.target).value)"
            placeholder="Escribe un mensaje operacional..."
          ></textarea>
        </mat-form-field>

        <app-select-field
          [field]="messageTargetField"
          [control]="messageTargetControl"
        />

        <button
          mat-flat-button
          type="button"
          [disabled]="!canSendMessage() || actionLoading()"
          (click)="sendMessage.emit(buildMessagePayload())"
        >
          <mat-icon>send</mat-icon>
          Enviar mensaje
        </button>
      </div>
    </section>
  `,
  styles: `
    .admin-trip-actions {
      display: grid;
      gap: 1.1rem;
      padding: 1.25rem;
      border: 1px solid var(--app-border);
      border-radius: var(--radius-lg);
      background: var(--app-surface);
    }

    .admin-trip-actions__header,
    .admin-trip-actions__section {
      display: grid;
      gap: 0.85rem;
    }

    .admin-trip-actions__header h3,
    .admin-trip-actions__section h4 {
      margin: 0;
      color: var(--app-text);
      font-size: 1rem;
      font-weight: 850;
      letter-spacing: -0.02em;
    }

    .admin-trip-actions__header p {
      margin: 0;
      color: var(--app-muted);
      font-size: 0.9rem;
      font-weight: 600;
      line-height: 1.5;
    }

    .admin-trip-actions mat-form-field,
    .admin-trip-actions app-select-field {
      width: 100%;
    }

    .admin-trip-actions textarea {
      resize: vertical;
      min-height: 84px;
    }

    .admin-trip-actions__completion-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.75rem;
    }

    .admin-trip-actions__buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--app-border);
    }

    .admin-trip-actions__buttons button,
    .admin-trip-actions__section > button {
      min-height: 44px;
      border-radius: var(--radius-lg);
      font-weight: 800;
    }

    .admin-trip-actions__danger {
      color: var(--app-danger);
      border-color: color-mix(in srgb, var(--app-danger) 45%, transparent);
    }

    .admin-trip-actions__error,
    .admin-trip-actions__success {
      padding: 0.9rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.9rem;
      font-weight: 750;
      line-height: 1.45;
    }

    .admin-trip-actions__error {
      color: var(--app-danger);
      background: #fef2f2;
      border: 1px solid #fecaca;
    }

    .admin-trip-actions__success {
      color: #166534;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
    }

    html[data-theme='dark'] .admin-trip-actions__error {
      color: #fca5a5;
      background: rgb(220 38 38 / 12%);
      border-color: rgb(248 113 113 / 28%);
    }

    html[data-theme='dark'] .admin-trip-actions__success {
      color: #86efac;
      background: rgb(22 163 74 / 12%);
      border-color: rgb(74 222 128 / 28%);
    }

    @media (max-width: 760px) {
      .admin-trip-actions__completion-grid {
        grid-template-columns: 1fr;
      }

      .admin-trip-actions__buttons {
        display: grid;
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminTripActionsPanel {
  readonly trip = input.required<AdminTrip>();
  readonly actionLoading = input(false);
  readonly actionError = input<string | null>(null);
  readonly actionSuccess = input<string | null>(null);

  readonly overrideStatus = output<AdminOverrideTripStatusPayload>();
  readonly cancelTrip = output<AdminCancelTripPayload>();
  readonly sendMessage = output<AdminSendTripMessagePayload>();

  readonly reason = signal('');
  readonly internalNote = signal('');
  readonly message = signal('');

  readonly actualDistanceKm = signal<number | null>(null);
  readonly actualDurationMin = signal<number | null>(null);
  readonly fareTotal = signal<number | null>(null);

  readonly targetStatusControl = new FormControl<AdminTripStatus>('completed', {
    nonNullable: true,
  });

  readonly messageTargetControl = new FormControl<AdminTripMessageTarget>(
    'passenger',
    {
      nonNullable: true,
    },
  );

  readonly targetStatusField = computed<DynamicFieldConfig<AdminTripStatus>>(
    () => ({
      key: 'targetStatus',
      label: 'Estado objetivo',
      type: 'select',
      placeholder: 'Selecciona el estado',
      options: this.buildTargetStatusOptions(),
    }),
  );

  readonly messageTargetField: DynamicFieldConfig<AdminTripMessageTarget> = {
    key: 'target',
    label: 'Destino',
    type: 'select',
    placeholder: 'Selecciona el destino',
    options: [
      { label: 'Pasajero', value: 'passenger' },
      { label: 'Driver', value: 'driver' },
      { label: 'Ambos', value: 'both' },
    ],
  };

  readonly canOverrideStatus = computed(() => {
    const targetStatus = this.targetStatusControl.value;
    const trip = this.trip();

    if (this.reason().trim().length < 3) {
      return false;
    }

    if (targetStatus === trip.currentStatus) {
      return false;
    }

    if (
      ['arriving', 'in_progress', 'completed'].includes(targetStatus) &&
      !trip.driverId
    ) {
      return false;
    }

    if (targetStatus === 'no_drivers_found' && trip.driverId) {
      return false;
    }

    return !['completed', 'cancelled'].includes(trip.currentStatus);
  });

  readonly canCancel = computed(
    () =>
      ['pending', 'assigning', 'accepted', 'arriving', 'in_progress'].includes(
        this.trip().currentStatus,
      ) && this.reason().trim().length >= 3,
  );

  readonly canSendMessage = computed(() => {
    const target = this.messageTargetControl.value;
    const trip = this.trip();

    if (this.message().trim().length < 3) {
      return false;
    }

    if (target === 'driver') {
      return Boolean(trip.driverId);
    }

    if (target === 'both') {
      return Boolean(trip.passengerId && trip.driverId);
    }

    return Boolean(trip.passengerId);
  });

  buildOverridePayload(): AdminOverrideTripStatusPayload {
    const targetStatus = this.targetStatusControl.value;

    return {
      targetStatus,
      reason: this.reason().trim(),
      internalNote: this.cleanOptional(this.internalNote()),
      actualDistanceKm:
        targetStatus === 'completed' ? this.actualDistanceKm() : null,
      actualDurationMin:
        targetStatus === 'completed' ? this.actualDurationMin() : null,
      fareTotal: targetStatus === 'completed' ? this.fareTotal() : null,
    };
  }

  buildCancelPayload(): AdminCancelTripPayload {
    return {
      reason: this.reason().trim(),
      internalNote: this.cleanOptional(this.internalNote()),
    };
  }

  buildMessagePayload(): AdminSendTripMessagePayload {
    return {
      target: this.messageTargetControl.value,
      message: this.message().trim(),
    };
  }

  toOptionalNumber(value: string): number | null {
    const numberValue = Number(value);

    return Number.isFinite(numberValue) && value !== '' ? numberValue : null;
  }

  private buildTargetStatusOptions(): DynamicFieldConfig<AdminTripStatus>['options'] {
    const trip = this.trip();

    return [
      {
        label: 'Buscando conductor',
        value: 'assigning',
        disabled: trip.currentStatus === 'assigning',
      },
      {
        label: 'Driver en camino',
        value: 'arriving',
        disabled: !trip.driverId || trip.currentStatus === 'arriving',
      },
      {
        label: 'En viaje',
        value: 'in_progress',
        disabled: !trip.driverId || trip.currentStatus === 'in_progress',
      },
      {
        label: 'Completado',
        value: 'completed',
        disabled: !trip.driverId || trip.currentStatus === 'completed',
      },
      {
        label: 'Cancelado',
        value: 'cancelled',
        disabled: trip.currentStatus === 'cancelled',
      },
      {
        label: 'Sin conductores',
        value: 'no_drivers_found',
        disabled:
          Boolean(trip.driverId) || trip.currentStatus === 'no_drivers_found',
      },
    ];
  }

  private cleanOptional(value: string): string | null {
    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : null;
  }
}

