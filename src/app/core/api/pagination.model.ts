export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pageCount: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage?: number | null;
  prevPage?: number | null;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<TItem> {
  items: TItem[];
  meta: PaginationMeta;
  message: string;
}

export const DEFAULT_PAGINATION_QUERY: Required<PaginationQuery> = {
  page: 1,
  limit: 10,
};

export function normalizePaginationQuery(
  query: PaginationQuery = {},
): Required<PaginationQuery> {
  return {
    page: Math.max(1, Number(query.page) || DEFAULT_PAGINATION_QUERY.page),
    limit: Math.max(1, Number(query.limit) || DEFAULT_PAGINATION_QUERY.limit),
  };
}
