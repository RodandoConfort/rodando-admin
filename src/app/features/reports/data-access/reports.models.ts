export type ReportPreset =
  | 'today'
  | 'last_7_days'
  | 'last_30_days'
  | 'last_3_months'
  | 'last_6_months'
  | 'last_year';

export type ReportGroupBy =
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year';

export interface ReportsQuery {
  preset: ReportPreset;
  groupBy: ReportGroupBy;
  limit: number;
  hourFrom: number;
  hourTo: number;
}

export interface ReportPeriod {
  from: string;
  to: string;
}

export interface FinanceSummaryReport {
  period: ReportPeriod;
  completedTrips: number;
  grossRevenue: number;
  platformRevenue: number;
  driverEarnings: number;
  discountsTotal: number;
  bookingFeesTotal: number;
  extraFeesTotal: number;
  averageTripValue: number;
  missingSettlementTrips: number;
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
  period: ReportPeriod;
  groupBy: ReportGroupBy;
  items: FinanceTimeSeriesItem[];
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
  period: ReportPeriod;
  limit: number;
  items: DriverPerformanceItem[];
}

export interface DriverQualityItem {
  driverId: string;
  driverName: string;
  acceptanceRate: number;
  cancellationRate: number;
  completionRate: number;
  averageRating: number;
  totalTripsCompleted: number;
  totalOffersReceived: number;
  totalOffersAccepted: number;
  totalOffersRejected: number;
  totalTripsCancelledByDriver: number;
  baseScore: number;
}

export interface DriverQualityReport {
  limit: number;
  items: DriverQualityItem[];
}

export interface DriverActivityHourItem {
  driverId: string;
  driverName: string;
  hour: number;
  completedTrips: number;
  acceptedTrips: number;
  startedTrips: number;
  grossRevenue: number;
  totalKm: number;
}

export interface DriverActivityHoursReport {
  period: ReportPeriod;
  hourFrom: number;
  hourTo: number;
  limit: number;
  items: DriverActivityHourItem[];
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
  period: ReportPeriod;
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
  period: ReportPeriod;
  limit: number;
  items: PassengerUsageItem[];
}

export interface TripStatusSummaryItem {
  status: string;
  total: number;
}

export interface TripStatusSummaryReport {
  period: ReportPeriod;
  items: TripStatusSummaryItem[];
}

export interface CancellationSummaryReport {
  period: ReportPeriod;
  items: TripStatusSummaryItem[];
}

export interface SettlementDataQualityReport {
  period: ReportPeriod;
  completedTrips: number;
  withSettlementTrips: number;
  missingSettlementTrips: number;
}

export interface FinanceReportsData {
  summary: FinanceSummaryReport;
  timeSeries: FinanceTimeSeriesReport;
  settlementQuality: SettlementDataQualityReport;
}

export interface DriverReportsData {
  performance: DriverPerformanceReport;
  qualityRanking: DriverQualityReport;
  worstQualityRanking: DriverQualityReport;
  activityHours: DriverActivityHoursReport;
}

export interface VehicleReportsData {
  usage: VehicleUsageReport;
}

export interface UserReportsData {
  passengers: PassengerUsageReport;
}

export interface OperationsReportsData {
  tripStatus: TripStatusSummaryReport;
  cancellations: CancellationSummaryReport;
  driverActivity: DriverActivityHoursReport;
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

export const REPORT_GROUP_BY_OPTIONS: Array<{
  label: string;
  value: ReportGroupBy;
}> = [
  { label: 'Día', value: 'day' },
  { label: 'Semana', value: 'week' },
  { label: 'Mes', value: 'month' },
  { label: 'Trimestre', value: 'quarter' },
  { label: 'Año', value: 'year' },
];

export const REPORT_GROUP_BY_BY_PRESET: Record<ReportPreset, ReportGroupBy> = {
  today: 'day',
  last_7_days: 'day',
  last_30_days: 'day',
  last_3_months: 'week',
  last_6_months: 'month',
  last_year: 'month',
};

export interface ReportGroupByOption {
  label: string;
  value: ReportGroupBy;
}

export const REPORT_GROUP_BY_OPTIONS_BY_PRESET: Record<
  ReportPreset,
  ReportGroupByOption[]
> = {
  today: [{ label: 'Día', value: 'day' }],

  last_7_days: [{ label: 'Día', value: 'day' }],

  last_30_days: [
    { label: 'Día', value: 'day' },
    { label: 'Semana', value: 'week' },
  ],

  last_3_months: [
    { label: 'Semana', value: 'week' },
    { label: 'Mes', value: 'month' },
  ],

  last_6_months: [
    { label: 'Semana', value: 'week' },
    { label: 'Mes', value: 'month' },
    { label: 'Trimestre', value: 'quarter' },
  ],

  last_year: [
    { label: 'Mes', value: 'month' },
    { label: 'Trimestre', value: 'quarter' },
    { label: 'Año', value: 'year' },
  ],
};

export function isGroupByAllowedForPreset(
  preset: ReportPreset,
  groupBy: ReportGroupBy,
): boolean {
  return REPORT_GROUP_BY_OPTIONS_BY_PRESET[preset].some(
    (option) => option.value === groupBy,
  );
}
