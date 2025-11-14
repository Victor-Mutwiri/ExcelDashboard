export type AppState = 'UPLOAD' | 'CONFIGURE' | 'DASHBOARD';

export interface ColumnConfig {
  id: string;
  label: string;
  isNumeric: boolean;
  formula?: string;
}

export type RowData = Record<string, string | number | boolean | null>;

export interface ParsedFile {
  sheets: Record<string, any[][]>;
  isExcel: boolean;
}

export type ChartType = 'bar' | 'line' | 'pie' | 'area';

export type Computation = 'SUM' | 'AVERAGE' | 'MIN' | 'MAX' | 'COUNT';

export interface ComputationResult {
  column: string;
  computation: Computation;
  value: number;
}

// --- WIDGETS ---
export type WidgetSize = '1/4' | '1/3' | '1/2' | '2/3' | 'full';
export type WidgetType = 'datatable' | 'chart' | 'kpi' | 'title' | 'text';

export interface BaseWidget {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  isHidden?: boolean;
}

// Chart Widget
export interface ChartWidgetConfig {
  chartType: ChartType;
  xAxisKey: string;
  yAxisKeys: string[];
  seriesConfig: Record<string, Computation>;
  title: string;
  seriesColors: Record<string, string>;
  valueColors?: Record<string, string>;
  seriesType?: Record<string, 'bar' | 'line'>;
  showDataLabels?: boolean;
  referenceLine?: {
    label: string;
    value: number;
    color: string;
  };
}
export interface ChartWidget extends BaseWidget {
  type: 'chart';
  config: ChartWidgetConfig;
}

// KPI Widget
export interface KpiWidgetConfig {
  title: string;
  valueFormula: string;
  computation: Computation;
}
export interface KpiWidget extends BaseWidget {
  type: 'kpi';
  config: KpiWidgetConfig;
}

// Data Table Widget
export interface DataTableWidget extends BaseWidget {
  type: 'datatable';
  title: string;
}

// Title Widget
export interface TitleWidgetConfig {
  text: string;
  fontFamily: string;
  fontSize: number; // in pixels
  textAlign: 'left' | 'center' | 'right';
}
export interface TitleWidget extends BaseWidget {
  type: 'title';
  config: TitleWidgetConfig;
}

// Text Widget
export interface TextWidgetConfig {
  title: string;
  content: string; // Markdown content
}
export interface TextWidget extends BaseWidget {
  type: 'text';
  config: TextWidgetConfig;
}


export type AnyWidget = DataTableWidget | ChartWidget | KpiWidget | TitleWidget | TextWidget;
// --- END WIDGETS ---

export interface SavedDashboard {
  name: string;
  createdAt: string;
  data: RowData[];
  columnConfig: ColumnConfig[];
  fileName: string;
  widgets: AnyWidget[];
}