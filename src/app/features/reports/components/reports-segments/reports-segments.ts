import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-reports-segments',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="reports-segments" aria-label="Secciones de reportes">
      @for (segment of segments; track segment.label) {
        <a
          class="reports-segments__item"
          [routerLink]="segment.route"
          routerLinkActive="reports-segments__item--active"
        >
          <mat-icon>{{ segment.icon }}</mat-icon>
          <span>{{ segment.label }}</span>
        </a>
      }
    </nav>
  `,
  styles: `
    .reports-segments {
      display: flex;
      gap: .65rem;
      overflow-x: auto;
      padding: .35rem;
      border-radius: 1.25rem;
      background: var(--app-surface-2, #151924);
      border: 1px solid var(--app-border, #252b38);
      scrollbar-width: thin;
    }

    .reports-segments__item {
      display: inline-flex;
      align-items: center;
      gap: .45rem;
      min-height: 2.75rem;
      padding: 0 .9rem;
      border-radius: 999px;
      color: var(--app-text-muted, #a1aab8);
      text-decoration: none;
      font-weight: 800;
      white-space: nowrap;
      transition:
        background var(--transition-fast, 140ms ease),
        color var(--transition-fast, 140ms ease),
        transform var(--transition-fast, 140ms ease);
    }

    .reports-segments__item mat-icon {
      font-size: 1.15rem;
      width: 1.15rem;
      height: 1.15rem;
    }

    .reports-segments__item:hover {
      color: var(--app-text, #f8fafc);
      background: rgba(239, 68, 68, .08);
    }

    .reports-segments__item--active {
      color: #fff;
      background:
        linear-gradient(135deg, #ef4444, #b91c1c);
      box-shadow: 0 10px 24px rgba(185, 28, 28, .28);
    }
  `,
})
export class ReportsSegments {
  readonly segments = [
    {
      label: 'Finanzas',
      icon: 'payments',
      route: ['/admin', 'reports', 'finance'],
    },
    {
      label: 'Drivers',
      icon: 'local_taxi',
      route: ['/admin', 'reports', 'drivers'],
    },
    {
      label: 'Vehículos',
      icon: 'directions_car',
      route: ['/admin', 'reports', 'vehicles'],
    },
    {
      label: 'Usuarios',
      icon: 'person',
      route: ['/admin', 'reports', 'users'],
    },
    {
      label: 'Operaciones',
      icon: 'fact_check',
      route: ['/admin', 'reports', 'operations'],
    },
    {
      label: 'Calidad',
      icon: 'verified',
      route: ['/admin', 'reports', 'data-quality'],
    },
  ] as const;
}
