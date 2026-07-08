import { Injectable, inject } from '@angular/core';

import { ApiClient } from '../../../core/api/api-client.service';
import { QueryParams } from '../../../core/api/query-builder.util';

import {
  CancellationSummaryReport,
  DriverActivityHoursReport,
  DriverPerformanceReport,
  DriverQualityReport,
  FinanceSummaryReport,
  FinanceTimeSeriesReport,
  ReportsQuery,
  SettlementDataQualityReport,
  TripStatusSummaryReport,
  VehicleUsageReport,
  PassengerUsageReport,
} from './reports.models';

const ADMIN_REPORTS_URL = '/admin/reports';

@Injectable()
export class ReportsHttp {
  private readonly api = inject(ApiClient);

  getFinanceSummary(query: ReportsQuery) {
    return this.api.getData<FinanceSummaryReport>(
      `${ADMIN_REPORTS_URL}/finance/summary`,
      {
        params: this.buildBaseParams(query),
      },
    );
  }

  getFinanceTimeSeries(query: ReportsQuery) {
    return this.api.getData<FinanceTimeSeriesReport>(
      `${ADMIN_REPORTS_URL}/finance/timeseries`,
      {
        params: this.buildTimeSeriesParams(query),
      },
    );
  }

  getDriverPerformance(query: ReportsQuery) {
    return this.api.getData<DriverPerformanceReport>(
      `${ADMIN_REPORTS_URL}/drivers/performance`,
      {
        params: this.buildLimitedParams(query),
      },
    );
  }

  getDriverQualityRanking(query: ReportsQuery) {
    return this.api.getData<DriverQualityReport>(
      `${ADMIN_REPORTS_URL}/drivers/quality-ranking`,
      {
        params: this.buildLimitedParams(query),
      },
    );
  }

  getDriverWorstQualityRanking(query: ReportsQuery) {
    return this.api.getData<DriverQualityReport>(
      `${ADMIN_REPORTS_URL}/drivers/worst-quality-ranking`,
      {
        params: this.buildLimitedParams(query),
      },
    );
  }

  getDriverActivityHours(query: ReportsQuery) {
    return this.api.getData<DriverActivityHoursReport>(
      `${ADMIN_REPORTS_URL}/drivers/activity-hours`,
      {
        params: this.buildActivityHoursParams(query),
      },
    );
  }

  getVehicleUsage(query: ReportsQuery) {
    return this.api.getData<VehicleUsageReport>(
      `${ADMIN_REPORTS_URL}/vehicles/usage`,
      {
        params: this.buildLimitedParams(query),
      },
    );
  }

  getPassengerUsage(query: ReportsQuery) {
    return this.api.getData<PassengerUsageReport>(
      `${ADMIN_REPORTS_URL}/passengers/usage`,
      {
        params: this.buildLimitedParams(query),
      },
    );
  }

  getTripStatusSummary(query: ReportsQuery) {
    return this.api.getData<TripStatusSummaryReport>(
      `${ADMIN_REPORTS_URL}/trips/status-summary`,
      {
        params: this.buildBaseParams(query),
      },
    );
  }

  getCancellationSummary(query: ReportsQuery) {
    return this.api.getData<CancellationSummaryReport>(
      `${ADMIN_REPORTS_URL}/trips/cancellations`,
      {
        params: this.buildBaseParams(query),
      },
    );
  }

  getSettlementDataQuality(query: ReportsQuery) {
    return this.api.getData<SettlementDataQualityReport>(
      `${ADMIN_REPORTS_URL}/data-quality/settlement`,
      {
        params: this.buildBaseParams(query),
      },
    );
  }

  private buildBaseParams(query: ReportsQuery): QueryParams | undefined {
    const params: QueryParams = {};

    if (query.preset) {
      params['preset'] = query.preset;
    }

    return Object.keys(params).length > 0 ? params : undefined;
  }

  private buildTimeSeriesParams(query: ReportsQuery): QueryParams | undefined {
    const params: QueryParams = {
      ...this.buildBaseParams(query),
    };

    if (query.groupBy) {
      params['groupBy'] = query.groupBy;
    }

    return Object.keys(params).length > 0 ? params : undefined;
  }

  private buildLimitedParams(query: ReportsQuery): QueryParams | undefined {
    const params: QueryParams = {
      ...this.buildBaseParams(query),
    };

    if (query.limit && query.limit !== 20) {
      params['limit'] = query.limit;
    }

    return Object.keys(params).length > 0 ? params : undefined;
  }

  private buildActivityHoursParams(
    query: ReportsQuery,
  ): QueryParams | undefined {
    const params: QueryParams = {
      ...this.buildLimitedParams(query),
    };

    params['hourFrom'] = query.hourFrom;
    params['hourTo'] = query.hourTo;

    return params;
  }
}
