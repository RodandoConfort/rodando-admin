import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

export type AdminTheme = 'light' | 'dark';

type AdminShellState = {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  theme: AdminTheme;
};

const initialState: AdminShellState = {
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  theme: 'dark',
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
      patchState(store, { theme });
    },

    toggleTheme(): void {
      const nextTheme: AdminTheme = store.theme() === 'dark' ? 'light' : 'dark';

      patchState(store, {
        theme: nextTheme,
      });
    },
  })),
);
