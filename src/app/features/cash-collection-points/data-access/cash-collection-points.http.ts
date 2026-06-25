import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';

import { ApiClient } from '../../../core/api/api-client.service';
import { QueryParams } from '../../../core/api/query-builder.util';

import {
  CashCollectionPoint,
  CashCollectionPointsQuery,
  CashCollectionRecord,
  CashCollectionRecordsQuery,
  CreateCashCollectionPointPayload,
  UpdateCashCollectionPointPayload,
} from './cash-collection-points.models';

const CASH_COLLECTION_POINTS_URL = '/cash-collection-points';

@Injectable()
export class CashCollectionPointsHttp {
  private readonly api = inject(ApiClient);

  getPoints(query: CashCollectionPointsQuery) {
    return this.api.getPaginated<CashCollectionPoint>(
      CASH_COLLECTION_POINTS_URL,
      {
        params: this.buildPointsQueryParams(query),
      },
    );
  }

  getPointById(id: string) {
    return this.api.getData<CashCollectionPoint>(
      `${CASH_COLLECTION_POINTS_URL}/${id}`,
    );
  }

  createPoint(payload: CreateCashCollectionPointPayload) {
    return this.api.postData<
      CashCollectionPoint,
      CreateCashCollectionPointPayload
    >(CASH_COLLECTION_POINTS_URL, payload);
  }

  updatePoint(id: string, payload: UpdateCashCollectionPointPayload) {
    return this.api
      .patch<CashCollectionPoint, UpdateCashCollectionPointPayload>(
        `${CASH_COLLECTION_POINTS_URL}/${id}`,
        payload,
      )
      .pipe(map((result) => result.data));
  }

  deletePoint(id: string) {
    return this.api
      .delete<null>(`${CASH_COLLECTION_POINTS_URL}/${id}`)
      .pipe(map(() => void 0));
  }

  getPointRecords(pointId: string, query: CashCollectionRecordsQuery) {
    return this.api.getPaginated<CashCollectionRecord>(
      `${CASH_COLLECTION_POINTS_URL}/${pointId}/records`,
      {
        params: this.buildRecordsQueryParams(query),
      },
    );
  }

  private buildPointsQueryParams(
    query: CashCollectionPointsQuery,
  ): QueryParams | undefined {
    const params: QueryParams = {};

    const search = query.search?.trim();

    if (search) {
      params['search'] = search;
    }

    if (query.isActive !== undefined && query.isActive !== null) {
      params['isActive'] = query.isActive;
    }

    if (query.page && query.page > 1) {
      params['page'] = query.page;
    }

    if (query.limit && query.limit !== 10) {
      params['limit'] = query.limit;
    }

    return Object.keys(params).length > 0 ? params : undefined;
  }

  private buildRecordsQueryParams(
    query: CashCollectionRecordsQuery,
  ): QueryParams | undefined {
    const params: QueryParams = {};

    const search = query.search?.trim();

    if (search) {
      params['search'] = search;
    }

    if (query.status) {
      params['status'] = query.status;
    }

    if (query.from) {
      params['from'] = query.from;
    }

    if (query.to) {
      params['to'] = query.to;
    }

    if (query.sortBy) {
      params['sortBy'] = query.sortBy;
    }

    if (query.sortDir) {
      params['sortDir'] = query.sortDir;
    }

    if (query.page && query.page > 1) {
      params['page'] = query.page;
    }

    if (query.limit && query.limit !== 10) {
      params['limit'] = query.limit;
    }

    return Object.keys(params).length > 0 ? params : undefined;
  }
}
