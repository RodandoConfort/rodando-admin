import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { EntityPageCard } from '../../../shared/components/entity-page-card/entity-page-card';
import { EntityPageCardAction } from '../../../shared/components/entity-page-card/entity-page-card.types';

import { UsersStore } from '../data-access/users.store';
import { PageLoader } from '../../../shared/feedback/page-loader/page-loader';

@Component({
  selector: 'app-user-detail-page',
  standalone: true,
  imports: [EntityPageCard, PageLoader],
  template: `
    <app-entity-page-card
      title="Detalle del usuario"
      subtitle="Consulta la información administrativa del usuario seleccionado."
      icon="person"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      @if (store.detailLoading()) {
        <app-page-loader
          title="Cargando detalle..."
          description="Estamos obteniendo la información del usuario."
        />
      } @else if (store.detailError(); as detailError) {
        <div class="user-detail-page__error" role="alert">
          {{ detailError }}
        </div>
      } @else if (store.selectedUser(); as user) {
        <section class="user-detail-page__grid">
          <article class="user-detail-page__item">
            <span>Nombre completo</span>
            <strong>{{ user.name || '—' }}</strong>
          </article>

          <article class="user-detail-page__item">
            <span>Correo electrónico</span>
            <strong>{{ user.email || '—' }}</strong>
          </article>

          <article class="user-detail-page__item">
            <span>Número de celular</span>
            <strong>{{ user.phoneNumber || '—' }}</strong>
          </article>

          <article class="user-detail-page__item">
            <span>Tipo de usuario</span>
            <strong>{{ user.userType || '—' }}</strong>
          </article>

          <article class="user-detail-page__item">
            <span>Estado</span>
            <strong>{{ user.status || '—' }}</strong>
          </article>

          <article class="user-detail-page__item">
            <span>Lenguaje preferido</span>
            <strong>{{ user.preferredLanguage || '—' }}</strong>
          </article>
        </section>
      } @else {
        <div class="user-detail-page__state">No se encontró el usuario solicitado.</div>
      }
    </app-entity-page-card>
  `,
  styles: `
    .user-detail-page__error {
      padding: 1rem;
      border-radius: var(--radius-lg);
      font-weight: 750;
      line-height: 1.5;
    }

    .user-detail-page__error {
      color: var(--app-danger);
      background: #fef2f2;
      border: 1px solid #fecaca;
    }

    .user-detail-page__grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }

    .user-detail-page__item {
      display: grid;
      gap: 0.45rem;
      min-height: 5rem;
      padding: 1rem 1.1rem;
      background: color-mix(in srgb, var(--app-surface-2) 78%, var(--app-surface));
      border: 1px solid var(--app-border);
      border-radius: var(--radius-lg);
    }

    .user-detail-page__item span {
      color: var(--app-text-muted);
      font-size: 0.75rem;
      font-weight: 850;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .user-detail-page__item strong {
      color: var(--app-text);
      font-size: 1rem;
      font-weight: 850;
      line-height: 1.45;
      overflow-wrap: anywhere;
    }

    html[data-theme='dark'] .user-detail-page__error {
      color: #fca5a5;
      background: rgb(220 38 38 / 12%);
      border-color: rgb(248 113 113 / 28%);
    }

    @media (max-width: 760px) {
      .user-detail-page__grid {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailPage {
  readonly store = inject(UsersStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly userId = computed(() => this.paramMap().get('id'));

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
      key: 'edit',
      label: 'Editar',
      icon: 'edit',
      placement: 'header',
      variant: 'outlined',
      tone: 'primary',
    },
  ]);

  private readonly loadUserEffect = effect(() => {
    const id = this.userId();

    if (!id) {
      return;
    }

    this.store.loadUserDetail(id);
  });

  onCardAction(actionKey: string): void {
    if (actionKey === 'back') {
      this.goBack();
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
}
