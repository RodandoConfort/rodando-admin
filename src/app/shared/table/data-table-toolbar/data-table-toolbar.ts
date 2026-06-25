import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import {
  MatButtonToggleChange,
  MatButtonToggleModule,
} from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  MatSelectChange,
  MatSelectModule,
} from '@angular/material/select';

import {
  DataTableToolbarConfig,
  TableFilterChangeEvent,
  TableFilterConfig,
  TableSegmentValue,
} from '../table.types';

@Component({
  selector: 'app-data-table-toolbar',
  standalone: true,
  imports: [
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './data-table-toolbar.html',
  styleUrl: './data-table-toolbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableToolbar {
  readonly config = input.required<DataTableToolbarConfig>();

  readonly segmentChange = output<TableSegmentValue>();
  readonly searchChange = output<string>();
  readonly filterChange = output<TableFilterChangeEvent>();

  readonly searchValue = linkedSignal(() => this.config().search?.value ?? '');

  readonly filtersCount = computed(() =>
    this.config().filters?.length ?? 0,
  );

  readonly hasManyFilters = computed(() =>
    this.filtersCount() > 3,
  );

  readonly hasFilters = computed(() =>
    this.filtersCount() > 0,
  );

  emitSegment(event: MatButtonToggleChange): void {
    this.segmentChange.emit(String(event.value));
  }

  emitSearch(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const value = target?.value ?? '';

    this.searchValue.set(value);
    this.searchChange.emit(value);
  }

  clearSearch(): void {
    this.searchValue.set('');
    this.searchChange.emit('');
  }

  emitFilter(filter: TableFilterConfig, event: MatSelectChange): void {
    this.filterChange.emit({
      key: filter.key,
      value: event.value,
    });
  }
}
