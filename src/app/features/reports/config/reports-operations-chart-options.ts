import { EChartsCoreOption } from 'echarts/core';

import {
  DriverActivityHourItem,
  TripStatusSummaryItem,
} from '../data-access/reports.models';

const chartText = '#cbd5e1';
const chartMuted = '#94a3b8';
const chartStrongText = '#f8fafc';
const chartGrid = 'rgba(148, 163, 184, 0.18)';
const tooltipBg = 'rgba(15, 23, 42, 0.96)';
const tooltipBorder = 'rgba(248, 113, 113, 0.28)';

const colors = {
  red: '#ef4444',
  redDark: '#b91c1c',
  rose: '#e11d48',
  orange: '#f97316',
  amber: '#f59e0b',
  violet: '#8b5cf6',
  slate: '#64748b',
};

const compact = (value: number) =>
  Number(value ?? 0).toLocaleString('en-US', {
    maximumFractionDigits: 1,
  });

const money = (value: number) =>
  `$ ${Number(value ?? 0).toLocaleString('en-US', {
    maximumFractionDigits: 0,
  })}`;

function axisText() {
  return {
    color: chartText,
    fontSize: 11,
    fontWeight: 600,
  };
}

function tooltipBase() {
  return {
    backgroundColor: tooltipBg,
    borderColor: tooltipBorder,
    borderWidth: 1,
    textStyle: {
      color: chartStrongText,
      fontSize: 12,
    },
    extraCssText:
      'box-shadow: 0 18px 45px rgba(0,0,0,.35); border-radius: 12px;',
  };
}

function verticalGradient(from: string, to: string) {
  return {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: from },
      { offset: 1, color: to },
    ],
  };
}

function horizontalGradient(from: string, to: string) {
  return {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 1,
    y2: 0,
    colorStops: [
      { offset: 0, color: from },
      { offset: 1, color: to },
    ],
  };
}

export function buildTripStatusOptions(
  items: TripStatusSummaryItem[],
): EChartsCoreOption {
  return {
    color: [
      colors.red,
      colors.orange,
      colors.amber,
      colors.violet,
      colors.rose,
      colors.slate,
    ],
    textStyle: {
      color: chartText,
      fontFamily: 'inherit',
    },
    tooltip: {
      ...tooltipBase(),
      trigger: 'item',
      formatter: '{b}<br/><strong>{c}</strong> viajes · {d}%',
    },
    legend: {
      bottom: 0,
      type: 'scroll',
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        color: chartMuted,
        fontWeight: 700,
      },
    },
    series: [
      {
        name: 'Estados',
        type: 'pie',
        radius: ['52%', '76%'],
        center: ['50%', '42%'],
        minAngle: 6,
        padAngle: 2,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#211615',
          borderWidth: 3,
        },
        label: {
          color: chartStrongText,
          fontWeight: 800,
          formatter: '{b}\n{d}%',
        },
        data: items
          .map((item) => ({
            name: formatTripStatus(item.status),
            value: Number(item.total ?? 0),
          }))
          .filter((item) => item.value > 0),
      },
    ],
  };
}

export function buildCancellationOptions(
  items: TripStatusSummaryItem[],
): EChartsCoreOption {
  return {
    color: [colors.rose, colors.amber, colors.slate],
    textStyle: {
      color: chartText,
      fontFamily: 'inherit',
    },
    tooltip: {
      ...tooltipBase(),
      trigger: 'item',
      formatter: '{b}<br/><strong>{c}</strong> viajes · {d}%',
    },
    legend: {
      bottom: 0,
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        color: chartMuted,
        fontWeight: 700,
      },
    },
    series: [
      {
        name: 'Cancelaciones',
        type: 'pie',
        radius: ['54%', '78%'],
        center: ['50%', '42%'],
        minAngle: 8,
        padAngle: 2,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#211615',
          borderWidth: 3,
        },
        label: {
          color: chartStrongText,
          fontWeight: 800,
          formatter: '{b}\n{d}%',
        },
        data: items
          .map((item) => ({
            name: formatTripStatus(item.status),
            value: Number(item.total ?? 0),
          }))
          .filter((item) => item.value > 0),
      },
    ],
  };
}

