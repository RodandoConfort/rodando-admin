import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { EntityPageCardAction } from './entity-page-card.types';

@Component({
  selector: 'app-entity-page-card',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './entity-page-card.html',
  styleUrl: './entity-page-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityPageCard {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly icon = input<string | null>(null);

  readonly actions = input<readonly EntityPageCardAction[]>([]);

  readonly actionClick = output<string>();

  readonly visibleHeaderActions = computed(() =>
    this.actions().filter(
      (action) =>
        action.visible !== false &&
        (action.placement ?? 'footer') === 'header',
    ),
  );

  readonly visibleFooterActions = computed(() =>
    this.actions().filter(
      (action) =>
        action.visible !== false &&
        (action.placement ?? 'footer') === 'footer',
    ),
  );

  readonly hasHeaderActions = computed(
    () => this.visibleHeaderActions().length > 0,
  );

  readonly hasFooterActions = computed(
    () => this.visibleFooterActions().length > 0,
  );

  emitAction(action: EntityPageCardAction): void {
    if (action.disabled || action.loading) {
      return;
    }

    this.actionClick.emit(action.key);
  }
}
