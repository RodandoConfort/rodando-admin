import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

import { EmptyState } from '../../feedback/empty-state/empty-state';
import { TableSkeleton } from '../../feedback/table-skeleton/table-skeleton';
import { DataTablePagination } from '../data-table-pagination/data-table-pagination';
import { DataTableToolbar } from '../data-table-toolbar/data-table-toolbar';
import {
  DataTableConfig,
  DataTablePageChangeEvent,
  TableAction,
  TableActionEvent,
  TableBadgeTone,
  TableColumn,
  TableFilterChangeEvent,
  TableSegmentValue,
} from '../table.types';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    DatePipe,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    EmptyState,
    TableSkeleton,
    DataTableToolbar,
    DataTablePagination,
  ],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTable<TItem> {
  readonly items = input<readonly TItem[]>([]);
  readonly config = input.required<DataTableConfig<TItem>>();
  readonly loading = input(false);
  readonly error = input<string | null>(null);

  readonly retry = output<void>();
  readonly create = output<void>();
  readonly rowClick = output<TItem>();
  readonly actionClick = output<TableActionEvent<TItem>>();

  readonly searchChange = output<string>();
  readonly filterChange = output<TableFilterChangeEvent>();
  readonly pageChange = output<DataTablePageChangeEvent>();
  readonly segmentChange = output<TableSegmentValue>();

  readonly visibleColumns = computed(() =>
    this.config().columns.filter((column) => column.visible !== false),
  );

  readonly hasActions = computed(() => (this.config().actions?.length ?? 0) > 0);

  readonly displayedColumnKeys = computed(() => {
    const columns = this.visibleColumns().map((column) => column.key);

    if (this.hasActions()) {
      return [...columns, 'actions'];
    }

    return columns;
  });

  readonly toolbarConfig = computed(() => this.config().toolbar ?? null);
  readonly paginationConfig = computed(() => this.config().pagination ?? null);

  columnValue(column: TableColumn<TItem>, item: TItem): unknown {
    return column.value(item);
  }

  displayValue(column: TableColumn<TItem>, item: TItem): string {
    const value = this.columnValue(column, item);

    if (value === null || value === undefined || value === '') {
      return '—';
    }

    return String(value);
  }

  imageUrl(column: TableColumn<TItem>, item: TItem): string | null {
    const value = this.columnValue(column, item);

    if (typeof value !== 'string' || value.trim() === '') {
      return null;
    }

    return value;
  }

  imageAlt(column: TableColumn<TItem>, item: TItem): string {
    return column.imageAlt?.(item) ?? column.label;
  }

  fallbackText(column: TableColumn<TItem>, item: TItem): string {
    const fallback = column.fallbackText?.(item);

    if (fallback) {
      return fallback.slice(0, 2).toUpperCase();
    }

    return this.displayValue(column, item).slice(0, 2).toUpperCase();
  }

  badgeLabel(column: TableColumn<TItem>, item: TItem): string {
    const value = this.columnValue(column, item);

    return column.badge?.label?.(value, item) ?? this.displayValue(column, item);
  }

  badgeTone(column: TableColumn<TItem>, item: TItem): TableBadgeTone {
    const value = this.columnValue(column, item);

    return column.badge?.tone?.(value, item) ?? 'neutral';
  }

  visibleActions(item: TItem): TableAction<TItem>[] {
    return (this.config().actions ?? []).filter((action) => {
      if (!action.visible) {
        return true;
      }

      return action.visible(item);
    });
  }

  isActionDisabled(action: TableAction<TItem>, item: TItem): boolean {
    return action.disabled?.(item) ?? false;
  }

  emitAction(
    action: TableAction<TItem>,
    item: TItem,
    event: MouseEvent,
  ): void {
    event.stopPropagation();

    this.actionClick.emit({
      actionKey: action.key,
      item,
    });
  }

  emitRowClick(item: TItem): void {
    this.rowClick.emit(item);
  }

  dateValue(column: TableColumn<TItem>, item: TItem): string | number | Date | null | undefined {
    const value = this.columnValue(column, item);

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      value instanceof Date ||
      value === null ||
      value === undefined
    ) {
      return value;
    }

    return null;
  }
}
