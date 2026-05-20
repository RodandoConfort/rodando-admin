import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { AuthStore } from '../../../../core/auth/auth.store';
import { DynamicForm } from '../../../../shared/form/dynamic-form/dynamic-form';
import { DynamicFormValue } from '../../../../shared/form/dynamic-form-builder';
import { LOGIN_FORM_CONFIG } from '../../config/login-form.config';

@Component({
  selector: 'app-login-page',
  imports: [MatCardModule, MatIconModule, DynamicForm],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  readonly authStore = inject(AuthStore);
  readonly formConfig = LOGIN_FORM_CONFIG;

  submit(value: DynamicFormValue): void {
    const email = String(value['email'] ?? '').trim();
    const password = String(value['password'] ?? '');

    this.authStore.login({
      email,
      password,
    });
  }
}