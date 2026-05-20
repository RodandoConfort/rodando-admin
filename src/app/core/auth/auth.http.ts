import { inject, Injectable } from '@angular/core';

import { ApiClient } from '../api/api-client.service';
import {
  AdminLoginPayload,
  AppAudience,
  LoginPayload,
  LoginResponse,
  SessionType,
  UserType,
} from './auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthHttp {
  private readonly api = inject(ApiClient);

  login(payload: AdminLoginPayload) {
    const loginPayload: LoginPayload = {
      ...payload,
      appAudience: AppAudience.AdminPanel,
      expectedUserType: UserType.Admin,
      sessionType: SessionType.Web,
      deviceInfo: this.getDeviceInfo(),
      userAgent: navigator.userAgent,
    };

    return this.api.post<LoginResponse, LoginPayload>('/auth/login', loginPayload, {
      withCredentials: true,
      skipAuth: true,
      skipAuthRefresh: true,
      showErrorAlert: true,
    });
  }

  refresh() {
    return this.api.postData<LoginResponse, Record<string, never>>(
      '/auth/refresh',
      {},
      {
        withCredentials: true,
        skipAuth: true,
        skipAuthRefresh: true,
        showErrorAlert: false,
      },
    );
  }

  logout() {
    return this.api.postVoid<Record<string, never>>(
      '/auth/logout',
      {},
      {
        withCredentials: true,
        skipAuth: true,
        skipAuthRefresh: true,
        showErrorAlert: false,
      },
    );
  }

  private getDeviceInfo() {
    return {
      os: this.getOs(),
      browser: this.getBrowser(),
      appVersion: 'admin-web',
    };
  }

  private getBrowser(): string {
    const userAgent = navigator.userAgent;

    if (userAgent.includes('Edg')) {
      return 'Edge';
    }

    if (userAgent.includes('Chrome')) {
      return 'Chrome';
    }

    if (userAgent.includes('Firefox')) {
      return 'Firefox';
    }

    if (userAgent.includes('Safari')) {
      return 'Safari';
    }

    return 'Unknown';
  }

  private getOs(): string {
    const platform = navigator.platform.toLowerCase();

    if (platform.includes('win')) {
      return 'Windows';
    }

    if (platform.includes('mac')) {
      return 'macOS';
    }

    if (platform.includes('linux')) {
      return 'Linux';
    }

    return 'Unknown';
  }
}
