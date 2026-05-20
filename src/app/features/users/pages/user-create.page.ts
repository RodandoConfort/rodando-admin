import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { DynamicForm } from '../../../shared/form/dynamic-form/dynamic-form';
import { DynamicFormValue } from '../../../shared/form/dynamic-form-builder';

import { UsersStore } from '../data-access/users.store';
import { CREATE_USER_FORM_CONFIG } from '../config/users-form.config';
import { mapCreateUserFormToPayload } from '../config/users-form.mapper';
import { EntityPageCard } from '../../../shared/components/entity-page-card/entity-page-card';
import { EntityPageCardAction } from '../../../shared/components/entity-page-card/entity-page-card.types';

@Component({
  selector: 'app-user-create-page',
  standalone: true,
  imports: [
    DynamicForm,
    EntityPageCard,
  ],
  template: `
    <app-entity-page-card
      title="Crear usuario"
      subtitle="Alta administrativa de usuarios móviles."
      icon="person_add"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      <app-dynamic-form
        [config]="formConfig"
        [saving]="store.createSaving()"
        [error]="store.createError()"
        (submitted)="submit($event)"
        (cancelled)="goBack()"
      />
    </app-entity-page-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCreatePage {
  readonly store = inject(UsersStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly formConfig = CREATE_USER_FORM_CONFIG;

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

  private readonly clearStateEffect = effect(() => {
    this.store.clearCreateState();
  });

  private readonly navigateAfterCreateEffect = effect(() => {
    const createdUser = this.store.createdUser();

    if (!createdUser) {
      return;
    }

    this.store.clearCreateState();

    this.router.navigate(['..', createdUser.id], {
      relativeTo: this.route,
    });
  });

  submit(value: DynamicFormValue): void {
    this.store.createUser(
      mapCreateUserFormToPayload(value),
    );
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
