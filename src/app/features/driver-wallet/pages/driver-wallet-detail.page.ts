import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';

import { EntityPageCard } from '../../../shared/components/entity-page-card/entity-page-card';
import { PageLoader } from '../../../shared/feedback/page-loader/page-loader';
import { DynamicForm } from '../../../shared/form/dynamic-form/dynamic-form';
import { DataTable } from '../../../shared/table/data-table/data-table';

import { DriverWalletStore } from '../data-access/driver-wallet.store';
import {
  buildDriverWalletTopupFormConfig,
  DRIVER_WALLET_BLOCK_FORM_CONFIG,
} from '../config/driver-wallet-forms.config';
import { buildWalletMovementsTableConfig } from '../config/wallet-movements-table.config';
import { EntityPageCardAction } from '../../../shared/components/entity-page-card/entity-page-card.types';
import { DynamicFormValue } from '../../../shared/form/dynamic-form-builder';
import {
  mapWalletBlockFormToPayload,
  mapWalletTopupFormToPayload,
} from '../config/driver-wallet-form.mapper';
import { DataTablePageChangeEvent } from '../../../shared/table/table.types';
import { DriverProfile } from '../../drivers/data-access/drivers.models';
import { DriversHttp } from '../../drivers/data-access/drivers.http';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { DynamicFieldConfig } from '../../../shared/form/form.types';
import { FormControl } from '@angular/forms';
import { DateField } from '../../../shared/form/fields/date-field/date-field';

type WalletPanel = 'topup' | 'block' | null;

