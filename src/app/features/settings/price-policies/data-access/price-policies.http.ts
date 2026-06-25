import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';

import { ApiClient } from '../../../../core/api/api-client.service';
import { QueryParams } from '../../../../core/api/query-builder.util';

import {
  CreatePricePolicyPayload,
  PricePoliciesQuery,
  PricePolicy,
  UpdatePricePolicyPayload,
} from './price-policies.models';

const PRICE_POLICIES_URL = '/price-policies';

@Injectable()
export class PricePoliciesHttp {
  private readonly api = inject(ApiClient);

  getPolicies(query: PricePoliciesQuery) {
    return this.api.getPaginated<PricePolicy>(PRICE_POLICIES_URL, {
      params: this.buildQueryParams(query),
    });
  }

  getPolicyById(id: string) {
    return this.api.getData<PricePolicy>(`${PRICE_POLICIES_URL}/${id}`);
  }

  createPolicy(payload: CreatePricePolicyPayload) {
    return this.api.postData<PricePolicy, CreatePricePolicyPayload>(
      PRICE_POLICIES_URL,
      payload,
    );
  }

  updatePolicy(id: string, payload: UpdatePricePolicyPayload) {
    return this.api
      .patch<PricePolicy, UpdatePricePolicyPayload>(
        `${PRICE_POLICIES_URL}/${id}`,
        payload,
      )
      .pipe(map((result) => result.data));
  }

  setPolicyActive(id: string, active: boolean) {
    return this.api
      .patch<PricePolicy, { active: boolean }>(
        `${PRICE_POLICIES_URL}/${id}/active`,
        { active },
      )
      .pipe(map((result) => result.data));
  }

  private buildQueryParams(query: PricePoliciesQuery): QueryParams | undefined {
    const params: QueryParams = {};

    const search = query.search?.trim();

    if (search) {
      params['q'] = search;
    }

    if (query.scopeType) {
      params['scopeType'] = query.scopeType;
    }

    if (query.cityId) {
      params['cityId'] = query.cityId;
    }

    if (query.zoneId) {
      params['zoneId'] = query.zoneId;
    }

    if (query.active !== undefined && query.active !== null) {
      params['active'] = query.active;
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
