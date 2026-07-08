import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';

import {
  REPORT_GROUP_BY_OPTIONS_BY_PRESET,
  ReportGroupBy,
  ReportPreset,
} from '../../data-access/reports.models';

export interface ReportsHourRange {
  hourFrom: number;
  hourTo: number;
}

@Component({
  selector: 'app-reports-filters-bar',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
  ],
  templateUrl: './reports-filters-bar.html',
  styleUrl: './reports-filters-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsFiltersBar {
  readonly preset = input.required<ReportPreset>();
  readonly groupBy = input<ReportGroupBy>('day');
  readonly limit = input(20);
  readonly hourFrom = input(0);
  readonly hourTo = input(23);

  readonly showGroupBy = input(false);
  readonly showLimit = input(false);
  readonly showHours = input(false);
  readonly disabled = input(false);

  readonly presetChange = output<ReportPreset>();
  readonly groupByChange = output<ReportGroupBy>();
  readonly limitChange = output<number>();
  readonly hoursChange = output<ReportsHourRange>();
  readonly refresh = output<void>();

  readonly limitOptions = [10, 20, 50, 100];
  readonly hourOptions = Array.from({ length: 24 }, (_, hour) => hour);

  readonly groupByOptions = computed(
    () => REPORT_GROUP_BY_OPTIONS_BY_PRESET[this.preset()],
  );

  onPresetChange(event: MatSelectChange): void {
    this.presetChange.emit(event.value as ReportPreset);
  }

  onGroupByChange(event: MatSelectChange): void {
    this.groupByChange.emit(event.value as ReportGroupBy);
  }

  onLimitChange(event: MatSelectChange): void {
    this.limitChange.emit(Number(event.value));
  }

  onHourFromChange(event: MatSelectChange): void {
    this.hoursChange.emit({
      hourFrom: Number(event.value),
      hourTo: this.hourTo(),
    });
  }

  onHourToChange(event: MatSelectChange): void {
    this.hoursChange.emit({
      hourFrom: this.hourFrom(),
      hourTo: Number(event.value),
    });
  }

  formatHour(hour: number): string {
    return `${String(hour).padStart(2, '0')}:00`;
  }
}