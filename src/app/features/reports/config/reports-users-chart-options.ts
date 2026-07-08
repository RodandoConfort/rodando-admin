import { EChartsCoreOption } from 'echarts/core';

import { PassengerUsageItem } from '../data-access/reports.models';

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

function passengerLabel(item: PassengerUsageItem): string {
  return item.passengerName?.trim() || item.passengerId.slice(0, 8);
}

export function buildUserSpendingOptions(
  items: PassengerUsageItem[],
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
      data: items.map(passengerLabel),
      axisTick: { show: false },
      axisLabel: {
        ...axisText(),
        width: 140,
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
        name: 'Gasto total',
        type: 'bar',
        data: items.map((item) => item.totalSpent),
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

export function buildUserTripsOptions(
  items: PassengerUsageItem[],
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
      top: 22,
      bottom: 58,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: items.map(passengerLabel),
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
        name: 'Solicitados',
        type: 'bar',
        data: items.map((item) => item.requestedTrips),
        barMaxWidth: 22,
        itemStyle: {
          borderRadius: [10, 10, 0, 0],
          color: verticalGradient('#fdba74', '#ea580c'),
        },
      },
      {
        name: 'Completados',
        type: 'bar',
        data: items.map((item) => item.completedTrips),
        barMaxWidth: 22,
        itemStyle: {
          borderRadius: [10, 10, 0, 0],
          color: verticalGradient('#c4b5fd', '#7c3aed'),
        },
      },
      {
        name: 'Cancelados',
        type: 'bar',
        data: items.map((item) => item.cancelledTrips),
        barMaxWidth: 22,
        itemStyle: {
          borderRadius: [10, 10, 0, 0],
          color: verticalGradient('#fda4af', '#be123c'),
        },
      },
    ],
  };
}

export function buildUserKmOptions(
  items: PassengerUsageItem[],
): EChartsCoreOption {
  return {
    color: [colors.amber],
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
          color: 'rgba(245, 158, 11, 0.08)',
        },
      },
      valueFormatter: (value: unknown) => `${compact(Number(value))} km`,
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
        formatter: (value: number) => `${compact(value)} km`,
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
      data: items.map(passengerLabel),
      axisTick: { show: false },
      axisLabel: {
        ...axisText(),
        width: 140,
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
        name: 'Km recorridos',
        type: 'bar',
        data: items.map((item) => item.totalKm),
        barMaxWidth: 18,
        itemStyle: {
          borderRadius: [0, 999, 999, 0],
          color: horizontalGradient('#fcd34d', '#d97706'),
        },
        label: {
          show: true,
          position: 'right',
          color: chartStrongText,
          fontWeight: 800,
          formatter: (params: { value: number }) =>
            `${compact(Number(params.value))} km`,
        },
      },
    ],
  };
}

export function buildUserSpendingShareOptions(
  items: PassengerUsageItem[],
): EChartsCoreOption {
  return {
    color: [colors.red, colors.orange, colors.violet, colors.rose, colors.amber, colors.slate],
    textStyle: {
      color: chartText,
      fontFamily: 'inherit',
    },
    tooltip: {
      ...tooltipBase(),
      trigger: 'item',
      formatter: '{b}<br/><strong>{c}</strong> · {d}%',
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
        name: 'Gasto por usuario',
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
        labelLine: {
          lineStyle: {
            color: chartGrid,
          },
        },
        data: items
          .map((item) => ({
            name: passengerLabel(item),
            value: Number(item.totalSpent ?? 0),
          }))
          .filter((item) => item.value > 0),
      },
    ],
  };
}