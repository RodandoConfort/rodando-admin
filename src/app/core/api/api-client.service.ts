import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';

import { ApiResponse, unwrapApiResponse, unwrapPaginatedResponse } from './api-response.model';
import { PaginationMeta } from './pagination.model';
import { buildHttpParams, QueryParams } from './query-builder.util';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { SHOW_ERROR_ALERT, SKIP_AUTH, SKIP_AUTH_REFRESH } from '../tokens/http-context.token';

export interface ApiRequestOptions {
  params?: QueryParams;
  showErrorAlert?: boolean;
  skipAuth?: boolean;
  skipAuthRefresh?: boolean;
  withCredentials?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  get<TData>(path: string, options?: ApiRequestOptions) {
    return this.http
      .get<ApiResponse<TData>>(this.buildUrl(path), {
        params: buildHttpParams(options?.params),
        context: this.buildContext(options),
        withCredentials: options?.withCredentials ?? false,
      })
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  getData<TData>(path: string, options?: ApiRequestOptions) {
    return this.get<TData>(path, options).pipe(map((result) => result.data));
  }

  getPaginated<TItem>(path: string, options?: ApiRequestOptions) {
    return this.http
      .get<ApiResponse<TItem[], PaginationMeta>>(this.buildUrl(path), {
        params: buildHttpParams(options?.params),
        context: this.buildContext(options),
        withCredentials: options?.withCredentials ?? false,
      })
      .pipe(map((response) => unwrapPaginatedResponse(response)));
  }

  post<TData, TPayload = unknown>(path: string, payload: TPayload, options?: ApiRequestOptions) {
    return this.http
      .post<ApiResponse<TData>>(this.buildUrl(path), payload, {
        context: this.buildContext(options),
        withCredentials: options?.withCredentials ?? false,
      })
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  postData<TData, TPayload = unknown>(
    path: string,
    payload: TPayload,
    options?: ApiRequestOptions,
  ) {
    return this.post<TData, TPayload>(path, payload, options).pipe(map((result) => result.data));
  }

  postVoid<TPayload = unknown>(path: string, payload: TPayload, options?: ApiRequestOptions) {
    return this.http.post<void>(this.buildUrl(path), payload, {
      context: this.buildContext(options),
      withCredentials: options?.withCredentials ?? false,
    });
  }

  patch<TData, TPayload = unknown>(path: string, payload: TPayload, options?: ApiRequestOptions) {
    return this.http
      .patch<ApiResponse<TData>>(this.buildUrl(path), payload, {
        context: this.buildContext(options),
        withCredentials: options?.withCredentials ?? false,
      })
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  delete<TData = null>(path: string, options?: ApiRequestOptions) {
    return this.http
      .delete<ApiResponse<TData>>(this.buildUrl(path), {
        context: this.buildContext(options),
        withCredentials: options?.withCredentials ?? false,
      })
      .pipe(map((response) => unwrapApiResponse(response)));
  }

  private buildUrl(path: string): string {
    const baseUrl = this.apiBaseUrl.replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return `${baseUrl}${normalizedPath}`;
  }

  private buildContext(options?: ApiRequestOptions): HttpContext {
    return new HttpContext()
      .set(SHOW_ERROR_ALERT, options?.showErrorAlert ?? false)
      .set(SKIP_AUTH, options?.skipAuth ?? false)
      .set(SKIP_AUTH_REFRESH, options?.skipAuthRefresh ?? false);
  }
}
