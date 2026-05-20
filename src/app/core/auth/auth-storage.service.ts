import { Injectable } from '@angular/core';

import { AuthSnapshot } from './auth.models';

const AUTH_SNAPSHOT_KEY = 'rodando_admin_auth_snapshot';

@Injectable({
  providedIn: 'root',
})
export class AuthStorageService {
  getSnapshot(): AuthSnapshot | null {
    const rawValue = localStorage.getItem(AUTH_SNAPSHOT_KEY);

    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as AuthSnapshot;
    } catch {
      this.clearSnapshot();
      return null;
    }
  }

  setSnapshot(snapshot: AuthSnapshot): void {
    localStorage.setItem(AUTH_SNAPSHOT_KEY, JSON.stringify(snapshot));
  }

  clearSnapshot(): void {
    localStorage.removeItem(AUTH_SNAPSHOT_KEY);
  }
}