@Component({
  selector: 'app-driver-wallet-detail-page',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    EntityPageCard,
    PageLoader,
    DynamicForm,
    DataTable,
    DateField,
  ],
  template: `
    <app-entity-page-card
      title="Wallet del conductor"
      subtitle="Consulta saldo, movimientos y operaciones administrativas."
      icon="account_balance_wallet"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      @if (driverLoading()) {
        <app-page-loader
          title="Cargando conductor..."
          description="Estamos preparando el contexto del conductor."
        />
      } @else if (driverError(); as error) {
        <div class="driver-wallet-page__error" role="alert">
          {{ error }}
        </div>
      } @else if (store.walletLoading()) {
        <app-page-loader
          title="Cargando wallet..."
          description="Estamos consultando el saldo y el estado actual."
        />
      } @else if (store.walletError(); as walletError) {
        <div class="driver-wallet-page__error" role="alert">
          {{ walletError }}
        </div>
      } @else if (store.wallet(); as wallet) {
        <section class="driver-wallet-page">
          <header class="driver-wallet-page__summary">
            <article class="driver-wallet-page__metric">
              <span>Saldo disponible</span>
              <strong>
                {{ formatMoney(wallet.currentWalletBalance, wallet.currency) }}
              </strong>
            </article>

            <article class="driver-wallet-page__metric">
              <span>Saldo retenido</span>
              <strong>
                {{ formatMoney(wallet.heldWalletBalance, wallet.currency) }}
              </strong>
            </article>

            <article class="driver-wallet-page__metric">
              <span>Total ganado</span>
              <strong>
                {{ formatMoney(wallet.totalEarnedFromTrips, wallet.currency) }}
              </strong>
            </article>

            <article class="driver-wallet-page__metric">
              <span>Estado</span>
              <strong
                class="driver-wallet-page__status"
                [class.driver-wallet-page__status--active]="wallet.status === 'active'"
                [class.driver-wallet-page__status--blocked]="wallet.status === 'blocked'"
              >
                {{ wallet.status === 'active' ? 'Activa' : 'Bloqueada' }}
              </strong>
            </article>
          </header>

          <section class="driver-wallet-page__actions">
            <button
              mat-flat-button
              type="button"
              [disabled]="store.topupOptionsLoading()"
              (click)="showPanel('topup')"
            >
              <mat-icon>payments</mat-icon>
              Recargar wallet
            </button>

            @if (wallet.status === 'active') {
              <button mat-stroked-button type="button" (click)="showPanel('block')">
                <mat-icon>lock</mat-icon>
                Bloquear
              </button>
            } @else {
              <button
                mat-stroked-button
                type="button"
                [disabled]="store.blockSaving()"
                (click)="unblockWallet()"
              >
                <mat-icon>lock_open</mat-icon>
                Desbloquear
              </button>
            }

            <button mat-stroked-button type="button" (click)="store.reload()">
              <mat-icon>refresh</mat-icon>
              Refrescar
            </button>
          </section>

          @if (activePanel() === 'topup') {
            <section class="driver-wallet-page__panel">
              <h3>Recargar wallet</h3>

              @if (store.topupOptionsLoading()) {
                <app-page-loader
                  title="Cargando opciones..."
                  description="Estamos consultando puntos de recaudo y operadores activos."
                />
              } @else if (store.topupOptionsError(); as optionsError) {
                <div class="driver-wallet-page__error" role="alert">
                  {{ optionsError }}
                </div>
              } @else {
                <app-dynamic-form
                  [config]="topupFormConfig()"
                  [saving]="store.topupSaving()"
                  [error]="store.topupError()"
                  (submitted)="submitTopup($event)"
                  (cancelled)="hidePanel()"
                />
              }
            </section>
          }

          @if (activePanel() === 'block') {
            <section class="driver-wallet-page__panel">
              <h3>Bloquear wallet</h3>

              <app-dynamic-form
                [config]="blockFormConfig"
                [saving]="store.blockSaving()"
                [error]="store.blockError()"
                (submitted)="submitBlock($event)"
                (cancelled)="hidePanel()"
              />
            </section>
          }

          @if (store.blockError(); as blockError) {
            <div class="driver-wallet-page__error" role="alert">
              {{ blockError }}
            </div>
          }

          <section class="driver-wallet-page__movements">
            <div class="driver-wallet-page__movements-header">
              <h3>Movimientos</h3>

              @if (hasMovementsDateFilter()) {
                <span class="driver-wallet-page__active-filter"> Filtrado por fecha </span>
              }
            </div>

            <div class="driver-wallet-page__movement-filters">
              <div class="driver-wallet-page__movement-date-field">
                <app-date-field
                  [field]="movementsFromDateField"
                  [control]="movementsFromDateControl"
                />
              </div>

              <div class="driver-wallet-page__movement-date-field">
                <app-date-field [field]="movementsToDateField" [control]="movementsToDateControl" />
              </div>

              <div class="driver-wallet-page__movement-filter-actions">
                <button mat-stroked-button type="button" (click)="applyMovementsDateFilter()">
                  <mat-icon>filter_alt</mat-icon>
                  Filtrar
                </button>

                @if (hasMovementsDateFilter()) {
                  <button mat-button type="button" (click)="clearMovementsDateFilter()">
                    <mat-icon>close</mat-icon>
                    Limpiar
                  </button>
                }
              </div>
            </div>

            <app-data-table
              [items]="store.movements()"
              [config]="movementsTableConfig()"
              [loading]="store.movementsLoading()"
              [error]="store.movementsError()"
              (retry)="store.reload()"
              (searchChange)="store.searchMovements($event)"
              (pageChange)="handlePageChange($event)"
            />
          </section>
        </section>
      }
    </app-entity-page-card>
  `,
  styles: `
    .driver-wallet-page__movements-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .driver-wallet-page__active-filter {
      width: fit-content;
      padding: 0.35rem 0.75rem;
      color: var(--app-primary);
      background: color-mix(in srgb, var(--app-primary) 14%, transparent);
      border: 1px solid color-mix(in srgb, var(--app-primary) 32%, transparent);
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 800;
    }

    .driver-wallet-page__movement-filters {
      display: flex;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid var(--app-border);
      border-radius: var(--radius-lg);
      background: color-mix(in srgb, var(--app-surface-2) 72%, var(--app-surface));
    }

    .driver-wallet-page__movement-date-field {
      flex: 0 1 15rem;
      min-width: 14rem;
    }

    .driver-wallet-page__movement-filter-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-height: var(--form-field-height, 3.5rem);
      padding-top: 0.15rem;
    }

    .driver-wallet-page__movement-filter-actions button {
      min-height: 3rem;
      border-radius: 999px;
      font-weight: 800;
    }

    @media (max-width: 700px) {
      .driver-wallet-page__movements-header {
        align-items: flex-start;
        flex-direction: column;
      }

      .driver-wallet-page__movement-filters {
        align-items: stretch;
        flex-direction: column;
      }

      .driver-wallet-page__movement-date-field,
      .driver-wallet-page__movement-filter-actions,
      .driver-wallet-page__movement-filter-actions button {
        width: 100%;
      }

      .driver-wallet-page__movement-filter-actions {
        flex-direction: column;
        align-items: stretch;
        padding-top: 0;
      }
    }
    .driver-wallet-page {
      display: grid;
      gap: 1.5rem;
    }

    .driver-wallet-page__summary {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1rem;
    }

    .driver-wallet-page__metric {
      display: grid;
      gap: 0.5rem;
      padding: 1rem;
      border: 1px solid var(--app-border);
      border-radius: var(--radius-lg);
      background: var(--app-surface);
    }

    .driver-wallet-page__metric span {
      color: var(--app-text-muted);
      font-size: 0.8rem;
      font-weight: 750;
    }

    .driver-wallet-page__metric strong {
      color: var(--app-text);
      font-size: 1.15rem;
      font-weight: 850;
    }

    .driver-wallet-page__status {
      width: fit-content;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      font-size: 0.85rem !important;
    }

    .driver-wallet-page__status--active {
      color: var(--app-info) !important;
      background: #dcfce7;
    }

    .driver-wallet-page__status--blocked {
      color: #991b1b !important;
      background: #fee2e2;
    }

    .driver-wallet-page__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .driver-wallet-page__panel {
      display: grid;
      gap: 1rem;
      padding: 1.25rem;
      border: 1px solid var(--app-border);
      border-radius: var(--radius-xl);
      background: color-mix(in srgb, var(--app-surface-2) 72%, var(--app-surface));
    }

    .driver-wallet-page__panel h3,
    .driver-wallet-page__movements h3 {
      margin: 0;
      color: var(--app-text);
      font-size: 1rem;
      font-weight: 850;
    }

    .driver-wallet-page__movements {
      display: grid;
      gap: 1rem;
    }

    .driver-wallet-page__error {
      padding: 1rem;
      color: var(--app-danger);
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-lg);
      font-weight: 750;
      line-height: 1.5;
    }

    html[data-theme='dark'] .driver-wallet-page__error {
      color: #fca5a5;
      background: rgb(220 38 38 / 12%);
      border-color: rgb(248 113 113 / 28%);
    }

    @media (max-width: 1100px) {
      .driver-wallet-page__summary {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 700px) {
      .driver-wallet-page__summary {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DriverWalletDetailPage {
  readonly store = inject(DriverWalletStore);

  private readonly driversHttp = inject(DriversHttp);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly topupFormConfig = computed(() =>
    buildDriverWalletTopupFormConfig(
      this.store.collectionPointOptions(),
      this.store.collectorOptions(),
    ),
  );
  readonly blockFormConfig = DRIVER_WALLET_BLOCK_FORM_CONFIG;

  readonly activePanel = signal<WalletPanel>(null);

  readonly driverProfile = signal<DriverProfile | null>(null);
  readonly driverLoading = signal(false);
  readonly driverError = signal<string | null>(null);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly driverProfileId = computed(() => this.paramMap().get('id'));

  readonly movementsTableConfig = computed(() =>
    buildWalletMovementsTableConfig(
      this.store.movementsQuery(),
      this.store.movementsPagination(),
      this.store.wallet()?.currency ?? 'CUP',
    ),
  );

  readonly movementsFromDateControl = new FormControl<Date | null>(null);
  readonly movementsToDateControl = new FormControl<Date | null>(null);

  readonly movementsFromDateField: DynamicFieldConfig = {
    key: 'from',
    label: 'Desde',
    type: 'date',
    placeholder: 'Selecciona fecha inicial',
  };

  readonly movementsToDateField: DynamicFieldConfig = {
    key: 'to',
    label: 'Hasta',
    type: 'date',
    placeholder: 'Selecciona fecha final',
  };

  readonly hasMovementsDateFilter = computed(
    () =>
      Boolean(this.movementsFromDateControl.value) || Boolean(this.movementsToDateControl.value),
  );

  applyMovementsDateFilter(): void {
    this.store.setMovementsDateRange(
      this.toDateQueryValue(this.movementsFromDateControl.value),
      this.toDateQueryValue(this.movementsToDateControl.value),
    );
  }

  clearMovementsDateFilter(): void {
    this.movementsFromDateControl.setValue(null);
    this.movementsToDateControl.setValue(null);

    this.store.clearMovementsDateRange();
  }

  readonly cardActions = computed<readonly EntityPageCardAction[]>(() => [
    {
      key: 'back',
      label: 'Volver',
      icon: 'arrow_back',
      placement: 'header',
      variant: 'text',
      tone: 'neutral',
    },
  ]);

  private readonly loadDriverAndWalletEffect = effect(() => {
    const profileId = this.driverProfileId();

    if (!profileId) {
      return;
    }

    this.driverLoading.set(true);
    this.driverError.set(null);
    this.driverProfile.set(null);

    this.driversHttp
      .getDriverById(profileId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profile) => {
          this.driverProfile.set(profile);

          const driverUserId = profile.userId ?? profile.user?.id ?? null;

          console.log('[Driver Wallet] profileId:', profileId);
          console.log('[Driver Wallet] userId enviado a wallet:', driverUserId);

          if (!driverUserId) {
            this.driverError.set('No se pudo determinar el usuario asociado al conductor.');
            return;
          }

          /**
           * FIX REAL:
           * /drivers-balance/:driverId espera User.id, no DriverProfile.id.
           */
          this.store.enter(driverUserId);
        },
        error: () => {
          this.driverError.set('No se pudo cargar el conductor.');
        },
        complete: () => {
          this.driverLoading.set(false);
        },
      });
  });

  onCardAction(actionKey: string): void {
    if (actionKey === 'back') {
      this.goBack();
    }
  }

  showPanel(panel: WalletPanel): void {
    this.store.clearActionErrors();
    this.activePanel.set(panel);
  }

  hidePanel(): void {
    this.activePanel.set(null);
  }

  submitTopup(value: DynamicFormValue): void {
    this.store.topupWallet(mapWalletTopupFormToPayload(value));
    this.hidePanel();
  }

  submitBlock(value: DynamicFormValue): void {
    this.store.blockWallet(mapWalletBlockFormToPayload(value));
    this.hidePanel();
  }

  unblockWallet(): void {
    this.store.unblockWallet();
  }

  handlePageChange(event: DataTablePageChangeEvent): void {
    this.store.setMovementsPage(event.pageIndex + 1, event.pageSize);
  }

  goBack(): void {
    this.router.navigate(['..'], {
      relativeTo: this.route,
    });
  }

  formatMoney(value: number, currency: string): string {
    return `${Number(value ?? 0).toFixed(2)} ${currency}`;
  }

  private toDateQueryValue(value: Date | null | undefined): string | null {
    if (!value || Number.isNaN(value.getTime())) {
      return null;
    }

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
