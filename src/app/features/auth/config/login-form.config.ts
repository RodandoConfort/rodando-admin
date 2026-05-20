import { Validators } from "@angular/forms";
import { strongPasswordValidator } from "../../../shared/form/validators/password.validator";
import { DynamicFormConfig } from "../../../shared/form/form.types";

export const LOGIN_FORM_CONFIG: DynamicFormConfig = {
  columns: 1,
  submitFullWidth: true,
  disableSubmitWhenInvalid: true,
  submitLabel: 'Entrar al panel',
  submitLoadingLabel: 'Validando acceso...',
  submitIcon: 'arrow_forward',
  showCancel: false,
  fields: [
    {
      key: 'email',
      label: 'Correo electrónico',
      type: 'email',
      placeholder: 'admin@rodando.com',
      autocomplete: 'email',
      prefixIcon: 'mail',
      validators: [Validators.required, Validators.email],
    },
    {
      key: 'password',
      label: 'Contraseña',
      type: 'password',
      placeholder: '••••••••',
      autocomplete: 'current-password',
      prefixIcon: 'vpn_key',
      validators: [
        Validators.required,
        strongPasswordValidator({
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireSpecial: true,
        }),
      ],
    },
  ],
};