import { Validators } from '@angular/forms';

import { DynamicFormConfig } from '../../../shared/form/form.types';
import { atLeastOneFieldValidator } from '../../../shared/form/validators/at-least-one-field.validator';
import { fieldsMatchValidator } from '../../../shared/form/validators/fields-match.validator';

export const CREATE_USER_FORM_CONFIG: DynamicFormConfig = {
  layout: 'image-aside',
  columns: 1,

  submitLabel: 'Crear usuario',
  submitLoadingLabel: 'Creando...',
  submitIcon: 'person_add',
  showCancel: true,
  cancelLabel: 'Cancelar',
  disableSubmitWhenInvalid: true,

  fields: [
    {
      key: 'name',
      label: 'Nombre completo',
      type: 'text',
      placeholder: 'Ej. Carlos Martínez',
      autocomplete: 'name',
      validators: [Validators.required, Validators.maxLength(100)],
    },
    {
      key: 'phoneNumber',
      label: 'Número de celular',
      type: 'text',
      prefixText: '+53',
      placeholder: '50000000',
      autocomplete: 'tel',
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(15)],
    },
    {
      key: 'profilePicture',
      label: 'Foto de perfil',
      type: 'image',
      hint: 'Selecciona una imagen clara para identificar al conductor.',
      accept: 'image/png,image/jpeg,image/webp',
    },
    {
      key: 'password',
      label: 'Contraseña inicial',
      type: 'password',
      autocomplete: 'new-password',
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(128)],
    },
  ],
};

export const EDIT_USER_FORM_CONFIG: DynamicFormConfig = {
  layout: 'image-aside',
  columns: 2,

  submitLabel: 'Guardar cambios',
  submitLoadingLabel: 'Guardando...',
  submitIcon: 'save',
  showCancel: true,
  cancelLabel: 'Cancelar',
  disableSubmitWhenInvalid: true,

  formValidators: [atLeastOneFieldValidator('email', 'phoneNumber')],

  formErrorMessages: {
    atLeastOneField: 'Debes conservar correo o teléfono.',
  },

  fields: [
    {
      key: 'profilePictureUrl',
      label: 'Foto de perfil',
      type: 'image',
      hint: 'Puedes actualizar la imagen de perfil del usuario.',
      accept: 'image/png,image/jpeg,image/webp',
    },
    {
      key: 'name',
      label: 'Nombre completo',
      type: 'text',
      validators: [Validators.required, Validators.maxLength(100)],
    },
    // {
    //   key: 'userType',
    //   label: 'Tipo de usuario',
    //   type: 'select',
    //   validators: [Validators.required],
    //   options: [
    //     {
    //       label: 'Pasajero',
    //       value: 'passenger',
    //     },
    //     {
    //       label: 'Conductor',
    //       value: 'driver',
    //     },
    //   ],
    // },
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      validators: [Validators.required],
      options: [
        {
          label: 'Activo',
          value: 'active',
        },
        {
          label: 'Inactivo',
          value: 'inactive',
        },
        {
          label: 'Bloqueado',
          value: 'banned',
        },
      ],
    },
    // {
    //   key: 'email',
    //   label: 'Correo',
    //   type: 'email',
    //   validators: [Validators.email, Validators.maxLength(150)],
    // },
    {
      key: 'phoneNumber',
      label: 'Teléfono',
      type: 'text',
      prefixText: '+53',
      placeholder: '50000000',
      autocomplete: 'tel',
      validators: [Validators.minLength(8), Validators.maxLength(15)],
    },
    // {
    //   key: 'preferredLanguage',
    //   label: 'Idioma preferido',
    //   type: 'text',
    //   validators: [Validators.minLength(2), Validators.maxLength(10)],
    // },
  ],
};

export const PROFILE_FORM_CONFIG: DynamicFormConfig = {
  layout: 'image-aside',
  columns: 1,

  submitLabel: 'Guardar perfil',
  submitLoadingLabel: 'Guardando...',
  submitIcon: 'save',
  showCancel: false,
  disableSubmitWhenInvalid: true,

  formValidators: [
    atLeastOneFieldValidator('email', 'phoneNumber'),
  ],

  formErrorMessages: {
    atLeastOneField: 'Debes conservar correo o teléfono.',
  },

  fields: [
    {
      key: 'profilePictureUrl',
      label: 'Foto de perfil',
      type: 'image',
      hint: 'Puedes actualizar tu imagen de perfil.',
      accept: 'image/png,image/jpeg,image/webp',
    },
    {
      key: 'name',
      label: 'Nombre',
      type: 'text',
      validators: [
        Validators.required,
        Validators.maxLength(100),
      ],
    },
    {
      key: 'email',
      label: 'Correo',
      type: 'email',
      validators: [
        Validators.email,
        Validators.maxLength(150),
      ],
    },
    // {
    //   key: 'phoneNumber',
    //   label: 'Teléfono',
    //   type: 'text',
    //   prefixText: '+53',
    //   placeholder: '50000000',
    //   autocomplete: 'tel',
    //   validators: [
    //     Validators.minLength(8),
    //     Validators.maxLength(15),
    //   ],
    // },
    // {
    //   key: 'preferredLanguage',
    //   label: 'Idioma preferido',
    //   type: 'text',
    //   placeholder: 'es',
    //   validators: [
    //     Validators.minLength(2),
    //     Validators.maxLength(10),
    //   ],
    // },
  ],
};

export const CHANGE_PASSWORD_FORM_CONFIG: DynamicFormConfig = {
  columns: 1,
  submitLabel: 'Actualizar contraseña',
  submitLoadingLabel: 'Actualizando...',
  submitIcon: 'lock_reset',
  showCancel: false,
  disableSubmitWhenInvalid: true,

  formValidators: [fieldsMatchValidator('newPassword', 'confirmPassword', 'passwordsMismatch')],

  formErrorMessages: {
    passwordsMismatch: 'La confirmación de contraseña no coincide.',
  },

  fields: [
    {
      key: 'currentPassword',
      label: 'Contraseña actual',
      type: 'password',
      autocomplete: 'current-password',
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(128)],
    },
    {
      key: 'newPassword',
      label: 'Nueva contraseña',
      type: 'password',
      autocomplete: 'new-password',
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(128)],
    },
    {
      key: 'confirmPassword',
      label: 'Confirmar nueva contraseña',
      type: 'password',
      autocomplete: 'new-password',
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(128)],
    },
  ],
};
