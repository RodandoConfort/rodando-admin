import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { DynamicForm } from '../../../shared/form/dynamic-form/dynamic-form';
import { DynamicFormValue } from '../../../shared/form/dynamic-form-builder';

import { EntityPageCard } from '../../../shared/components/entity-page-card/entity-page-card';
import { EntityPageCardAction } from '../../../shared/components/entity-page-card/entity-page-card.types';

import { UsersStore } from '../data-access/users.store';
import { EDIT_USER_FORM_CONFIG } from '../config/users-form.config';
import { mapEditUserFormToPayload, mapUserToEditFormValue } from '../config/users-form.mapper';
import { PageLoader } from '../../../shared/feedback/page-loader/page-loader';

@Component({
  selector: 'app-user-edit-page',
  standalone: true,
  imports: [DynamicForm, EntityPageCard, PageLoader],
  template: `
    <app-entity-page-card
      title="Editar usuario"
      subtitle="Actualiza los datos administrativos del usuario."
      icon="edit"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      @if (store.detailLoading()) {
        <app-page-loader
          title="Cargando usuario..."
          description="Estamos preparando la información para editar."
        />
      } @else if (store.detailError(); as detailError) {
        <div class="user-edit-page__error" role="alert">
          {{ detailError }}
        </div>
      } @else if (initialValue(); as initialFormValue) {
        <app-dynamic-form
          [config]="formConfig"
          [initialValue]="initialFormValue"
          [saving]="store.updateSaving()"
          [error]="store.updateError()"
          (submitted)="submit($event)"
          (cancelled)="goBack()"
        />
      }
    </app-entity-page-card>
  `,
  styles: `
    .user-edit-page__error {
      padding: 1rem;
      color: var(--app-danger);
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-lg);
      font-weight: 750;
      line-height: 1.5;
    }

    html[data-theme='dark'] .user-edit-page__error {
      color: #fca5a5;
      background: rgb(220 38 38 / 12%);
      border-color: rgb(248 113 113 / 28%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserEditPage {
  readonly store = inject(UsersStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly formConfig = EDIT_USER_FORM_CONFIG;

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

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly userId = computed(() => this.paramMap().get('id'));

  readonly initialValue = computed(() => {
    const user = this.store.selectedUser();

    return user ? mapUserToEditFormValue(user) : null;
  });

  private readonly clearStateEffect = effect(() => {
    this.store.clearUpdateState();
  });

  private readonly loadUserEffect = effect(() => {
    const id = this.userId();

    if (!id) {
      return;
    }

    this.store.loadUserDetail(id);
  });

  private readonly navigateAfterUpdateEffect = effect(() => {
    const updatedUser = this.store.updatedUser();

    if (!updatedUser) {
      return;
    }

    this.store.clearUpdateState();

    this.router.navigate(['..'], {
      relativeTo: this.route,
    });
  });

  submit(value: DynamicFormValue): void {
    const id = this.userId();

    if (!id) {
      return;
    }

    this.store.updateUser({
      id,
      payload: mapEditUserFormToPayload(value),
    });
  }

  onCardAction(actionKey: string): void {
    if (actionKey === 'back') {
      this.goBack();
    }
  }

  goBack(): void {
    this.router.navigate(['..'], {
      relativeTo: this.route,
    });
  }
}
