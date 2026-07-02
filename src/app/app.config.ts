import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling, withRouterConfig } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNativeDateAdapter } from '@angular/material/core';

import { environment } from '../environments/environment';
import { APP_ROUTES } from './app.routes';
import { API_BASE_URL } from './core/tokens/api-base-url.token';
import { apiErrorInterceptor } from './core/interceptors/api-error.interceptor';
import { authTokenInterceptor } from './core/interceptors/auth-token.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideNativeDateAdapter(),
    provideAnimationsAsync(),

    {
      provide: API_BASE_URL,
      useValue: environment.apiBaseUrl,
    },

    provideRouter(
      APP_ROUTES,
      withComponentInputBinding(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      withRouterConfig({
        onSameUrlNavigation: 'reload',
      }),
    ),

    provideHttpClient(
      withInterceptors([
        authTokenInterceptor,
        apiErrorInterceptor,
        authInterceptor,
      ]),
    ),
  ],
};
