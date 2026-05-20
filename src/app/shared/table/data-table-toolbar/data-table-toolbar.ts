import { ChangeDetectionStrategy, Component, input, linkedSignal, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';

import { DataTableToolbarConfig, TableFilterChangeEvent, TableFilterConfig } from '../table.types';

@Component({
  selector: 'app-data-table-toolbar',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule],
  templateUrl: './data-table-toolbar.html',
  styleUrl: './data-table-toolbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableToolbar {
  readonly config = input.required<DataTableToolbarConfig>();

  readonly searchChange = output<string>();
  readonly filterChange = output<TableFilterChangeEvent>();

  readonly searchValue = linkedSignal(() => this.config().search?.value ?? '');

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
