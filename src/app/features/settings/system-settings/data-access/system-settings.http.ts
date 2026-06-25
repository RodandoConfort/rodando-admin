import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';

import {
  CreateSystemSettingPayload,
  SystemSetting,
  SystemSettingsQuery,
  UpdateSystemSettingPayload,
} from './system-settings.models';
import { ApiClient } from '../../../../core/api/api-client.service';
import { QueryParams } from '../../../../core/api/query-builder.util';

const SYSTEM_SETTINGS_URL = '/system-settings';

@Injectable()
export class SystemSettingsHttp {
  private readonly api = inject(ApiClient);

  getSettings(query: SystemSettingsQuery) {
    return this.api.getPaginated<SystemSetting>(SYSTEM_SETTINGS_URL, {
      params: this.buildQueryParams(query),
    });
  }

  getSettingByKey(key: string) {
    return this.api.getData<SystemSetting>(
      `${SYSTEM_SETTINGS_URL}/${encodeURIComponent(key)}`,
    );
  }

  createSetting(payload: CreateSystemSettingPayload) {
    return this.api.postData<SystemSetting, CreateSystemSettingPayload>(
      SYSTEM_SETTINGS_URL,
      payload,
    );
  }

  updateSetting(key: string, payload: UpdateSystemSettingPayload) {
    return this.api
      .patch<SystemSetting, UpdateSystemSettingPayload>(
        `${SYSTEM_SETTINGS_URL}/${encodeURIComponent(key)}`,
        payload,
      )
      .pipe(map((result) => result.data));
  }

  setSettingActive(key: string, active: boolean) {
    return this.api
      .patch<SystemSetting, { active: boolean }>(
        `${SYSTEM_SETTINGS_URL}/${encodeURIComponent(key)}/active`,
        { active },
      )
      .pipe(map((result) => result.data));
  }

  private buildQueryParams(
    query: SystemSettingsQuery,
  ): QueryParams | undefined {
    const params: QueryParams = {};

    const search = query.search?.trim();

    if (search) {
      params['q'] = search;
    }

    if (query.group) {
      params['group'] = query.group;
    }

    if (query.active !== undefined && query.active !== null) {
      params['active'] = query.active;
    }

    if (query.isPublic !== undefined && query.isPublic !== null) {
      params['isPublic'] = query.isPublic;
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
