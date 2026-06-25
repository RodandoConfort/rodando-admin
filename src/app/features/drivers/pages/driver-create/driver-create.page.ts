import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';

import { DynamicForm } from '../../../../shared/form/dynamic-form/dynamic-form';
import { EntityPageCard } from '../../../../shared/components/entity-page-card/entity-page-card';
import { DynamicFormValue } from '../../../../shared/form/dynamic-form-builder';
import { EntityPageCardAction } from '../../../../shared/components/entity-page-card/entity-page-card.types';

import { CREATE_USER_FORM_CONFIG } from '../../../users/config/users-form.config';
import {
  CREATE_DRIVER_PROFILE_FORM_CONFIG,
  buildDriverVehicleFormConfig,
} from '../../config/driver-onboarding-form.config';
import { DriversStore } from '../../data-access/drivers.store';

@Component({
  selector: 'app-driver-create-page',
  standalone: true,
  imports: [
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    DynamicForm,
    EntityPageCard,
  ],
  templateUrl: './driver-create.page.html',
  styleUrl: './driver-create.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DriverCreatePage {
  readonly store = inject(DriversStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly userFormConfig = {
    ...CREATE_USER_FORM_CONFIG,
    submitLabel: 'Guardar y continuar',
    submitLoadingLabel: 'Creando usuario...',
    submitIcon: 'arrow_forward',
    showCancel: false,
  };

  readonly driverProfileFormConfig = {
    ...CREATE_DRIVER_PROFILE_FORM_CONFIG,
    submitLabel: 'Guardar y continuar',
    submitLoadingLabel: 'Guardando...',
    submitIcon: 'arrow_forward',
    showCancel: false,
  };

  readonly vehicleFormConfig = computed(() =>
    buildDriverVehicleFormConfig(this.store.vehicleTypeOptions()),
  );

  readonly cardActions = computed<readonly EntityPageCardAction[]>(() => [
    {
      key: 'back',
      label: 'Volver',
      icon: 'arrow_back',
      placement: 'header',
      variant: 'text',
      tone: 'neutral',
    },
  ]);

  readonly confirmationSections = computed(() => [
    {
      title: 'Usuario',
      items: [
        {
          label: 'Usuario creado',
          value: this.store.createdUser()?.id ? 'Sí' : 'No',
        },
        {
          label: 'Nombre',
          value: this.displayValue(this.store.userDraft(), 'name'),
        },
        {
          label: 'Teléfono',
          value: this.displayValue(this.store.userDraft(), 'phoneNumber'),
        },
      ],
    },
    {
      title: 'Perfil del conductor',
      items: [
        {
          label: 'Licencia',
          value: this.displayValue(
            this.store.driverProfileDraft(),
            'driverLicenseNumber',
          ),
        },
        {
          label: 'Expira',
          value: this.displayValue(
            this.store.driverProfileDraft(),
            'driverLicenseExpirationDate',
          ),
        },
        {
          label: 'Background check',
          value: this.displayValue(
            this.store.driverProfileDraft(),
            'backgroundCheckStatus',
          ),
        },
        {
          label: 'Estado del conductor',
          value: this.displayValue(
            this.store.driverProfileDraft(),
            'driverStatus',
          ),
        },
      ],
    },
    {
      title: 'Vehículo',
      items: [
        {
          label: 'Marca',
          value: this.displayValue(this.store.vehicleDraft(), 'make'),
        },
        {
          label: 'Modelo',
          value: this.displayValue(this.store.vehicleDraft(), 'model'),
        },
        {
          label: 'Año',
          value: this.displayValue(this.store.vehicleDraft(), 'year'),
        },
        {
          label: 'Placa',
          value: this.displayValue(this.store.vehicleDraft(), 'plateNumber'),
        },
        {
          label: 'Color',
          value: this.displayValue(this.store.vehicleDraft(), 'color'),
        },
        {
          label: 'Capacidad',
          value: this.displayValue(this.store.vehicleDraft(), 'capacity'),
        },
      ],
    },
  ]);

  private readonly loadCatalogsEffect = effect(() => {
    this.store.loadVehicleTypeOptions();
  });

  private readonly navigateAfterFinishEffect = effect(() => {
    const createdProfile = this.store.createdDriverProfile();

    if (!createdProfile) {
      return;
    }

    this.router.navigate(['..', createdProfile.id], {
      relativeTo: this.route,
    });
  });

  onCardAction(actionKey: string): void {
    if (actionKey === 'back') {
      this.goBack();
    }
  }

  onStepChange(index: number): void {
    this.store.goToStep(index);
  }

  submitUserStep(value: DynamicFormValue): void {
    this.store.submitUserStep(value);
  }

  submitDriverProfileStep(value: DynamicFormValue): void {
    this.store.submitDriverProfileStep(value);
  }

  submitVehicleStep(value: DynamicFormValue): void {
    this.store.submitVehicleStep(value);
  }

  finishOnboarding(): void {
    this.store.finishOnboarding();
  }

  goToStep(index: number): void {
    this.store.goToStep(index);
  }

  goPreviousStep(): void {
    this.store.goPreviousStep();
  }

  goBack(): void {
    this.router.navigate(['..'], {
      relativeTo: this.route,
    });
  }

  private displayValue(
    source: DynamicFormValue | null,
    key: string,
  ): string {
    const value = source?.[key];

    if (value === null || value === undefined || value === '') {
      return '—';
    }

    return String(value);
  }
}
