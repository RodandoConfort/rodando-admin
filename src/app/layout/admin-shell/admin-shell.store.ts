import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

export type AdminTheme = 'light' | 'dark';

type AdminShellState = {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  theme: AdminTheme;
};

const ADMIN_THEME_STORAGE_KEY = 'rodando-admin-theme';

function readInitialTheme(): AdminTheme {
  try {
    const stored = globalThis.localStorage?.getItem(ADMIN_THEME_STORAGE_KEY);

    return stored === 'light' || stored === 'dark' ? stored : 'dark';
  } catch {
    return 'dark';
  }
}

function persistTheme(theme: AdminTheme): void {
  try {
    globalThis.localStorage?.setItem(ADMIN_THEME_STORAGE_KEY, theme);
  } catch {
    // No-op: localStorage puede no estar disponible.
  }
}

const initialState: AdminShellState = {
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  theme: readInitialTheme(),
};

export const AdminShellStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((store) => ({
    isDarkTheme: computed(() => store.theme() === 'dark'),
  })),

  withMethods((store) => ({
    toggleSidebarCollapsed(): void {
      patchState(store, (state) => ({
        sidebarCollapsed: !state.sidebarCollapsed,
      }));
    },

    openMobileSidebar(): void {
      patchState(store, { mobileSidebarOpen: true });
    },

    closeMobileSidebar(): void {
      patchState(store, { mobileSidebarOpen: false });
    },

    toggleMobileSidebar(): void {
      patchState(store, (state) => ({
        mobileSidebarOpen: !state.mobileSidebarOpen,
      }));
    },

    setTheme(theme: AdminTheme): void {
      persistTheme(theme);
      patchState(store, { theme });
    },

    toggleTheme(): void {
      const nextTheme: AdminTheme = store.theme() === 'dark' ? 'light' : 'dark';

      persistTheme(nextTheme);

      patchState(store, {
        theme: nextTheme,
      });
    },
  })),
);
