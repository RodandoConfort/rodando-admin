import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';

import { ApiClient } from '../../../core/api/api-client.service';
import { QueryParams } from '../../../core/api/query-builder.util';

import {
  AdminDriverWalletTopupPayload,
  AdminDriverWalletTopupResponse,
  BlockDriverWalletPayload,
  DriverWallet,
  DriverWalletAdminCollectorOption,
  DriverWalletCollectionPointOption,
  UnblockDriverWalletPayload,
  WalletMovement,
  WalletMovementsQuery,
  WalletStatusResponse,
} from './driver-wallet.models';

const DRIVER_BALANCE_URL = '/drivers-balance';
const ADMIN_DRIVER_WALLETS_URL = '/admin/driver-wallets';
const CASH_COLLECTION_POINTS_URL = '/cash-collection-points';
const ADMIN_USERS_URL = '/admin/users';

@Injectable()
export class DriverWalletHttp {
  private readonly api = inject(ApiClient);

  getWalletByDriverId(driverId: string) {
    return this.api.getData<DriverWallet>(`${DRIVER_BALANCE_URL}/${driverId}`);
  }

  getMovementsByDriverId(driverId: string, query: WalletMovementsQuery) {
    return this.api.getPaginated<WalletMovement>(
      `${ADMIN_DRIVER_WALLETS_URL}/${driverId}/movements`,
      {
        params: this.buildMovementsQueryParams(query),
      },
    );
  }

  topup(driverId: string, payload: AdminDriverWalletTopupPayload) {
    return this.api.postData<AdminDriverWalletTopupResponse, AdminDriverWalletTopupPayload>(
      `${DRIVER_BALANCE_URL}/${driverId}/admin-topups`,
      payload,
    );
  }

  block(driverId: string, payload: BlockDriverWalletPayload) {
    return this.api.postData<WalletStatusResponse, BlockDriverWalletPayload>(
      `${DRIVER_BALANCE_URL}/${driverId}/block`,
      payload,
    );
  }

  unblock(driverId: string, payload: UnblockDriverWalletPayload = {}) {
    return this.api.postData<WalletStatusResponse, UnblockDriverWalletPayload>(
      `${DRIVER_BALANCE_URL}/${driverId}/unblock`,
      payload,
    );
  }

  private buildMovementsQueryParams(query: WalletMovementsQuery): QueryParams | undefined {
    const params: QueryParams = {};

    const search = query.search?.trim();

    if (search) {
      params['search'] = search;
    }

    if (query.transactionId) {
      params['transactionId'] = query.transactionId;
    }

    if (query.from) {
      params['from'] = query.from;
    }

    if (query.to) {
      params['to'] = query.to;
    }

    if (query.amountMin) {
      params['amountMin'] = query.amountMin;
    }

    if (query.amountMax) {
      params['amountMax'] = query.amountMax;
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

  getCollectionPointOptions() {
    return this.api
      .getPaginated<DriverWalletCollectionPointOption>(CASH_COLLECTION_POINTS_URL, {
        params: {
          isActive: true,
          limit: 100,
        },
      })
      .pipe(map((response) => response.items));
  }

  getAdminCollectorOptions() {
    return this.api
      .getPaginated<DriverWalletAdminCollectorOption>(ADMIN_USERS_URL, {
        params: {
          userType: 'admin',
          status: 'active',
          limit: 100,
        },
      })
      .pipe(map((response) => response.items));
  }
}
