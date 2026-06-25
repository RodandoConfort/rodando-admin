import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { BackgroundCheckStatus, DriverStatus } from '../data-access/drivers.models';
import { EntityPageCard } from '../../../shared/components/entity-page-card/entity-page-card';
import { PageLoader } from '../../../shared/feedback/page-loader/page-loader';
import { DriversStore } from '../data-access/drivers.store';
import { EntityPageCardAction } from '../../../shared/components/entity-page-card/entity-page-card.types';

function getBackgroundCheckLabel(status: BackgroundCheckStatus): string {
  const labels: Record<BackgroundCheckStatus, string> = {
    pending_background_check: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
  };

  return labels[status] ?? status;
}

function getDriverStatusLabel(status: DriverStatus): string {
  const labels: Record<DriverStatus, string> = {
    active: 'Activo',
    suspended: 'Suspendido',
    on_vacation: 'De vacaciones',
    pending_docs: 'Pendiente de documentos',
    deactivated: 'Desactivado',
  };

  return labels[status] ?? status;
}

@Component({
  selector: 'app-driver-detail-page',
  standalone: true,
  imports: [DatePipe, MatIconModule, EntityPageCard, PageLoader],
  template: `
    <app-entity-page-card
      title="Detalle de conductor"
      subtitle="Información administrativa y operacional del perfil del conductor."
      icon="badge"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      @if (store.detailLoading()) {
        <app-page-loader
          title="Cargando conductor..."
          description="Estamos preparando la información del perfil."
        />
      } @else if (store.detailError(); as detailError) {
        <div class="driver-detail-page__error" role="alert">
          {{ detailError }}
        </div>
      } @else if (driver(); as item) {
        <section class="driver-detail-page">
          <header class="driver-detail-page__hero">
            <div class="driver-detail-page__avatar">
              @if (item.user?.profilePictureUrl) {
                <img [src]="item.user?.profilePictureUrl" [alt]="item.user?.name ?? 'Conductor'" />
              } @else {
                <mat-icon>badge</mat-icon>
              }
            </div>

            <div class="driver-detail-page__hero-content">
              <h2>{{ item.user?.name || 'Conductor sin nombre' }}</h2>

              <div class="driver-detail-page__meta">
                <span>{{ item.user?.phoneNumber || 'Sin teléfono' }}</span>
                <span>{{ item.user?.email || 'Sin correo' }}</span>

                <span
                  class="driver-detail-page__badge"
                  [class.driver-detail-page__badge--active]="item.isApproved"
                  [class.driver-detail-page__badge--inactive]="!item.isApproved"
                >
                  {{ item.isApproved ? 'Aprobado' : 'No aprobado' }}
                </span>
              </div>
            </div>
          </header>

          <div class="driver-detail-page__grid">
            <article class="driver-detail-page__card">
              <span>Licencia</span>
              <strong>{{ item.driverLicenseNumber }}</strong>
            </article>

            <article class="driver-detail-page__card">
              <span>Vencimiento de licencia</span>
              <strong>
                {{
                  item.driverLicenseExpirationDate
                    ? (item.driverLicenseExpirationDate | date: 'dd/MM/yyyy')
                    : '—'
                }}
              </strong>
            </article>

            <article class="driver-detail-page__card">
              <span>Estado operativo</span>
              <strong>{{ driverStatusLabel(item.driverStatus) }}</strong>
            </article>

            <article class="driver-detail-page__card">
              <span>Chequeo interno</span>
              <strong>
                {{ backgroundCheckLabel(item.backgroundCheckStatus) }}
              </strong>
            </article>

            <article class="driver-detail-page__card">
              <span>Fecha chequeo interno</span>
              <strong>
                {{
                  item.backgroundCheckDate ? (item.backgroundCheckDate | date: 'dd/MM/yyyy') : '—'
                }}
              </strong>
            </article>

            <article class="driver-detail-page__card">
              <span>Prioridad pagada hasta</span>
              <strong>
                {{ item.paidPriorityUntil ? (item.paidPriorityUntil | date: 'dd/MM/yyyy') : '—' }}
              </strong>
            </article>

            <article class="driver-detail-page__card driver-detail-page__card--wide">
              <span>Contacto de emergencia</span>

              @if (item.emergencyContactInfo) {
                <strong>
                  {{ item.emergencyContactInfo.name }}
                  · {{ item.emergencyContactInfo.phoneNumber }} ·
                  {{ item.emergencyContactInfo.relationship }}
                </strong>
              } @else {
                <strong>—</strong>
              }
            </article>

            <article class="driver-detail-page__card">
              <span>Creado</span>
              <strong>
                {{ item.createdAt ? (item.createdAt | date: 'dd/MM/yyyy, HH:mm') : '—' }}
              </strong>
            </article>

            <article class="driver-detail-page__card">
              <span>Actualizado</span>
              <strong>
                {{ item.updatedAt ? (item.updatedAt | date: 'dd/MM/yyyy, HH:mm') : '—' }}
              </strong>
            </article>
          </div>
        </section>
      }
    </app-entity-page-card>
  `,
  styles: `
    .driver-detail-page {
      display: grid;
      gap: 1.5rem;
    }

    .driver-detail-page__hero {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      border: 1px solid var(--app-border);
      border-radius: var(--radius-xl);
      background: color-mix(in srgb, var(--app-surface-2) 72%, var(--app-surface));
    }

    .driver-detail-page__avatar {
      width: 4.25rem;
      height: 4.25rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-radius: 1.25rem;
      background: color-mix(in srgb, var(--app-primary) 18%, transparent);
      color: var(--app-primary);
    }

    .driver-detail-page__avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .driver-detail-page__avatar mat-icon {
      width: 2rem;
      height: 2rem;
      font-size: 2rem;
    }

    .driver-detail-page__hero-content {
      display: grid;
      gap: 0.5rem;
    }

    .driver-detail-page__hero h2 {
      margin: 0;
      color: var(--app-text);
      font-size: 1.4rem;
      font-weight: 850;
    }

    .driver-detail-page__meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      color: var(--app-text-muted);
      font-weight: 750;
    }

    .driver-detail-page__badge {
      display: inline-flex;
      width: fit-content;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 800;
    }

    .driver-detail-page__badge--active {
      color: #72c2f4;
      background: #eff4f8;
    }

    .driver-detail-page__badge--inactive {
      color: #92400e;
      background: #fef3c7;
    }

    html[data-theme='dark'] .driver-detail-page__badge--active {
      color: #86efac;
      background: rgb(34 197 94 / 14%);
    }

    html[data-theme='dark'] .driver-detail-page__badge--inactive {
      color: #fcd34d;
      background: rgb(245 158 11 / 14%);
    }

    .driver-detail-page__grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
    }

    .driver-detail-page__card {
      display: grid;
      gap: 0.5rem;
      padding: 1rem;
      border: 1px solid var(--app-border);
      border-radius: var(--radius-lg);
      background: var(--app-surface);
    }

    .driver-detail-page__card--wide {
      grid-column: 1 / -1;
    }

    .driver-detail-page__card span {
      color: var(--app-text-muted);
      font-size: 0.8rem;
      font-weight: 750;
    }

    .driver-detail-page__card strong {
      color: var(--app-text);
      font-size: 0.95rem;
      font-weight: 800;
      line-height: 1.5;
    }

    .driver-detail-page__error {
      padding: 1rem;
      color: var(--app-danger);
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-lg);
      font-weight: 750;
      line-height: 1.5;
    }

    html[data-theme='dark'] .driver-detail-page__error {
      color: #fca5a5;
      background: rgb(220 38 38 / 12%);
      border-color: rgb(248 113 113 / 28%);
    }

    @media (max-width: 900px) {
      .driver-detail-page__grid {
        grid-template-columns: 1fr;
      }

      .driver-detail-page__hero {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DriverDetailPage {
  readonly store = inject(DriversStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly driverId = computed(() => this.paramMap().get('id'));
  readonly driver = computed(() => this.store.selected());

  readonly cardActions = computed<readonly EntityPageCardAction[]>(() => [
    {
      key: 'back',
      label: 'Volver',
      icon: 'arrow_back',
      placement: 'header',
      variant: 'text',
      tone: 'neutral',
    },
    {
      key: 'wallet',
      label: 'Wallet',
      icon: 'account_balance_wallet',
      placement: 'header',
      variant: 'filled',
      tone: 'primary',
    },
    {
      key: 'edit',
      label: 'Editar',
      icon: 'edit',
      placement: 'header',
      variant: 'filled',
      tone: 'primary',
    },
  ]);

  private readonly loadDetailEffect = effect(() => {
    const id = this.driverId();

    if (!id) {
      return;
    }

    this.store.loadDriverDetail(id);
  });

  backgroundCheckLabel(status: BackgroundCheckStatus): string {
    return getBackgroundCheckLabel(status);
  }

  driverStatusLabel(status: DriverStatus): string {
    return getDriverStatusLabel(status);
  }

  onCardAction(actionKey: string): void {
    if (actionKey === 'back') {
      this.goBack();
      return;
    }

    if (actionKey === 'wallet') {
      this.goToWallet();
      return;
    }

    if (actionKey === 'edit') {
      this.goToEdit();
    }
  }

  goBack(): void {
    this.router.navigate(['..'], {
      relativeTo: this.route,
    });
  }

  goToEdit(): void {
    this.router.navigate(['edit'], {
      relativeTo: this.route,
    });
  }

  goToWallet(): void {
    this.router.navigate(['wallet'], {
      relativeTo: this.route,
    });
  }
}
