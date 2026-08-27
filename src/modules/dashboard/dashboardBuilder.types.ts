export type WidgetType = 
  | 'kpi' 
  | 'bar' 
  | 'donut' 
  | 'line' 
  | 'radar' 
  | 'heatmap' 
  | 'table' 
  | 'indicator';

export interface DashboardWidgetLayout {
  colSpan: 1 | 2 | 3 | 4; // Grid column span on responsive layouts
  rowSpan?: number; // Approximate height styling
}

export interface KPIWidgetConfig {
  valuePrefix?: string;
  valueSuffix?: string;
  trendValue?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  colorTheme?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate' | 'cyan';
  subtext?: string;
}

export interface ChartWidgetConfig {
  xAxisKey?: string;
  dataKeys: string[];
  colors?: string[];
  stacked?: boolean;
  legend?: boolean;
  grid?: boolean;
  donutRadius?: number; // for donut charts
}

export interface HeatmapCell {
  x: string; // E.g., Day of week or Department
  y: string; // E.g., Hour of day or Category
  value: number;
}

export interface HeatmapWidgetConfig {
  xCategories: string[];
  yCategories: string[];
  colorScale?: 'blues' | 'greens' | 'warm' | 'purples';
  minValue?: number;
  maxValue?: number;
}

export interface TableWidgetColumn {
  key: string;
  header: string;
  type?: 'text' | 'number' | 'badge' | 'progress';
  align?: 'left' | 'center' | 'right';
  badgeColors?: Record<string, string>; // Maps value -> tailwind class
}

export interface TableWidgetConfig {
  columns: TableWidgetColumn[];
  enableSearch?: boolean;
  enableSort?: boolean;
  pageSize?: number;
}

export interface IndicatorWidgetConfig {
  min: number;
  max: number;
  thresholds?: {
    warning: number; // Values below warning are 'critical'
    success: number; // Values above success are 'healthy'
  };
  indicatorType: 'gauge' | 'progress_bar' | 'bullet_graph';
  label?: string;
}

export interface DashboardWidget {
  id: string;
  title: string;
  description?: string;
  type: WidgetType;
  layout: DashboardWidgetLayout;
  data: any; // Can be simple value, array of objects, or matrix for heatmap
  config?: {
    kpi?: KPIWidgetConfig;
    chart?: ChartWidgetConfig;
    heatmap?: HeatmapWidgetConfig;
    table?: TableWidgetConfig;
    indicator?: IndicatorWidgetConfig;
  };
}

export interface DashboardConfig {
  id: string;
  title: string;
  description?: string;
  themeColor?: string; // Tailwind primary color prefix e.g., 'indigo', 'emerald'
  filters?: {
    id: string;
    label: string;
    type: 'select' | 'text' | 'date';
    options?: string[];
    defaultValue?: string;
  }[];
  widgets: DashboardWidget[];
}
