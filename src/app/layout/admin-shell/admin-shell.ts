import { BreakpointObserver } from '@angular/cdk/layout';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

import { AdminShellStore } from './admin-shell.store';
import { AdminSidebar } from '../sidebar/admin-sidebar';
import { AdminTopbar } from '../topbar/admin-topbar';
import { AdminBreadcrumbs } from '../breadcrumbs/admin-breadcrumbs';
import { ADMIN_NAVIGATION } from './admin-navigation.config';
import { AuthStore } from '../../core/auth/auth.store';

export type BreadcrumbItem = {
  label: string;
  url: string;
};

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, MatSidenavModule, AdminSidebar, AdminTopbar, AdminBreadcrumbs],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShell {
  readonly store = inject(AdminShellStore);
  readonly authStore = inject(AuthStore);

  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly navItems = ADMIN_NAVIGATION;

  private readonly routeEvent = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(new NavigationEnd(0, this.router.url, this.router.url)),
    ),
    {
      initialValue: new NavigationEnd(0, this.router.url, this.router.url),
    },
  );

  readonly isMobile = toSignal(
    this.breakpointObserver.observe('(max-width: 960px)').pipe(map((result) => result.matches)),
    {
      initialValue: false,
    },
  );

  readonly breadcrumbs = computed(() => buildBreadcrumbs(this.routeEvent().urlAfterRedirects));

  readonly pageTitle = computed(() => {
    const breadcrumbs = this.breadcrumbs();

    return breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : 'Dashboard';
  });

  readonly collapsedForView = computed(() => !this.isMobile() && this.store.sidebarCollapsed());

  private readonly syncTheme = effect(() => {
    this.document.documentElement.setAttribute('data-theme', this.store.theme());
  });

  onSidebarToggle(): void {
    if (this.isMobile()) {
      this.store.toggleMobileSidebar();
      return;
    }

    this.store.toggleSidebarCollapsed();
  }

  onSidebarNavigate(): void {
    if (this.isMobile()) {
      this.store.closeMobileSidebar();
    }
  }

  goToProfile(): void {
    this.router.navigate(['/admin', 'users', 'profile']);
  }

  logout(): void {
    this.authStore.logout();
  }
}

function buildBreadcrumbs(url: string): BreadcrumbItem[] {
  const cleanUrl = url.split('?')[0].split('#')[0];
  const segments = cleanUrl.split('/').filter(Boolean);

  const ignoredSegments = new Set(['admin']);
  const accumulatedSegments: string[] = [];
  const breadcrumbs: BreadcrumbItem[] = [];

  for (const segment of segments) {
    accumulatedSegments.push(segment);

    if (ignoredSegments.has(segment)) {
      continue;
    }

    breadcrumbs.push({
      label: formatSegment(segment),
      url: `/${accumulatedSegments.join('/')}`,
    });
  }

  return breadcrumbs.length > 0 ? breadcrumbs : [{ label: 'Dashboard', url: '/admin/dashboard' }];
}

function formatSegment(segment: string): string {
  return segment
    .replaceAll('-', ' ')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
