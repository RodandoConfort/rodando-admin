import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import {
  DataTablePageChangeEvent,
  DataTablePaginationConfig,
} from '../table.types';

@Component({
  selector: 'app-data-table-pagination',
  standalone: true,
  imports: [MatPaginatorModule],
  templateUrl: './data-table-pagination.html',
  styleUrl: './data-table-pagination.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTablePagination {
  readonly config = input.required<DataTablePaginationConfig>();

  readonly pageChange = output<DataTablePageChangeEvent>();

  emitPageChange(event: PageEvent): void {
    this.pageChange.emit({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
      length: event.length,
      previousPageIndex: event.previousPageIndex,
    });
  }
}
