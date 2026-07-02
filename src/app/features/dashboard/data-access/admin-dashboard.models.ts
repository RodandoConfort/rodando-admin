export type ReportPreset =
  | 'today'
  | 'last_7_days'
  | 'last_30_days'
  | 'last_3_months'
  | 'last_6_months'
  | 'last_year';

export type ReportGroupBy = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface DashboardReportsQuery {
  preset: ReportPreset;
  groupBy: ReportGroupBy;
}

export interface AdminOverviewReport {
  period: {
    from: string;
    to: string;
  };
  trips: {
    total: number;
    completed: number;
    cancelled: number;
    noDriversFound: number;
    completionRate: number;
    cancellationRate: number;
  };
  finance: {
    grossRevenue: number;
    platformRevenue: number;
    driverEarnings: number;
    discountsTotal: number;
    bookingFeesTotal: number;
    extraFeesTotal: number;
    averageTripValue: number;
    missingSettlementTrips: number;
  };
  distance: {
    totalKm: number;
    averageKmPerTrip: number;
    totalMinutes: number;
  };
  drivers: {
    activeDrivers: number;
    driversWithCompletedTrips: number;
  };
  passengers: {
    activePassengers: number;
  };
}

export interface FinanceTimeSeriesItem {
  period: string;
  completedTrips: number;
  grossRevenue: number;
  platformRevenue: number;
  driverEarnings: number;
  averageTripValue: number;
}

export interface FinanceTimeSeriesReport {
  period: {
    from: string;
    to: string;
  };
  groupBy: ReportGroupBy;
  items: FinanceTimeSeriesItem[];
}

export interface TripStatusSummaryItem {
  status: string;
  total: number;
}

export interface TripStatusSummaryReport {
  period: {
    from: string;
    to: string;
  };
  items: TripStatusSummaryItem[];
}

export interface DriverPerformanceItem {
  driverId: string;
  driverName: string;
  completedTrips: number;
  cancelledTrips: number;
  totalTrips: number;
  grossRevenue: number;
  platformRevenue: number;
  driverEarnings: number;
  totalKm: number;
  averageTripValue: number;
  acceptanceRate: number;
  cancellationRate: number;
  completionRate: number;
  averageRating: number;
  baseScore: number;
  totalOffersReceived: number;
  totalOffersAccepted: number;
  totalOffersRejected: number;
}

export interface DriverPerformanceReport {
  period: {
    from: string;
    to: string;
  };
  limit: number;
  items: DriverPerformanceItem[];
}

export interface VehicleUsageItem {
  vehicleId: string;
  vehicleLabel: string;
  completedTrips: number;
  totalKm: number;
  totalMinutes: number;
  grossRevenue: number;
}

export interface VehicleUsageReport {
  period: {
    from: string;
    to: string;
  };
  limit: number;
  items: VehicleUsageItem[];
}

export interface PassengerUsageItem {
  passengerId: string;
  passengerName: string;
  requestedTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  totalKm: number;
  totalSpent: number;
  averageTripValue: number;
}

export interface PassengerUsageReport {
  period: {
    from: string;
    to: string;
  };
  limit: number;
  items: PassengerUsageItem[];
}

export interface SettlementDataQualityReport {
  period: {
    from: string;
    to: string;
  };
  completedTrips: number;
  withSettlementTrips: number;
  missingSettlementTrips: number;
}

export interface AdminDashboardData {
  overview: AdminOverviewReport;
  financeTimeSeries: FinanceTimeSeriesReport;
  tripStatusSummary: TripStatusSummaryReport;
  driverPerformance: DriverPerformanceReport;
  vehicleUsage: VehicleUsageReport;
  passengerUsage: PassengerUsageReport;
  settlementDataQuality: SettlementDataQualityReport;
}

export const REPORT_PRESET_OPTIONS: Array<{
  label: string;
  value: ReportPreset;
}> = [
  { label: 'Hoy', value: 'today' },
  { label: 'Últimos 7 días', value: 'last_7_days' },
  { label: 'Últimos 30 días', value: 'last_30_days' },
  { label: 'Últimos 3 meses', value: 'last_3_months' },
  { label: 'Últimos 6 meses', value: 'last_6_months' },
  { label: 'Último año', value: 'last_year' },
];

export const REPORT_GROUP_BY_BY_PRESET: Record<ReportPreset, ReportGroupBy> = {
  today: 'day',
  last_7_days: 'day',
  last_30_days: 'day',
  last_3_months: 'week',
  last_6_months: 'month',
  last_year: 'month',
};
