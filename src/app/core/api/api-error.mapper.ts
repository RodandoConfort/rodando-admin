import { HttpErrorResponse } from '@angular/common/http';

export interface AppApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
  originalError?: unknown;
}

interface NestValidationError {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

interface WrappedApiError {
  success?: false;
  message?: string;
  error?: {
    code?: string;
    details?: unknown;
  };
}

export function mapApiError(error: unknown): AppApiError {
  if (isAppApiError(error)) {
    return error;
  }

  if (error instanceof HttpErrorResponse) {
    return mapHttpError(error);
  }

  return {
    message: 'Ocurrió un error inesperado. Inténtalo nuevamente.',
    originalError: error,
  };
}

export function getApiErrorMessage(error: unknown): string {
  return mapApiError(error).message;
}

function mapHttpError(error: HttpErrorResponse): AppApiError {
  const body = error.error as NestValidationError | WrappedApiError | null;

  if (isWrappedApiError(body)) {
    return {
      message: body.message ?? 'La operación no se pudo completar.',
      code: body.error?.code,
      details: body.error?.details,
      status: error.status,
      originalError: error,
    };
  }

  if (isNestValidationError(body)) {
    return {
      message: normalizeNestMessage(body.message, error.status),
      status: error.status,
      details: body,
      originalError: error,
    };
  }

  if (error.status === 0) {
    return {
      message: 'No se pudo conectar con el servidor.',
      status: error.status,
      originalError: error,
    };
  }

  if (error.status === 400) {
    return {
      message: 'Los datos enviados no son válidos. Revisa el formulario.',
      status: error.status,
      originalError: error,
    };
  }

  if (error.status === 401) {
    return {
      message: 'Credenciales incorrectas.',
      status: error.status,
      originalError: error,
    };
  }

  if (error.status === 403) {
    return {
      message: 'No tienes permisos para realizar esta acción.',
      status: error.status,
      originalError: error,
    };
  }

  if (error.status === 404) {
    return {
      message: 'El recurso solicitado no existe.',
      status: error.status,
      originalError: error,
    };
  }

  if (error.status >= 500) {
    return {
      message: 'Ocurrió un error en el servidor. Inténtalo más tarde.',
      status: error.status,
      originalError: error,
    };
  }

  return {
    message: 'No se pudo completar la solicitud.',
    status: error.status,
    originalError: error,
  };
}

function normalizeNestMessage(
  message: string | string[] | undefined,
  status?: number,
): string {
  if (Array.isArray(message)) {
    return humanizeValidationMessages(message);
  }

  if (typeof message === 'string' && message.trim()) {
    return humanizeValidationMessage(message);
  }

  if (status === 400) {
    return 'Los datos enviados no son válidos. Revisa el formulario.';
  }

  return 'No se pudo completar la solicitud.';
}

function humanizeValidationMessages(messages: string[]): string {
  const normalized = messages.map(humanizeValidationMessage);

  if (normalized.length === 1) {
    return normalized[0];
  }

  return normalized.join(' ');
}

function humanizeValidationMessage(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes('appaudience')) {
    return 'No se pudo identificar el tipo de aplicación.';
  }

  if (normalized.includes('expectedusertype')) {
    return 'El tipo de usuario solicitado no es válido.';
  }

  if (normalized.includes('email')) {
    return 'Ingresa un correo electrónico válido.';
  }

  if (normalized.includes('phonenumber')) {
    return 'Ingresa un número de teléfono válido.';
  }

  if (normalized.includes('password')) {
    return 'La contraseña no cumple con el formato esperado.';
  }

  if (normalized.includes('sessiontype')) {
    return 'El tipo de sesión no es válido.';
  }

  return 'Los datos enviados no son válidos. Revisa el formulario.';
}

function isNestValidationError(value: unknown): value is NestValidationError {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('statusCode' in value || 'message' in value)
  );
}

function isWrappedApiError(value: unknown): value is WrappedApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    value.success === false
  );
}

function isAppApiError(value: unknown): value is AppApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    !('status' in value && 'url' in value)
  );
}