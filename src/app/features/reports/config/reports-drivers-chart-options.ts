import { EChartsCoreOption } from 'echarts/core';

import {
  DriverActivityHourItem,
  DriverPerformanceItem,
  DriverQualityItem,
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

const money = (value: number) =>
  `$ ${Number(value ?? 0).toLocaleString('en-US', {
    maximumFractionDigits: 0,
  })}`;

const compact = (value: number) =>
  Number(value ?? 0).toLocaleString('en-US', {
    maximumFractionDigits: 1,
  });

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

function driverLabel(name: string | null | undefined, id: string): string {
  return name?.trim() || id.slice(0, 8);
}

export function buildDriverRevenueOptions(
  items: DriverPerformanceItem[],
): EChartsCoreOption {
  return {
    color: [colors.red],
    textStyle: {
      color: chartText,
      fontFamily: 'inherit',
    },
    tooltip: {
      ...tooltipBase(),
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(239, 68, 68, 0.08)',
        },
      },
      valueFormatter: (value: unknown) => money(Number(value)),
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
      axisLabel: {
        ...axisText(),
        formatter: (value: number) => money(value),
      },
      splitLine: {
        lineStyle: {
          color: chartGrid,
          type: 'dashed',
        },
      },
    },
    yAxis: {
      type: 'category',
      data: items.map((item) => driverLabel(item.driverName, item.driverId)),
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
        name: 'Ingreso bruto',
        type: 'bar',
        data: items.map((item) => item.grossRevenue),
        barMaxWidth: 18,
        itemStyle: {
          borderRadius: [0, 999, 999, 0],
          color: horizontalGradient('#fb7185', '#b91c1c'),
        },
        label: {
          show: true,
          position: 'right',
          color: chartStrongText,
          fontWeight: 800,
          formatter: (params: { value: number }) => money(Number(params.value)),
        },
      },
    ],
  };
}

export function buildDriverQualityOptions(
  items: DriverQualityItem[],
): EChartsCoreOption {
  return {
    color: [colors.orange, colors.violet, colors.rose],
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
      valueFormatter: (value: unknown) => `${compact(Number(value))}%`,
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
      right: 20,
      top: 20,
      bottom: 58,
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        ...axisText(),
        formatter: (value: number) => `${value}%`,
      },
      splitLine: {
        lineStyle: {
          color: chartGrid,
          type: 'dashed',
        },
      },
    },
    yAxis: {
      type: 'category',
      data: items.map((item) => driverLabel(item.driverName, item.driverId)),
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
        name: 'Aceptación',
        type: 'bar',
        data: items.map((item) => item.acceptanceRate),
        barMaxWidth: 12,
        itemStyle: {
          borderRadius: [0, 999, 999, 0],
          color: horizontalGradient('#fdba74', '#ea580c'),
        },
      },
      {
        name: 'Completado',
        type: 'bar',
        data: items.map((item) => item.completionRate),
        barMaxWidth: 12,
        itemStyle: {
          borderRadius: [0, 999, 999, 0],
          color: horizontalGradient('#c4b5fd', '#7c3aed'),
        },
      },
      {
        name: 'Cancelación',
        type: 'bar',
        data: items.map((item) => item.cancellationRate),
        barMaxWidth: 12,
        itemStyle: {
          borderRadius: [0, 999, 999, 0],
          color: horizontalGradient('#fda4af', '#be123c'),
        },
      },
    ],
  };
}

export function buildDriverWorstQualityOptions(
  items: DriverQualityItem[],
): EChartsCoreOption {
  return {
    color: [colors.rose],
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
      valueFormatter: (value: unknown) => `${compact(Number(value))}%`,
    },
    grid: {
      left: 18,
      right: 28,
      top: 18,
      bottom: 24,
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        ...axisText(),
        formatter: (value: number) => `${value}%`,
      },
      splitLine: {
        lineStyle: {
          color: chartGrid,
          type: 'dashed',
        },
      },
    },
    yAxis: {
      type: 'category',
      data: items.map((item) => driverLabel(item.driverName, item.driverId)),
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
        name: 'Cancelación',
        type: 'bar',
        data: items.map((item) => item.cancellationRate),
        barMaxWidth: 18,
        itemStyle: {
          borderRadius: [0, 999, 999, 0],
          color: horizontalGradient('#fda4af', '#be123c'),
        },
        label: {
          show: true,
          position: 'right',
          color: chartStrongText,
          fontWeight: 800,
          formatter: (params: { value: number }) =>
            `${compact(Number(params.value))}%`,
        },
      },
    ],
  };
}

export function buildDriverOffersOptions(
  items: DriverPerformanceItem[],
): EChartsCoreOption {
  return {
    color: [colors.orange, colors.rose],
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
      right: 24,
      top: 18,
      bottom: 58,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: items.map((item) => driverLabel(item.driverName, item.driverId)),
      axisTick: { show: false },
      axisLabel: {
        ...axisText(),
        width: 90,
        overflow: 'truncate',
      },
      axisLine: {
        lineStyle: {
          color: chartGrid,
        },
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: axisText(),
      splitLine: {
        lineStyle: {
          color: chartGrid,
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: 'Aceptadas',
        type: 'bar',
        data: items.map((item) => item.totalOffersAccepted),
        barMaxWidth: 22,
        itemStyle: {
          borderRadius: [10, 10, 0, 0],
          color: verticalGradient('#fdba74', '#ea580c'),
        },
      },
      {
        name: 'Rechazadas',
        type: 'bar',
        data: items.map((item) => item.totalOffersRejected),
        barMaxWidth: 22,
        itemStyle: {
          borderRadius: [10, 10, 0, 0],
          color: verticalGradient('#fda4af', '#be123c'),
        },
      },
    ],
  };
}

export function buildDriverActivityHoursOptions(
  items: DriverActivityHourItem[],
): EChartsCoreOption {
  const hours = Array.from(
    new Set(items.map((item) => Number(item.hour))),
  ).sort((a, b) => a - b);

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