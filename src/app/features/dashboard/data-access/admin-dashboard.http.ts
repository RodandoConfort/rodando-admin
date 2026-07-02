import { Injectable, inject } from '@angular/core';

import { ApiClient } from '../../../core/api/api-client.service';
import { QueryParams } from '../../../core/api/query-builder.util';

import {
  AdminOverviewReport,
  DashboardReportsQuery,
  DriverPerformanceReport,
  FinanceTimeSeriesReport,
  PassengerUsageReport,
  SettlementDataQualityReport,
  TripStatusSummaryReport,
  VehicleUsageReport,
} from './admin-dashboard.models';

const ADMIN_REPORTS_URL = '/admin/reports';

@Injectable()
export class AdminDashboardHttp {
  private readonly api = inject(ApiClient);

  getOverview(query: DashboardReportsQuery) {
    return this.api.getData<AdminOverviewReport>(
      `${ADMIN_REPORTS_URL}/overview`,
      {
        params: this.buildBaseQueryParams(query),
      },
    );
  }

  getFinanceTimeSeries(query: DashboardReportsQuery) {
    return this.api.getData<FinanceTimeSeriesReport>(
      `${ADMIN_REPORTS_URL}/finance/timeseries`,
      {
        params: this.buildFinanceTimeSeriesQueryParams(query),
      },
    );
  }

  getTripStatusSummary(query: DashboardReportsQuery) {
    return this.api.getData<TripStatusSummaryReport>(
      `${ADMIN_REPORTS_URL}/trips/status-summary`,
      {
        params: this.buildBaseQueryParams(query),
      },
    );
  }

  getDriverPerformance(query: DashboardReportsQuery, limit = 5) {
    return this.api.getData<DriverPerformanceReport>(
      `${ADMIN_REPORTS_URL}/drivers/performance`,
      {
        params: this.buildLimitedQueryParams(query, limit),
      },
    );
  }

  getVehicleUsage(query: DashboardReportsQuery, limit = 5) {
    return this.api.getData<VehicleUsageReport>(
      `${ADMIN_REPORTS_URL}/vehicles/usage`,
      {
        params: this.buildLimitedQueryParams(query, limit),
      },
    );
  }

  getPassengerUsage(query: DashboardReportsQuery, limit = 5) {
    return this.api.getData<PassengerUsageReport>(
      `${ADMIN_REPORTS_URL}/passengers/usage`,
      {
        params: this.buildLimitedQueryParams(query, limit),
      },
    );
  }

  getSettlementDataQuality(query: DashboardReportsQuery) {
    return this.api.getData<SettlementDataQualityReport>(
      `${ADMIN_REPORTS_URL}/data-quality/settlement`,
      {
        params: this.buildBaseQueryParams(query),
      },
    );
  }

  private buildBaseQueryParams(
    query: DashboardReportsQuery,
  ): QueryParams | undefined {
    const params: QueryParams = {};

    if (query.preset) {
      params['preset'] = query.preset;
    }

    return Object.keys(params).length > 0 ? params : undefined;
  }

  private buildFinanceTimeSeriesQueryParams(
    query: DashboardReportsQuery,
  ): QueryParams | undefined {
    const params: QueryParams = {
      ...this.buildBaseQueryParams(query),
    };

    if (query.groupBy) {
      params['groupBy'] = query.groupBy;
    }

    return Object.keys(params).length > 0 ? params : undefined;
  }

  private buildLimitedQueryParams(
    query: DashboardReportsQuery,
    limit: number,
  ): QueryParams | undefined {
    const params: QueryParams = {
      ...this.buildBaseQueryParams(query),
    };

    if (limit && limit !== 10) {
      params['limit'] = limit;
    }

    return Object.keys(params).length > 0 ? params : undefined;
  }
}
