import { EChartsCoreOption } from 'echarts/core';

import { SettlementDataQualityReport } from '../data-access/reports.models';

const chartText = '#cbd5e1';
const chartMuted = '#94a3b8';
const chartStrongText = '#f8fafc';
const chartGrid = 'rgba(148, 163, 184, 0.18)';
const tooltipBg = 'rgba(15, 23, 42, 0.96)';
const tooltipBorder = 'rgba(248, 113, 113, 0.28)';

const colors = {
  red: '#ef4444',
  rose: '#e11d48',
  orange: '#f97316',
  amber: '#f59e0b',
  violet: '#8b5cf6',
};

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

export function buildSettlementQualityDonutOptions(
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
        radius: ['56%', '80%'],
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
        data: [
          {
            name: 'Con settlement',
            value: withSettlementTrips,
          },
          {
            name: 'Sin settlement',
            value: missingSettlementTrips,
          },
        ].filter((item) => item.value > 0),
      },
    ],
  };
}

export function buildSettlementQualityBarsOptions(
  quality: SettlementDataQualityReport | null,
): EChartsCoreOption {
  return {
    color: [colors.red, colors.amber, colors.violet],
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
    grid: {
      left: 18,
      right: 20,
      top: 24,
      bottom: 24,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['Completados', 'Con settlement', 'Sin settlement'],
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
        name: 'Viajes',
        type: 'bar',
        data: [
          Number(quality?.completedTrips ?? 0),
          Number(quality?.withSettlementTrips ?? 0),
          Number(quality?.missingSettlementTrips ?? 0),
        ],
        barMaxWidth: 42,
        itemStyle: {
          borderRadius: [10, 10, 0, 0],
          color: verticalGradient('#fb7185', '#b91c1c'),
        },
      },
    ],
  };
}