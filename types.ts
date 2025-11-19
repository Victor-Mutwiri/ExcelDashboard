
export type AppState = 'UPLOAD' | 'CONFIGURE' | 'TEMPLATE_SELECTION' | 'DASHBOARD';

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
export type WidgetType = 'datatable' | 'chart' | 'kpi' | 'title' | 'text' | 'ai' | 'pivot' | 'rank';

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

// Pivot Table Widget
export interface PivotWidgetConfig {
  title: string;
  rowFields: string[];    // Fields to group by vertically
  colFields: string[];    // Fields to group by horizontally
  valueField: string;     // Field to aggregate
  aggregation: Computation;
}
export interface PivotWidget extends BaseWidget {
  type: 'pivot';
  config: PivotWidgetConfig;
}

// Rank Widget
export interface RankWidgetConfig {
  title: string;
  categoryField: string; // The item name (e.g., Salesperson)
  valueField: string;    // The metric (e.g., Revenue)
  aggregation: Computation; // How to sum up duplicate categories
  limit: number;         // Top N
  order: 'desc' | 'asc'; // desc = Top performers, asc = Bottom performers
}
export interface RankWidget extends BaseWidget {
  type: 'rank';
  config: RankWidgetConfig;
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

// AI Insight Widget
export interface StructuredInsight {
  insight_title: string;
  insight_summary: string;
  analysis_details: string;
  actionable_recommendation: string;
  confidence_level: 'High' | 'Medium' | 'Low';
}

export interface AIInsightWidgetConfig {
  title: string;
  selectedColumns: string[]; // Using column labels
  aiServiceId: string;
  insight: StructuredInsight[]; // The generated structured content
  status: 'idle' | 'loading' | 'success' | 'error';
  errorMessage?: string;
}
export interface AIInsightWidget extends BaseWidget {
  type: 'ai';
  config: AIInsightWidgetConfig;
}


export type AnyWidget = DataTableWidget | ChartWidget | KpiWidget | TitleWidget | TextWidget | AIInsightWidget | PivotWidget | RankWidget;
// --- END WIDGETS ---

export interface SavedDashboard {
  name: string;
  createdAt: string;
  data: RowData[];
  columnConfig: ColumnConfig[];
  fileName: string;
  widgets: AnyWidget[];
  backgroundColor?: string;
}

// --- TEMPLATES ---
export interface TemplateField {
  key: string;       // The placeholder key used in widget configs (e.g., "revenue")
  label: string;     // The user-facing label (e.g., "Revenue Column")
  dataType: 'number' | 'string' | 'date';
  optional?: boolean;
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Sales' | 'Finance' | 'Marketing' | 'HR' | 'Operations' | 'Support' | 'E-commerce' | 'Project' | 'General';
  iconName: string; // String reference to an icon component
  requiredFields: TemplateField[];
  widgets: AnyWidget[]; // Configs contain placeholders like "{{revenue}}"
}

// --- AI SETTINGS ---
export type AIServiceProvider = 'gemini' | 'openai' | 'groq' | 'custom';

export interface AIServiceConfig {
  id: string;
  provider: AIServiceProvider;
  apiKey: string;
  model: string;
  baseURL?: string;
}