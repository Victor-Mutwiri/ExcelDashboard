import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ReferenceLine, TooltipProps, LabelList } from 'recharts';
import { AnyWidget, RowData, ColumnConfig, WidgetSize, ChartWidget, KpiWidget } from '../types';
import { DragHandleIcon, EllipsisVerticalIcon, TrashIcon, EyeOffIcon, PencilIcon } from './Icons';
import DataTable from './DataTable';
import KpiWidgetComponent from './KpiWidget';

interface WidgetWrapperProps {
  widget: AnyWidget;
  data: RowData[];
  columnConfig: ColumnConfig[];
  onDelete: () => void;
  onHide: () => void;
  onEdit: () => void;
  onUpdateSize: (size: WidgetSize) => void;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
  isDragging: boolean;
  chartColors: string[];
}

const sizeClasses: Record<WidgetSize, string> = {
  '1/4': 'col-span-12 md:col-span-6 lg:col-span-3',
  '1/3': 'col-span-12 md:col-span-6 lg:col-span-4',
  '1/2': 'col-span-12 md:col-span-6',
  '2/3': 'col-span-12 lg:col-span-8',
  'full': 'col-span-12',
};

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-[var(--border-color)] shadow-lg">
          <p className="label font-bold mb-2">{`${label}`}</p>
          {payload.map((pld) => (
            <p key={pld.name} style={{ color: pld.color }} className="text-sm">
              {`${pld.name}: ${pld.value?.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
};

const ChartRenderer: React.FC<{ widget: ChartWidget; data: RowData[]; chartColors: string[] }> = ({ widget, data, chartColors }) => {
  const { config } = widget;
  const { chartType, xAxisKey, yAxisKeys = [], seriesConfig, seriesColors, valueColors, seriesType = {}, referenceLine, showDataLabels } = config;

  const aggregatedData = useMemo(() => {
    if (!xAxisKey || yAxisKeys.length === 0) return [];

    const groupedData: Record<string, RowData[]> = {};
    data.forEach((row) => {
      const key = String(row[xAxisKey] ?? 'N/A');
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(row);
    });

    return Object.entries(groupedData).map(([key, rows]) => {
      const aggregatedRow: RowData = { [xAxisKey]: key };
      yAxisKeys.forEach(yKey => {
        const aggregation = seriesConfig[yKey] || 'SUM';
        const values = rows.map(r => r[yKey]).filter(v => typeof v === 'number') as number[];
        if (values.length === 0 && aggregation !== 'COUNT') {
          aggregatedRow[yKey] = 0;
          return;
        }
        let result: number;
        switch (aggregation) {
          case 'SUM': result = values.reduce((s, v) => s + v, 0); break;
          case 'AVERAGE': result = values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0; break;
          case 'MIN': result = values.length ? Math.min(...values) : 0; break;
          case 'MAX': result = values.length ? Math.max(...values) : 0; break;
          case 'COUNT': result = rows.filter(r => r[yKey] != null).length; break;
        }
        aggregatedRow[yKey] = result;
      });
      return aggregatedRow;
    });
  }, [data, xAxisKey, yAxisKeys, seriesConfig]);
  
  const hasLineSeries = yAxisKeys.some(k => seriesType[k] === 'line');
  const effectiveChartType = hasLineSeries ? 'bar' : chartType;
  const lineSeriesKeys = yAxisKeys.filter(k => seriesType[k] === 'line');

  const ChartComponent = { bar: BarChart, line: LineChart, area: AreaChart, pie: PieChart }[effectiveChartType];
  const dataLabelFormatter = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <ResponsiveContainer width="100%" height={300}>
      {chartType === 'pie' ? (
        <PieChart>
          <Pie data={aggregatedData.map(row => ({ name: String(row[xAxisKey]), value: row[yAxisKeys[0]] as number }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
            {aggregatedData.map((_entry, index) => <Cell key={`cell-${index}`} fill={seriesColors[yAxisKeys[0]] || chartColors[index % chartColors.length]} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      ) : (
        <ChartComponent data={aggregatedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey={xAxisKey} stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={100} />
          <YAxis yAxisId="left" orientation="left" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
          {hasLineSeries && <YAxis yAxisId="right" orientation="right" stroke={seriesColors[lineSeriesKeys[0]] || '#82ca9d'} tick={{ fill: seriesColors[lineSeriesKeys[0]] || '#82ca9d', fontSize: 12 }} />}
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {referenceLine && <ReferenceLine yAxisId="left" y={referenceLine.value} label={referenceLine.label} stroke={referenceLine.color} strokeDasharray="3 3" />}
          {yAxisKeys.map((key, index) => {
              const type = seriesType[key];
              const color = seriesColors[key] || chartColors[index % chartColors.length];
              
              if (hasLineSeries && type === 'line') {
                  return <Line key={key} yAxisId="right" type="monotone" dataKey={key} stroke={color} strokeWidth={2}>
                    {showDataLabels && <LabelList dataKey={key} position="top" fill="var(--text-secondary)" fontSize={12} formatter={dataLabelFormatter} />}
                  </Line>;
              }

              const isBar = (hasLineSeries && type === 'bar') || chartType === 'bar';
              if (isBar) {
                  return (
                      <Bar key={key} yAxisId={hasLineSeries ? 'left' : undefined} dataKey={key} fill={color}>
                          {showDataLabels && <LabelList dataKey={key} position="top" fill="var(--text-secondary)" fontSize={12} formatter={dataLabelFormatter} />}
                          {valueColors && Object.keys(valueColors).length > 0
                              ? aggregatedData.map((entry) => {
                                  const xValue = entry[xAxisKey] as string;
                                  return <Cell key={`cell-${xValue}`} fill={valueColors[xValue] || color} />;
                                })
                              : null
                          }
                      </Bar>
                  );
              }

              if (chartType === 'line') {
                  return <Line key={key} type="monotone" dataKey={key} stroke={color}>
                    {showDataLabels && <LabelList dataKey={key} position="top" fill="var(--text-secondary)" fontSize={12} formatter={dataLabelFormatter} />}
                  </Line>;
              }
              if (chartType === 'area') {
                  return <Area key={key} type="monotone" dataKey={key} stroke={color} fill={color} fillOpacity={0.6} strokeWidth={2}>
                    {showDataLabels && <LabelList dataKey={key} position="top" fill="var(--text-secondary)" fontSize={12} formatter={dataLabelFormatter} />}
                  </Area>;
              }
              return null;
          })}
        </ChartComponent>
      )}
    </ResponsiveContainer>
  );
};


const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ widget, data, columnConfig, onDelete, onHide, onEdit, onUpdateSize, onDragStart, onDragEnter, onDragEnd, isDragging, chartColors }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const renderContent = () => {
    switch (widget.type) {
      case 'datatable':
        return <DataTable data={data} columnsConfig={columnConfig} />;
      case 'chart':
        return <ChartRenderer widget={widget as ChartWidget} data={data} chartColors={chartColors} />;
      case 'kpi':
        return <KpiWidgetComponent widget={widget as KpiWidget} data={data} columnConfig={columnConfig} />;
      default:
        return null;
    }
  };

  const title = widget.type === 'datatable' ? widget.title : widget.config.title;

  return (
    <div
      className={`${sizeClasses[widget.size]} transition-opacity duration-300 ${isDragging ? 'opacity-50' : 'opacity-100'} widget-card`}
      draggable
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="bg-[var(--bg-card)] rounded-xl h-full flex flex-col ring-1 ring-black/5 shadow-md">
        <header className="flex items-center p-4 border-b border-[var(--border-color)]">
          <div className="w-8 flex-shrink-0">
            <div className="cursor-grab" onMouseDown={(e) => e.stopPropagation()}>
              <DragHandleIcon className="text-[var(--text-tertiary)]" />
            </div>
          </div>
          <div className="flex-grow text-center px-2">
            <h3 className="font-bold truncate" title={title}>{title}</h3>
          </div>
          <div className="w-8 relative noprint flex-shrink-0 flex justify-end">
            <button onClick={() => setIsMenuOpen(prev => !prev)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <EllipsisVerticalIcon />
            </button>
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-xl z-10">
                <div className="p-1">
                  <p className="px-3 py-1 text-xs text-[var(--text-secondary)]">Resize</p>
                  {(['1/4', '1/3', '1/2', '2/3', 'full'] as WidgetSize[]).map(size => (
                    <button key={size} onClick={() => { onUpdateSize(size); setIsMenuOpen(false); }} className="w-full text-left block px-3 py-1.5 text-sm hover:bg-[var(--bg-contrast-hover)] rounded-md">
                      {size.replace('/', '-')} Width
                    </button>
                  ))}
                </div>
                <div className="border-t border-[var(--border-color)] p-1">
                  {widget.type === 'chart' && (
                    <button onClick={() => { onEdit(); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-[var(--bg-contrast-hover)] rounded-md">
                      <PencilIcon /> Edit
                    </button>
                  )}
                  <button onClick={() => { onHide(); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-[var(--bg-contrast-hover)] rounded-md">
                    <EyeOffIcon /> Hide
                  </button>
                  <button onClick={onDelete} className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/20 rounded-md">
                    <TrashIcon /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>
        <main className="p-4 flex-grow min-h-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default WidgetWrapper;