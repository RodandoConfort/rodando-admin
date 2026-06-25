import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';

import {
  AdminCancelTripPayload,
  AdminMarkNoDriversPayload,
  AdminOverrideTripStatusPayload,
  AdminRetryMatchingPayload,
  AdminSendTripMessagePayload,
  AdminTrip,
  AdminTripEvent,
  AdminTripsQuery,
} from './admin-trips.models';

import { ApiClient } from '../../../core/api/api-client.service';
import { QueryParams } from '../../../core/api/query-builder.util';

const ADMIN_TRIPS_URL = '/admin/trips';

@Injectable()
export class AdminTripsHttp {
  private readonly api = inject(ApiClient);

  getTrips(query: AdminTripsQuery) {
    return this.api.getPaginated<AdminTrip>(ADMIN_TRIPS_URL, {
      params: this.buildQueryParams(query),
    });
  }

  getTripById(id: string) {
    return this.api.getData<AdminTrip>(`${ADMIN_TRIPS_URL}/${id}`);
  }

  getTripEvents(id: string) {
    return this.api.getData<AdminTripEvent[]>(`${ADMIN_TRIPS_URL}/${id}/events`);
  }

  retryMatching(id: string, payload: AdminRetryMatchingPayload) {
    return this.api.postData<AdminTrip, AdminRetryMatchingPayload>(
      `${ADMIN_TRIPS_URL}/${id}/actions/retry-matching`,
      payload,
    );
  }

  markNoDrivers(id: string, payload: AdminMarkNoDriversPayload) {
    return this.api.postData<AdminTrip, AdminMarkNoDriversPayload>(
      `${ADMIN_TRIPS_URL}/${id}/actions/mark-no-drivers`,
      payload,
    );
  }

  overrideStatus(id: string, payload: AdminOverrideTripStatusPayload) {
    return this.api.postData<AdminTrip, AdminOverrideTripStatusPayload>(
      `${ADMIN_TRIPS_URL}/${id}/actions/override-status`,
      payload,
    );
  }

  cancelTrip(id: string, payload: AdminCancelTripPayload) {
    return this.api.postData<AdminTrip, AdminCancelTripPayload>(
      `${ADMIN_TRIPS_URL}/${id}/actions/cancel`,
      payload,
    );
  }

  sendMessage(id: string, payload: AdminSendTripMessagePayload) {
    return this.api
      .post<
        unknown,
        AdminSendTripMessagePayload
      >(`${ADMIN_TRIPS_URL}/${id}/actions/send-message`, payload)
      .pipe(map((result) => result.data));
  }

  private buildQueryParams(query: AdminTripsQuery): QueryParams | undefined {
    const params: QueryParams = {};

    const search = query.search?.trim();

    if (search) {
      params['q'] = search;
    }

    if (query.passengerId) {
      params['passengerId'] = query.passengerId;
    }

    if (query.driverId) {
      params['driverId'] = query.driverId;
    }

    if (query.vehicleId) {
      params['vehicleId'] = query.vehicleId;
    }

    if (query.status) {
      params['status'] = query.status;
    }

    if (query.paymentMode) {
      params['paymentMode'] = query.paymentMode;
    }

    if (query.requestedFrom) {
      params['requestedFrom'] = query.requestedFrom;
    }

    if (query.requestedTo) {
      params['requestedTo'] = query.requestedTo;
    }

    if (query.onlyActive !== undefined && query.onlyActive !== null) {
      params['onlyActive'] = query.onlyActive;
    }

    if (query.onlyStuck !== undefined && query.onlyStuck !== null) {
      params['onlyStuck'] = query.onlyStuck;
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
