import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-price-policies-segments',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <nav class="price-policies-segments" aria-label="Secciones de políticas de precio">
      <a
        class="price-policies-segments__item"
        [routerLink]="policiesRoute"
        routerLinkActive="price-policies-segments__item--active"
        [routerLinkActiveOptions]="{ exact: false }"
      >
        <mat-icon>payments</mat-icon>
        <span>Políticas</span>
      </a>

      <a
        class="price-policies-segments__item"
        [routerLink]="simulatorRoute"
        routerLinkActive="price-policies-segments__item--active"
        [routerLinkActiveOptions]="{ exact: true }"
      >
        <mat-icon>calculate</mat-icon>
        <span>Simulador</span>
      </a>
    </nav>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      margin-bottom: 1.25rem;
    }

    .price-policies-segments {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      width: fit-content;
      max-width: 100%;
      padding: 0.4rem;
      overflow-x: auto;
      background: color-mix(in srgb, var(--app-surface-2) 76%, var(--app-surface));
      border: 1px solid var(--app-border);
      border-radius: 1.1rem;
      box-shadow: var(--shadow-sm);
    }

    .price-policies-segments__item {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      min-height: 2.8rem;
      padding-inline: 1rem;
      color: var(--app-text-muted);
      text-decoration: none;
      border: 1px solid transparent;
      border-radius: 0.85rem;
      font-size: 0.88rem;
      font-weight: 850;
      white-space: nowrap;
      transition:
        background-color var(--transition-fast),
        color var(--transition-fast),
        border-color var(--transition-fast),
        box-shadow var(--transition-fast);
    }

    .price-policies-segments__item mat-icon {
      width: 1.1rem;
      height: 1.1rem;
      font-size: 1.1rem;
    }

    .price-policies-segments__item:hover {
      color: var(--app-text);
      background: var(--app-surface-3);
      border-color: var(--app-border);
    }

    .price-policies-segments__item--active {
      color: var(--app-white);
      background: linear-gradient(135deg, var(--app-primary-600), var(--app-primary-800));
      border-color: color-mix(in srgb, var(--app-primary) 46%, var(--app-border));
      box-shadow: 0 12px 24px rgb(185 28 28 / 22%);
    }

    @media (max-width: 720px) {
      .price-policies-segments {
        width: 100%;
      }

      .price-policies-segments__item {
        flex: 1 0 auto;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricePoliciesSegments {
  readonly policiesRoute = ['/admin', 'price-policies', 'policies'] as const;
  readonly simulatorRoute = ['/admin', 'price-policies', 'simulator'] as const;
}
