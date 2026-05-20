import { HttpParams } from '@angular/common/http';

export type QueryParamValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined;

export type QueryParams = Record<string, QueryParamValue | QueryParamValue[]>;

export function buildHttpParams(params?: QueryParams): HttpParams | undefined {
  if (!params) {
    return undefined;
  }

  return Object.entries(params).reduce((httpParams, [key, value]) => {
    if (value === null || value === undefined || value === '') {
      return httpParams;
    }

    if (Array.isArray(value)) {
      return value.reduce((arrayParams, item) => {
        if (item === null || item === undefined || item === '') {
          return arrayParams;
        }

        return arrayParams.append(key, serializeQueryValue(item));
      }, httpParams);
    }

    return httpParams.set(key, serializeQueryValue(value));
  }, new HttpParams());
}

function serializeQueryValue(value: Exclude<QueryParamValue, null | undefined>): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}
