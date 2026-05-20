import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, of, shareReplay, tap, throwError } from 'rxjs';

import { getApiErrorMessage } from '../api/api-error.mapper';
import { AlertService } from '../notifications/alert.service';
import { ROUTE_COMMANDS } from '../router/app-paths';
import { AuthHttp } from './auth.http';
import { AuthStorageService } from './auth-storage.service';
import {
  AdminLoginPayload,
  AuthSession,
  AuthStatus,
  AuthUser,
  LoginResponse,
  UserType,
} from './auth.models';
import { decodeAccessToken, isTokenExpired } from './jwt.util';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly authHttp = inject(AuthHttp);
  private readonly authStorage = inject(AuthStorageService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);

  private refreshRequest$: Observable<AuthSession> | null = null;
  private refreshTimerId: number | null = null;

  readonly session = signal<AuthSession | null>(null);
  readonly user = signal<AuthUser | null>(this.authStorage.getSnapshot()?.user ?? null);
  readonly status = signal<AuthStatus>('idle');
  readonly loading = signal(false);
  readonly loggingOut = signal(false);
  readonly error = signal<string | null>(null);

  readonly accessToken = computed(() => this.session()?.accessToken ?? null);

  readonly isAuthenticated = computed(() => {
    const session = this.session();

    if (!session?.accessToken) {
      return false;
    }

    return !isTokenExpired(session.accessTokenExpiresAt);
  });

  readonly userType = computed(() => {
    const session = this.session();
    const snapshot = this.authStorage.getSnapshot();

    return this.user()?.userType ?? session?.userType ?? snapshot?.userType ?? null;
  });

  readonly isAdmin = computed(() => this.userType() === UserType.Admin);

  constructor() {
    this.hydrateFromSnapshot();

    effect(() => {
      const session = this.session();

      this.clearRefreshTimer();

      if (!session?.accessTokenExpiresAt) {
        return;
      }

      this.scheduleRefreshBeforeExpiry(session.accessTokenExpiresAt);
    });
  }

  login(payload: AdminLoginPayload): void {
    this.loading.set(true);
    this.error.set(null);

    this.authHttp
      .login(payload)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (result) => {
          const session = this.buildSession(result.data);
          const user = result.data.user ?? this.buildUserFromSession(session);

          this.setAuthenticatedSession(session, user);
          this.alert.success(result.message || 'Bienvenido al panel de administración.');
          this.router.navigate(ROUTE_COMMANDS.admin.dashboard);
        },
        error: (error) => {
          this.error.set(getApiErrorMessage(error));
        },
      });
  }

  refreshSilently(): Observable<AuthSession> {
    const currentSession = this.session();

    if (currentSession && !isTokenExpired(currentSession.accessTokenExpiresAt)) {
      return of(currentSession);
    }

    return this.forceRefreshSilently();
  }

  forceRefreshSilently(): Observable<AuthSession> {
    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    this.status.set('checking');
    this.error.set(null);

    this.refreshRequest$ = this.authHttp.refresh().pipe(
      map((response) => this.buildSession(response)),
      tap((session) => {
        const user = session.user ?? this.buildUserFromSession(session);
        this.setAuthenticatedSession(session, user);
      }),
      catchError((error) => {
        this.clearSession();
        return throwError(() => error);
      }),
      finalize(() => {
        this.refreshRequest$ = null;
      }),
      shareReplay({
        bufferSize: 1,
        refCount: false,
      }),
    );

    return this.refreshRequest$;
  }

  logout(): void {
    if (this.loggingOut()) {
      return;
    }

    this.loggingOut.set(true);
    this.clearRefreshTimer();

    this.authHttp
      .logout()
      .pipe(
        finalize(() => {
          this.loggingOut.set(false);
          this.clearSession();
          this.router.navigate(ROUTE_COMMANDS.auth.login);
        }),
      )
      .subscribe();
  }

  clearSession(): void {
    this.clearRefreshTimer();
    this.authStorage.clearSnapshot();

    this.session.set(null);
    this.user.set(null);
    this.status.set('unauthenticated');
    this.error.set(null);
  }

  redirectToLogin(): void {
    this.clearSession();
    this.router.navigate(ROUTE_COMMANDS.auth.login);
  }

  private hydrateFromSnapshot(): void {
    const snapshot = this.authStorage.getSnapshot();

    if (!snapshot) {
      this.status.set('idle');
      return;
    }

    if (snapshot.refreshTokenExpiresAt && Date.now() >= snapshot.refreshTokenExpiresAt) {
      this.clearSession();
      return;
    }

    this.user.set(snapshot.user ?? null);
    this.status.set('checking');
  }

  private setAuthenticatedSession(session: AuthSession, user: AuthUser | null): void {
    this.session.set(session);
    this.user.set(user);
    this.status.set('authenticated');
    this.error.set(null);

    this.authStorage.setSnapshot({
      user,
      sessionType: session.sessionType,
      sid: session.sid ?? null,
      accessTokenExpiresAt: session.accessTokenExpiresAt,
      refreshTokenExpiresAt: session.refreshTokenExpiresAt,
      userType: session.userType ?? user?.userType ?? null,
    });
  }

  private scheduleRefreshBeforeExpiry(accessTokenExpiresAt: number): void {
    const refreshInMs = accessTokenExpiresAt - Date.now() - 30_000;

    if (refreshInMs <= 0) {
      this.forceRefreshSilently().subscribe({
        error: () => this.redirectToLogin(),
      });
      return;
    }

    this.refreshTimerId = window.setTimeout(() => {
      this.forceRefreshSilently().subscribe({
        error: () => this.redirectToLogin(),
      });
    }, refreshInMs);
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimerId === null) {
      return;
    }

    window.clearTimeout(this.refreshTimerId);
    this.refreshTimerId = null;
  }

  private buildSession(response: LoginResponse): AuthSession {
    const payload = decodeAccessToken(response.accessToken);

    return {
      accessToken: response.accessToken,
      sessionType: response.sessionType,
      accessTokenExpiresAt: response.accessTokenExpiresAt,
      refreshTokenExpiresAt: response.refreshTokenExpiresAt,
      sid: response.sid ?? payload?.sid,
      user: response.user ?? null,
      userType: response.userType ?? payload?.userType ?? null,
    };
  }

  private buildUserFromSession(session: AuthSession): AuthUser | null {
    const payload = decodeAccessToken(session.accessToken);

    if (!payload?.sub) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      userType: payload.userType,
    };
  }
}
