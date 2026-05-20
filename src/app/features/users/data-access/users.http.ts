import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';

import {
  AdminUser,
  AdminUsersQuery,
  ChangeOwnPasswordPayload,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
  UpdateOwnProfilePayload,
  UserProfile,
} from './users.models';
import { ApiClient } from '../../../core/api/api-client.service';
import { QueryParams } from '../../../core/api/query-builder.util';

const ADMIN_USERS_URL = '/admin/users';
const PROFILE_URL = '/users/profile';

@Injectable({
  providedIn: 'root',
})
export class UsersHttp {
  private readonly api = inject(ApiClient);

  getUsers(query: AdminUsersQuery) {
    return this.api.getPaginated<AdminUser>(ADMIN_USERS_URL, {
      params: this.buildUsersQueryParams(query),
    });
  }

  getUserById(id: string) {
    return this.api.getData<AdminUser>(`${ADMIN_USERS_URL}/${id}`);
  }

  createUser(payload: CreateAdminUserPayload) {
    return this.api.postData<AdminUser, CreateAdminUserPayload>(ADMIN_USERS_URL, payload);
  }

  updateUser(id: string, payload: UpdateAdminUserPayload) {
    return this.api
      .patch<AdminUser, UpdateAdminUserPayload>(`${ADMIN_USERS_URL}/${id}`, payload)
      .pipe(map((result) => result.data));
  }

  deleteUser(id: string) {
    return this.api.delete<null>(`${ADMIN_USERS_URL}/${id}`).pipe(map(() => void 0));
  }

  getProfile() {
    return this.api.getData<UserProfile>(PROFILE_URL);
  }

  updateProfile(payload: UpdateOwnProfilePayload) {
    return this.api
      .patch<UserProfile, UpdateOwnProfilePayload>(PROFILE_URL, payload)
      .pipe(map((result) => result.data));
  }

  changePassword(payload: ChangeOwnPasswordPayload) {
    return this.api
      .patch<null, ChangeOwnPasswordPayload>(`${PROFILE_URL}/password`, payload)
      .pipe(map(() => void 0));
  }

  private buildUsersQueryParams(query: AdminUsersQuery): QueryParams | undefined {
    const params: QueryParams = {};

    const search = query.search?.trim();

    if (search) {
      params['search'] = search;
    }

    if (query.userType) {
      params['userType'] = query.userType;
    }

    if (query.status) {
      params['status'] = query.status;
    }

    /**
     * No enviar page=1 ni limit=10 en la carga inicial.
     * Así el request coincide con el que ya comprobaste en Postman:
     * GET /admin/users
     */
    if (query.page && query.page > 1) {
      params['page'] = query.page;
    }

    if (query.limit && query.limit !== 10) {
      params['limit'] = query.limit;
    }

    return Object.keys(params).length > 0 ? params : undefined;
  }
}