export function buildDriverActivityByHourOptions(
  items: DriverActivityHourItem[],
): EChartsCoreOption {
  const hours = Array.from(new Set(items.map((item) => Number(item.hour)))).sort(
    (a, b) => a - b,
  );

  const completedByHour = hours.map((hour) =>
    items
      .filter((item) => Number(item.hour) === hour)
      .reduce((total, item) => total + Number(item.completedTrips ?? 0), 0),
  );

  const revenueByHour = hours.map((hour) =>
    items
      .filter((item) => Number(item.hour) === hour)
      .reduce((total, item) => total + Number(item.grossRevenue ?? 0), 0),
  );

  return {
    color: [colors.red, colors.amber],
    textStyle: {
      color: chartText,
      fontFamily: 'inherit',
    },
    tooltip: {
      ...tooltipBase(),
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      bottom: 0,
      icon: 'roundRect',
      itemWidth: 12,
      itemHeight: 8,
      textStyle: {
        color: chartMuted,
        fontWeight: 700,
      },
    },
    grid: {
      left: 18,
      right: 22,
      top: 30,
      bottom: 58,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: hours.map((hour) => `${String(hour).padStart(2, '0')}:00`),
      axisTick: { show: false },
      axisLabel: axisText(),
      axisLine: {
        lineStyle: {
          color: chartGrid,
        },
      },
    },
    yAxis: [
      {
        type: 'value',
        axisLabel: axisText(),
        splitLine: {
          lineStyle: {
            color: chartGrid,
            type: 'dashed',
          },
        },
      },
      {
        type: 'value',
        axisLabel: {
          ...axisText(),
          formatter: (value: number) => money(value),
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: 'Viajes completados',
        type: 'bar',
        data: completedByHour,
        barMaxWidth: 24,
        itemStyle: {
          borderRadius: [10, 10, 0, 0],
          color: verticalGradient('#fb7185', '#b91c1c'),
        },
      },
      {
        name: 'Ingreso bruto',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: colors.amber,
        },
        itemStyle: {
          color: colors.amber,
          borderColor: '#fffbeb',
          borderWidth: 2,
        },
        areaStyle: {
          color: verticalGradient(
            'rgba(245, 158, 11, 0.28)',
            'rgba(245, 158, 11, 0.02)',
          ),
        },
        data: revenueByHour,
      },
    ],
  };
}

export function buildDriverActivityRankingOptions(
  items: DriverActivityHourItem[],
): EChartsCoreOption {
  const byDriver = new Map<
    string,
    {
      label: string;
      completedTrips: number;
      grossRevenue: number;
    }
  >();

  for (const item of items) {
    const current = byDriver.get(item.driverId) ?? {
      label: item.driverName?.trim() || item.driverId.slice(0, 8),
      completedTrips: 0,
      grossRevenue: 0,
    };

    current.completedTrips += Number(item.completedTrips ?? 0);
    current.grossRevenue += Number(item.grossRevenue ?? 0);

    byDriver.set(item.driverId, current);
  }

  const rows = Array.from(byDriver.values())
    .sort((a, b) => b.completedTrips - a.completedTrips)
    .slice(0, 10);

  return {
    color: [colors.orange],
    textStyle: {
      color: chartText,
      fontFamily: 'inherit',
    },
    tooltip: {
      ...tooltipBase(),
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      valueFormatter: (value: unknown) => compact(Number(value)),
    },
    grid: {
      left: 18,
      right: 36,
      top: 18,
      bottom: 24,
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLabel: axisText(),
      splitLine: {
        lineStyle: {
          color: chartGrid,
          type: 'dashed',
        },
      },
    },
    yAxis: {
      type: 'category',
      data: rows.map((item) => item.label),
      axisTick: { show: false },
      axisLabel: {
        ...axisText(),
        width: 130,
        overflow: 'truncate',
      },
      axisLine: {
        lineStyle: {
          color: chartGrid,
        },
      },
    },
    series: [
      {
        name: 'Viajes completados',
        type: 'bar',
        data: rows.map((item) => item.completedTrips),
        barMaxWidth: 18,
        itemStyle: {
          borderRadius: [0, 999, 999, 0],
          color: horizontalGradient('#fdba74', '#ea580c'),
        },
        label: {
          show: true,
          position: 'right',
          color: chartStrongText,
          fontWeight: 800,
        },
      },
    ],
  };
}

export function formatTripStatus(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    assigning: 'Asignando',
    accepted: 'Aceptado',
    arriving: 'Llegando',
    in_progress: 'En curso',
    completed: 'Completado',
    cancelled: 'Cancelado',
    no_drivers_found: 'Sin conductor',
  };

  return labels[status] ?? status;
}