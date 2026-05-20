export type TableColumnType =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'badge'
  | 'avatar'
  | 'image';

export type TableColumnAlign = 'start' | 'center' | 'end';

export type TableActionColor = 'primary' | 'neutral' | 'danger';

export type TableBadgeTone =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

export type TableFilterValue = string | number | boolean | null;

export interface TableBadgeConfig<TItem> {
  label?: (value: unknown, item: TItem) => string;
  tone?: (value: unknown, item: TItem) => TableBadgeTone;
}

export interface TableColumn<TItem> {
  key: string;
  label: string;
  type?: TableColumnType;
  align?: TableColumnAlign;
  visible?: boolean;
  value: (item: TItem) => unknown;

  dateFormat?: string;
  badge?: TableBadgeConfig<TItem>;

  imageAlt?: (item: TItem) => string;
  fallbackText?: (item: TItem) => string;
}

export interface TableAction<TItem> {
  key: string;
  label: string;
  icon?: string;
  color?: TableActionColor;
  visible?: (item: TItem) => boolean;
  disabled?: (item: TItem) => boolean;
}

export interface TableActionEvent<TItem> {
  actionKey: string;
  item: TItem;
}

export interface TableSearchConfig {
  placeholder?: string;
  ariaLabel?: string;
  clearAriaLabel?: string;
  value?: string;
}

export interface TableFilterOption {
  label: string;
  value: TableFilterValue;
}

export interface TableFilterConfig {
  key: string;
  label: string;
  placeholder?: string;
  value?: TableFilterValue;
  options: readonly TableFilterOption[];
}

export interface TableFilterChangeEvent {
  key: string;
  value: TableFilterValue;
}

export interface DataTableToolbarConfig {
  search?: TableSearchConfig;
  filters?: readonly TableFilterConfig[];
}

export interface DataTablePaginationConfig {
  length: number;
  pageIndex: number;
  pageSize: number;
  pageSizeOptions?: readonly number[];
  showFirstLastButtons?: boolean;
  hidePageSize?: boolean;
}

export interface DataTablePageChangeEvent {
  pageIndex: number;
  pageSize: number;
  length: number;
  previousPageIndex?: number;
}

export interface DataTableConfig<TItem> {
  columns: TableColumn<TItem>[];
  actions?: TableAction<TItem>[];
  trackBy: (item: TItem) => string | number;

  toolbar?: DataTableToolbarConfig;
  pagination?: DataTablePaginationConfig;

  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;

  loadingRows?: number;
}
