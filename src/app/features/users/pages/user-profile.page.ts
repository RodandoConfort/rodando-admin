import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';

import { DynamicForm } from '../../../shared/form/dynamic-form/dynamic-form';
import { DynamicFormValue } from '../../../shared/form/dynamic-form-builder';

import { EntityPageCard } from '../../../shared/components/entity-page-card/entity-page-card';

import { UsersStore } from '../data-access/users.store';
import { CHANGE_PASSWORD_FORM_CONFIG, PROFILE_FORM_CONFIG } from '../config/users-form.config';
import {
  mapPasswordFormToPayload,
  mapProfileFormToPayload,
  mapProfileToFormValue,
} from '../config/users-form.mapper';
import { PageLoader } from '../../../shared/feedback/page-loader/page-loader';

@Component({
  selector: 'app-user-profile-page',
  standalone: true,
  imports: [DynamicForm, EntityPageCard, PageLoader],
  template: `
    <section class="user-profile-page">
      <app-entity-page-card
        title="Mi perfil"
        subtitle="Actualiza tus datos personales dentro de la plataforma."
        icon="account_circle"
      >
        @if (store.profileLoading()) {
          <app-page-loader
            title="Cargando perfil..."
            description="Estamos preparando tus datos personales."
          />
        } @else if (store.profileError(); as profileError) {
          <div class="user-profile-page__error" role="alert">
            {{ profileError }}
          </div>
        } @else if (profileInitialValue(); as initialValue) {
          @if (store.profileSaved()) {
            <div class="user-profile-page__success" role="status">
              Perfil actualizado correctamente.
            </div>
          }

          <app-dynamic-form
            [config]="profileFormConfig"
            [initialValue]="initialValue"
            [saving]="store.profileSaving()"
            [error]="store.profileSaveError()"
            (submitted)="submitProfile($event)"
          />
        }
      </app-entity-page-card>

      <app-entity-page-card
        title="Seguridad"
        subtitle="Cambia tu contraseña para mantener protegido tu acceso."
        icon="lock"
      >
        @if (store.passwordChanged()) {
          <div class="user-profile-page__success" role="status">
            Contraseña actualizada correctamente.
          </div>
        }

        <app-dynamic-form
          [config]="passwordFormConfig"
          [saving]="store.passwordSaving()"
          [error]="store.passwordError()"
          (submitted)="submitPassword($event)"
        />
      </app-entity-page-card>
    </section>
  `,
  styles: `
    .user-profile-page {
      display: grid;
      gap: 1.5rem;
    }

    .user-profile-page__error,
    .user-profile-page__success {
      margin-bottom: 1.25rem;
      padding: 1rem;
      border-radius: var(--radius-lg);
      font-weight: 750;
      line-height: 1.5;
    }

    .user-profile-page__error {
      color: var(--app-danger);
      background: #fef2f2;
      border: 1px solid #fecaca;
    }

    .user-profile-page__success {
      color: #166534;
      background: #dcfce7;
      border: 1px solid #bbf7d0;
    }

    html[data-theme='dark'] .user-profile-page__error {
      color: #fca5a5;
      background: rgb(220 38 38 / 12%);
      border-color: rgb(248 113 113 / 28%);
    }

    html[data-theme='dark'] .user-profile-page__success {
      color: #86efac;
      background: rgb(22 163 74 / 12%);
      border-color: rgb(74 222 128 / 24%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfilePage {
  readonly store = inject(UsersStore);

  readonly profileFormConfig = PROFILE_FORM_CONFIG;
  readonly passwordFormConfig = CHANGE_PASSWORD_FORM_CONFIG;

  readonly profileInitialValue = computed(() => {
    const profile = this.store.profile();

    return profile ? mapProfileToFormValue(profile) : null;
  });

  private readonly enterPageEffect = effect(() => {
    this.store.clearProfileSaveState();
    this.store.clearPasswordState();
    this.store.loadProfile();
  });

  submitProfile(value: DynamicFormValue): void {
    this.store.updateProfile(mapProfileFormToPayload(value));
  }

  submitPassword(value: DynamicFormValue): void {
    this.store.changePassword(mapPasswordFormToPayload(value));
  }
}
