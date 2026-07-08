import { provideEchartsCore } from 'ngx-echarts';

import * as echarts from 'echarts/core';
import {
  BarChart,
  HeatmapChart,
  LineChart,
  PieChart,
} from 'echarts/charts';
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  HeatmapChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  DataZoomComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

export function provideReportsEcharts() {
  return provideEchartsCore({ echarts });
}
