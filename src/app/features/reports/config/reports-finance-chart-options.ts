import { EChartsCoreOption } from 'echarts/core';

import {
  FinanceSummaryReport,
  FinanceTimeSeriesItem,
  SettlementDataQualityReport,
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

function axisText() {
  return {
    color: chartText,
    fontSize: 11,
    fontWeight: 600,
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

export function buildFinanceRevenueOptions(
  items: FinanceTimeSeriesItem[],
): EChartsCoreOption {
  return {
    color: [colors.red, colors.orange, colors.violet],
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
      valueFormatter: (value: unknown) => money(Number(value)),
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
        lineStyle: {
          width: 3,
          color: colors.violet,
        },
        itemStyle: {
          color: colors.violet,
          borderColor: '#f5f3ff',
          borderWidth: 2,
        },
        areaStyle: {
          color: verticalGradient(
            'rgba(139, 92, 246, 0.32)',
            'rgba(139, 92, 246, 0.02)',
          ),
        },
        data: items.map((item) => item.completedTrips),
      },
    ],
  };
}

export function buildAverageTicketOptions(
  items: FinanceTimeSeriesItem[],
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
      valueFormatter: (value: unknown) => money(Number(value)),
    },
    grid: {
      left: 18,
      right: 20,
      top: 24,
      bottom: 24,
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
    yAxis: {
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
    series: [
      {
        name: 'Ticket promedio',
        type: 'line',
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
            'rgba(245, 158, 11, 0.34)',
            'rgba(245, 158, 11, 0.03)',
          ),
        },
        data: items.map((item) => item.averageTripValue),
      },
    ],
  };
}

export function buildFinanceCompositionOptions(
  summary: FinanceSummaryReport | null,
): EChartsCoreOption {
  const platformRevenue = Number(summary?.platformRevenue ?? 0);
  const driverEarnings = Number(summary?.driverEarnings ?? 0);
  const discountsTotal = Number(summary?.discountsTotal ?? 0);
  const extras =
    Number(summary?.bookingFeesTotal ?? 0) + Number(summary?.extraFeesTotal ?? 0);

  return {
    color: [colors.red, colors.orange, colors.violet, colors.slate],
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
        name: 'Composición',
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
        data: [
          {
            name: 'Plataforma',
            value: platformRevenue,
          },
          {
            name: 'Drivers',
            value: driverEarnings,
          },
          {
            name: 'Descuentos',
            value: discountsTotal,
          },
          {
            name: 'Fees / extras',
            value: extras,
          },
        ],
      },
    ],
  };
}

export function buildSettlementQualityOptions(
  quality: SettlementDataQualityReport | null,
): EChartsCoreOption {
  const withSettlementTrips = Number(quality?.withSettlementTrips ?? 0);
  const missingSettlementTrips = Number(quality?.missingSettlementTrips ?? 0);

  return {
    color: [colors.red, colors.amber],
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
        name: 'Settlement',
        type: 'pie',
        radius: ['58%', '78%'],
        center: ['50%', '42%'],
        minAngle: 8,
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
        data: [
          {
            name: 'Con settlement',
            value: withSettlementTrips,
          },
          {
            name: 'Sin settlement',
            value: missingSettlementTrips,
          },
        ],
      },
    ],
  };
}