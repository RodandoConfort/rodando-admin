import { EChartsCoreOption } from 'echarts/core';

import {
  DriverPerformanceItem,
  FinanceTimeSeriesItem,
  TripStatusSummaryItem,
  VehicleUsageItem,
} from '../data-access/admin-dashboard.models';

const chartText = '#cbd5e1';
const chartMuted = '#94a3b8';
const chartStrongText = '#f8fafc';
const chartGrid = 'rgba(148, 163, 184, 0.18)';
const chartTooltipBg = 'rgba(15, 23, 42, 0.96)';
const chartTooltipBorder = 'rgba(248, 113, 113, 0.28)';

const palette = {
  red: '#ef4444',
  redDark: '#b91c1c',
  rose: '#e11d48',
  orange: '#f97316',
  amber: '#f59e0b',
  violet: '#8b5cf6',
  purple: '#a855f7',
  slate: '#64748b',
  zinc: '#a1a1aa',
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
    backgroundColor: chartTooltipBg,
    borderColor: chartTooltipBorder,
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

export function buildFinanceChartOptions(
  items: FinanceTimeSeriesItem[],
): EChartsCoreOption {
  return {
    color: [palette.red, palette.orange, palette.violet],
    textStyle: {
      color: chartText,
      fontFamily: 'inherit',
    },
    tooltip: {
      ...tooltipBase(),
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        lineStyle: {
          color: 'rgba(248, 113, 113, 0.45)',
        },
        crossStyle: {
          color: 'rgba(248, 113, 113, 0.45)',
        },
      },
      valueFormatter: (value: unknown) => money(Number(value)),
    },
    legend: {
      bottom: 0,
      textStyle: {
        color: chartMuted,
        fontWeight: 600,
      },
      itemWidth: 12,
      itemHeight: 8,
      icon: 'roundRect',
    },
    grid: {
      left: 18,
      right: 20,
      top: 34,
      bottom: 58,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: items.map((item) => item.period),
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
      {
        type: 'value',
        axisLabel: {
          ...axisText(),
          formatter: (value: number) => compact(value),
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: 'Ingreso bruto',
        type: 'bar',
        data: items.map((item) => item.grossRevenue),
        barMaxWidth: 24,
        itemStyle: {
          borderRadius: [10, 10, 0, 0],
          color: verticalGradient('#fb7185', '#b91c1c'),
        },
      },
      {
        name: 'Ingreso plataforma',
        type: 'bar',
        data: items.map((item) => item.platformRevenue),
        barMaxWidth: 24,
        itemStyle: {
          borderRadius: [10, 10, 0, 0],
          color: verticalGradient('#fdba74', '#c2410c'),
        },
      },
      {
        name: 'Viajes completados',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        showSymbol: true,
        lineStyle: {
          width: 3,
          color: palette.violet,
        },
        itemStyle: {
          color: palette.violet,
          borderColor: '#f5f3ff',
          borderWidth: 2,
        },
        areaStyle: {
          color: verticalGradient('rgba(139, 92, 246, 0.32)', 'rgba(139, 92, 246, 0.02)'),
        },
        data: items.map((item) => item.completedTrips),
      },
    ],
  };
}

export function buildTripStatusChartOptions(
  items: TripStatusSummaryItem[],
): EChartsCoreOption {
  return {
    color: [
      palette.red,
      palette.orange,
      palette.amber,
      palette.violet,
      palette.rose,
      palette.slate,
      palette.zinc,
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
      textStyle: {
        color: chartMuted,
        fontWeight: 600,
      },
      itemWidth: 10,
      itemHeight: 10,
      icon: 'circle',
    },
    series: [
      {
        name: 'Viajes',
        type: 'pie',
        radius: ['46%', '76%'],
        center: ['50%', '42%'],
        roseType: 'radius',
        minAngle: 8,
        padAngle: 2,
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#211615',
          borderWidth: 3,
        },
        label: {
          color: chartStrongText,
          fontWeight: 700,
          formatter: '{b}\n{d}%',
        },
        labelLine: {
          length: 12,
          length2: 8,
          lineStyle: {
            color: chartGrid,
          },
        },
        emphasis: {
          scale: true,
          scaleSize: 8,
          itemStyle: {
            shadowBlur: 24,
            shadowColor: 'rgba(0,0,0,.45)',
          },
        },
        data: items.map((item) => ({
          name: formatTripStatus(item.status),
          value: item.total,
        })),
      },
    ],
  };
}

export function buildVehicleUsageChartOptions(
  items: VehicleUsageItem[],
): EChartsCoreOption {
  return {
    color: [palette.orange],
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
          color: 'rgba(249, 115, 22, 0.08)',
        },
      },
      valueFormatter: (value: unknown) => `${compact(Number(value))} km`,
    },
    grid: {
      left: 18,
      right: 22,
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
      data: items.map((item) => vehicleLabel(item)),
      axisTick: { show: false },
      axisLabel: {
        ...axisText(),
        width: 120,
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
          color: horizontalGradient('#fed7aa', '#ea580c'),
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

export function buildTopDriversChartOptions(
  items: DriverPerformanceItem[],
): EChartsCoreOption {
  return {
    color: [palette.rose],
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
          color: 'rgba(225, 29, 72, 0.08)',
        },
      },
      valueFormatter: (value: unknown) => money(Number(value)),
    },
    grid: {
      left: 18,
      right: 22,
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
      data: items.map((item) => driverLabel(item)),
      axisTick: { show: false },
      axisLabel: {
        ...axisText(),
        width: 120,
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
          color: horizontalGradient('#fda4af', '#be123c'),
        },
        label: {
          show: true,
          position: 'right',
          color: chartStrongText,
          fontWeight: 800,
          formatter: (params: { value: number }) =>
            money(Number(params.value)),
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

export function shortId(value: string | null | undefined): string {
  if (!value) {
    return 'N/A';
  }

  return value.length > 8 ? value.slice(0, 8) : value;
}

export function driverLabel(item: DriverPerformanceItem): string {
  return item.driverName?.trim() || shortId(item.driverId);
}

export function vehicleLabel(item: VehicleUsageItem): string {
  return item.vehicleLabel?.trim() || shortId(item.vehicleId);
}
