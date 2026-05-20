import { PaginationMeta, PaginatedResult } from './pagination.model';

export interface ApiErrorPayload {
  code?: string;
  details?: unknown;
}

export interface ApiResponse<TData, TMeta = PaginationMeta> {
  success: boolean;
  message: string;
  data: TData;
  meta?: TMeta;
  error?: ApiErrorPayload;
}

export interface ApiResult<TData, TMeta = PaginationMeta> {
  data: TData;
  message: string;
  meta?: TMeta;
}

export function formatSuccessResponse<T>(
  message: string,
  data: T,
  meta?: PaginationMeta,
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    meta,
  };
}

export function isApiResponse<TData = unknown>(
  value: unknown,
): value is ApiResponse<TData> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    'message' in value &&
    'data' in value
  );
}

export function unwrapApiResponse<TData, TMeta = PaginationMeta>(
  response: ApiResponse<TData, TMeta>,
): ApiResult<TData, TMeta> {
  if (!response.success) {
    throw response;
  }

  return {
    data: response.data,
    message: response.message,
    meta: response.meta,
  };
}

export function unwrapApiData<TData, TMeta = PaginationMeta>(
  response: ApiResponse<TData, TMeta>,
): TData {
  return unwrapApiResponse(response).data;
}

export function unwrapPaginatedResponse<TItem>(
  response: ApiResponse<TItem[], PaginationMeta>,
): PaginatedResult<TItem> {
  const result = unwrapApiResponse(response);

  if (!result.meta) {
    throw new Error('La respuesta paginada no contiene meta.');
  }

  return {
    items: result.data,
    meta: result.meta,
    message: result.message,
  };
}
