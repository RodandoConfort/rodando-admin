import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { AdminUser } from '../../data-access/users.models';

@Component({
  selector: 'app-user-detail-card',
  standalone: true,
  imports: [
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <mat-card class="user-detail-card">
      <mat-card-header>
        <mat-card-title>{{ user().name }}</mat-card-title>
        <mat-card-subtitle>
          {{ user().userType }}
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <dl class="user-detail-card__grid">
          <div>
            <dt>Correo</dt>
            <dd>{{ user().email || '—' }}</dd>
          </div>

          <div>
            <dt>Teléfono</dt>
            <dd>{{ user().phoneNumber || '—' }}</dd>
          </div>

          <div>
            <dt>Estado</dt>
            <dd>{{ user().status || '—' }}</dd>
          </div>

          <div>
            <dt>Idioma preferido</dt>
            <dd>{{ user().preferredLanguage || '—' }}</dd>
          </div>

          <div>
            <dt>Creado</dt>
            <dd>
              @if (user().createdAt) {
                {{ user().createdAt | date: 'dd/MM/yyyy HH:mm' }}
              } @else {
                —
              }
            </dd>
          </div>
        </dl>
      </mat-card-content>

      <mat-card-actions align="end">
        <button mat-stroked-button type="button" (click)="back.emit()">
          Volver
        </button>

        @if (canEdit()) {
          <button mat-flat-button type="button" (click)="edit.emit()">
            <mat-icon>edit</mat-icon>
            Editar
          </button>
        }
      </mat-card-actions>
    </mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailCard {
  readonly user = input.required<AdminUser>();
  readonly canEdit = input(true);

  readonly edit = output<void>();
  readonly back = output<void>();
}
