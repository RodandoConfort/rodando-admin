import { HttpContextToken } from '@angular/common/http';

export const SHOW_ERROR_ALERT = new HttpContextToken<boolean>(() => false);

export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

export const SKIP_AUTH_REFRESH = new HttpContextToken<boolean>(() => false);
