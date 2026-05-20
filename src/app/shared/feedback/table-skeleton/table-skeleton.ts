import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-table-skeleton',
  templateUrl: './table-skeleton.html',
  styleUrl: './table-skeleton.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableSkeleton {
  readonly rows = input(5);
  readonly columns = input(5);

  readonly skeletonRows = computed(() =>
    Array.from({ length: this.rows() }),
  );

  readonly skeletonColumns = computed(() =>
    Array.from({ length: this.columns() }),
  );
}
