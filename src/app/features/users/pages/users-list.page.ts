import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  AdminUser,
  UserStatus,
  UserType,
} from '../data-access/users.models';
import { UsersStore } from '../data-access/users.store';
import { buildUsersTableConfig } from '../config/users-table.config';

import { DataTable } from '../../../shared/table/data-table/data-table';
import {
  DataTablePageChangeEvent,
  TableActionEvent,
  TableFilterChangeEvent,
} from '../../../shared/table/table.types';

import { EntityPageCard } from '../../../shared/components/entity-page-card/entity-page-card';
import { EntityPageCardAction } from '../../../shared/components/entity-page-card/entity-page-card.types';

@Component({
  selector: 'app-users-list-page',
  standalone: true,
  imports: [
    DataTable,
    EntityPageCard,
  ],
  template: `
    <app-entity-page-card
      title="Usuarios"
      subtitle="Gestión administrativa de usuarios de la plataforma."
      icon="group"
      [actions]="cardActions()"
      (actionClick)="onCardAction($event)"
    >
      @if (store.deleteError(); as deleteError) {
        <div class="users-list-page__error" role="alert">
          {{ deleteError }}
        </div>
      }

      <app-data-table
        [items]="store.users()"
        [config]="tableConfig()"
        [loading]="store.listLoading()"
        [error]="store.listError()"
        (retry)="store.reloadUsers()"
        (create)="goToCreate()"
        (rowClick)="goToDetail($event)"
        (actionClick)="handleAction($event)"
        (searchChange)="store.searchUsers($event)"
        (filterChange)="handleFilterChange($event)"
        (pageChange)="handlePageChange($event)"
      />
    </app-entity-page-card>
  `,
  styles: `
    .users-list-page__error {
      margin-bottom: 1.25rem;
      padding: 0.95rem 1rem;
      color: var(--app-danger);
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-lg);
      font-size: 0.9rem;
      font-weight: 750;
      line-height: 1.5;
    }

    html[data-theme='dark'] .users-list-page__error {
      color: #fca5a5;
      background: rgb(220 38 38 / 12%);
      border-color: rgb(248 113 113 / 28%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListPage {
  readonly store = inject(UsersStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly cardActions = computed<readonly EntityPageCardAction[]>(() => [
    {
      key: 'create',
      label: 'Nuevo usuario',
      icon: 'person_add',
      placement: 'header',
      variant: 'filled',
      tone: 'primary',
    },
  ]);

  readonly tableConfig = computed(() =>
    buildUsersTableConfig(
      this.store.query(),
      this.store.pagination(),
      this.store.deletingUserId(),
    ),
  );

  private readonly enterPageEffect = effect(() => {
    this.store.enterUsersList();
  });

  onCardAction(actionKey: string): void {
    if (actionKey === 'create') {
      this.goToCreate();
    }
  }

  goToCreate(): void {
    this.router.navigate(['create'], {
      relativeTo: this.route,
    });
  }

  goToDetail(user: AdminUser): void {
    this.router.navigate([user.id], {
      relativeTo: this.route,
    });
  }

  handleAction(event: TableActionEvent<AdminUser>): void {
    const { actionKey, item } = event;

    if (actionKey === 'detail') {
      this.goToDetail(item);
      return;
    }

    if (actionKey === 'edit') {
      this.router.navigate([item.id, 'edit'], {
        relativeTo: this.route,
      });

      return;
    }

    if (actionKey === 'delete') {
      this.store.deleteUser(item.id);
    }
  }

  handleFilterChange(event: TableFilterChangeEvent): void {
    if (event.key === 'userType') {
      this.store.setUserTypeFilter(
        event.value as UserType | null,
      );

      return;
    }

    if (event.key === 'status') {
      this.store.setStatusFilter(
        event.value as UserStatus | null,
      );
    }
  }

  handlePageChange(event: DataTablePageChangeEvent): void {
    this.store.setPage(
      event.pageIndex + 1,
      event.pageSize,
    );
  }
}
