
import React, { useState, useMemo, useRef } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ReferenceLine, TooltipProps, LabelList } from 'recharts';
import { AnyWidget, RowData, ColumnConfig, WidgetSize, ChartWidget, KpiWidget, TitleWidget, DataTableWidget, TextWidget, AIInsightWidget } from '../types';
import { DragHandleIcon, EllipsisVerticalIcon, TrashIcon, EyeOffIcon, PencilIcon } from './Icons';
import DataTable from './DataTable';
import KpiWidgetComponent from './KpiWidget';
import MarkdownRenderer from './MarkdownRenderer';
import { professionalFonts } from './TitleModal';
import AIInsightWidgetComponent from './AIInsightWidgetComponent';

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
  gridContainerRef: React.RefObject<HTMLDivElement>;
}

const sizeClasses: Record<WidgetSize, string> = {
  '1/4': 'col-span-12 md:col-span-6 lg:col-span-3',
  '1/3': 'col-span-12 md:col-span-6 lg:col-span-4',
  '1/2': 'col-span-12 md:col-span-6',
  '2/3': 'col-span-12 lg:col-span-8',
  'full': 'col-span-12',
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-[var(--border-color)] shadow-lg">
          <p className="label font-bold mb-2">{`${label}`}</p>
          {payload.map((pld: any) => (
            <p key={pld.name} style={{ color: pld.color }} className="text-sm">
              {`${pld.name}: ${pld.value?.toLocaleString(undefined, { maximumFractionDigits: 3 })}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
};

const TitleRenderer: React.FC<{ widget: TitleWidget }> = ({ widget }) => {
  const { config } = widget;
  const { text, fontFamily, fontSize, textAlign } = config;

  return (
    <div className="w-full h-full flex items-center" style={{ justifyContent: 'stretch' }}>
      <h1
        className="w-full"
        style={{
          fontFamily: professionalFonts[fontFamily as keyof typeof professionalFonts],
          fontSize: `${fontSize}px`,
          textAlign: textAlign,
          color: 'var(--text-primary)',
          wordBreak: 'break-word',
        }}
      >
        {text}
      </h1>
    </div>
  );
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
  
  const isPieWithNegativeValues = chartType === 'pie' && yAxisKeys.length > 0 && aggregatedData.some(d => (d[yAxisKeys[0]] as number) < 0);

  const hasLineSeries = yAxisKeys.some(k => seriesType[k] === 'line');
  const effectiveChartType = hasLineSeries ? 'bar' : chartType;
  const lineSeriesKeys = yAxisKeys.filter(k => seriesType[k] === 'line');

  const ChartComponent = { bar: BarChart, line: LineChart, area: AreaChart, pie: PieChart }[effectiveChartType];
  const dataLabelFormatter = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 3 });
  const yAxisDomain: any = [
    (dataMin: number) => Math.floor(Math.min(0, dataMin) * 1.1),
    (dataMax: number) => Math.ceil(Math.max(0, dataMax) * 1.1)
  ];

  return (
    <>
      <h3 className="print-title">{config.title}</h3>
      {isPieWithNegativeValues ? (
        <div className="flex flex-col items-center justify-center h-full text-[var(--text-tertiary)] gap-2 text-center p-4">
            <span className="text-4xl" role="img" aria-label="Warning">⚠️</span>
            <h4 className="font-semibold text-lg text-[var(--text-primary)]">Display Error</h4>
            <p className="text-sm">Pie charts cannot be shown with negative values.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'pie' ? (
            <PieChart>
              <Pie 
                data={aggregatedData.map(row => ({ name: String(row[xAxisKey]), value: row[yAxisKeys[0]] as number }))} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={100} 
                labelLine={false}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {aggregatedData.map((_entry, index) => <Cell key={`cell-${index}`} fill={seriesColors[yAxisKeys[0]] || chartColors[index % chartColors.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          ) : (
            <ChartComponent data={aggregatedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey={xAxisKey} stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={100} />
              <YAxis yAxisId="left" orientation="left" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} domain={yAxisDomain} />
              {hasLineSeries && <YAxis yAxisId="right" orientation="right" stroke={seriesColors[lineSeriesKeys[0]] || '#82ca9d'} tick={{ fill: seriesColors[lineSeriesKeys[0]] || '#82ca9d', fontSize: 12 }} domain={yAxisDomain} />}
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
      )}
    </>
  );
};


const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ widget, data, columnConfig, onDelete, onHide, onEdit, onUpdateSize, onDragStart, onDragEnter, onDragEnd, isDragging, chartColors, gridContainerRef }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [resizingInfo, setResizingInfo] = useState<{ width: number; sizeLabel: WidgetSize } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const sizeMap: { size: WidgetSize, span: number }[] = [
    { size: '1/4', span: 3 },
    { size: '1/3', span: 4 },
    { size: '1/2', span: 6 },
    { size: '2/3', span: 8 },
    { size: 'full', span: 12 },
  ];

  const getSnappedSizeInfo = (
    pixelWidth: number,
    gridWidth: number,
    gap: number
  ): { snappedPixelWidth: number; snappedSize: WidgetSize } => {
    const effectiveColWidth = (gridWidth - (11 * gap)) / 12;

    let bestMatch: WidgetSize = 'full';
    let smallestDiff = Infinity;

    for (const size of sizeMap) {
      const spanWidth = (size.span * effectiveColWidth) + ((size.span - 1) * gap);
      const diff = Math.abs(pixelWidth - spanWidth);
      if (diff < smallestDiff) {
        smallestDiff = diff;
        bestMatch = size.size;
      }
    }

    const finalSpan = sizeMap.find(s => s.size === bestMatch)!.span;
    const snappedPixelWidth = Math.min(gridWidth, (finalSpan * effectiveColWidth) + ((finalSpan - 1) * gap));

    return { snappedPixelWidth, snappedSize: bestMatch };
  };

  const handleResizeMouseDown = (mouseDownEvent: React.MouseEvent<HTMLDivElement>) => {
    mouseDownEvent.preventDefault();
    mouseDownEvent.stopPropagation();

    if (!wrapperRef.current || !gridContainerRef.current) return;
    
    document.body.setAttribute('data-resizing', 'true');
    const startX = mouseDownEvent.clientX;
    const startWidth = wrapperRef.current.getBoundingClientRect().width;
    const gridRect = gridContainerRef.current.getBoundingClientRect();
    const gridWidth = gridRect.width;

    const gridStyle = window.getComputedStyle(gridContainerRef.current);
    const gap = parseFloat(gridStyle.getPropertyValue('gap'));

    const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
        const deltaX = mouseMoveEvent.clientX - startX;
        const newPixelWidth = startWidth + deltaX;
        
        const { snappedPixelWidth, snappedSize } = getSnappedSizeInfo(newPixelWidth, gridWidth, gap);
        
        setResizingInfo({ width: snappedPixelWidth, sizeLabel: snappedSize });
    };

    const handleMouseUp = () => {
        document.body.removeAttribute('data-resizing');
        document.body.style.cursor = 'auto';

        setResizingInfo(prev => {
            if (prev && prev.sizeLabel !== widget.size) {
                onUpdateSize(prev.sizeLabel);
            }
            return null;
        });
        
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };

    document.body.style.cursor = 'col-resize';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const renderContent = () => {
    switch (widget.type) {
      case 'datatable':
        const dtWidget = widget as DataTableWidget;
        return <DataTable data={data} columnsConfig={columnConfig} title={dtWidget.title} />;
      case 'chart':
        return <ChartRenderer widget={widget as ChartWidget} data={data} chartColors={chartColors} />;
      case 'kpi':
        return <KpiWidgetComponent widget={widget as KpiWidget} data={data} columnConfig={columnConfig} />;
      case 'title':
        return <TitleRenderer widget={widget as TitleWidget} />;
      case 'text':
        return <div className="overflow-y-auto h-full"><MarkdownRenderer content={(widget as TextWidget).config.content} /></div>;
      case 'ai':
        return <AIInsightWidgetComponent widget={widget as AIInsightWidget} />;
      default:
        return null;
    }
  };
  
  const getTitle = (w: AnyWidget): string => {
    if (w.type === 'datatable') return w.title;
    if (w.type === 'title') return w.config.text;
    return w.config.title;
  }
  const title = getTitle(widget);

  const canEdit = ['chart', 'title', 'text', 'datatable', 'ai'].includes(widget.type);

  return (
    <div
      ref={wrapperRef}
      className={`${sizeClasses[widget.size]} transition-opacity duration-300 ${isDragging ? 'opacity-50' : 'opacity-100'} widget-card relative`}
      draggable={widget.type !== 'title'}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="bg-[var(--bg-card)] rounded-xl h-full flex flex-col ring-1 ring-black/5 shadow-md relative">
        <header className="flex items-center p-4 border-b border-[var(--border-color)]">
          <div className="w-8 flex-shrink-0">
            {widget.type !== 'title' && (
              <div className="cursor-grab" onMouseDown={(e) => e.stopPropagation()} data-tooltip="Drag to reorder this widget on the dashboard.">
                <DragHandleIcon className="text-[var(--text-tertiary)]" />
              </div>
            )}
          </div>
          <div className="flex-grow text-center px-2">
            <h3 className="font-bold truncate" title={title}>{title}</h3>
          </div>
          <div className="w-8 relative noprint flex-shrink-0 flex justify-end">
            <button onClick={() => setIsMenuOpen(prev => !prev)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]" data-tooltip="Widget options">
              <EllipsisVerticalIcon />
            </button>
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-xl z-10">
                {widget.type !== 'title' && (
                  <div className="p-1">
                    <p className="px-3 py-1 text-xs text-[var(--text-secondary)]">Resize</p>
                    {(['1/4', '1/3', '1/2', '2/3', 'full'] as WidgetSize[]).map(size => (
                      <button key={size} onClick={() => { onUpdateSize(size); setIsMenuOpen(false); }} className="w-full text-left block px-3 py-1.5 text-sm hover:bg-[var(--bg-contrast-hover)] rounded-md">
                        {size.replace('/', '-')} Width
                      </button>
                    ))}
                  </div>
                )}
                <div className="border-t border-[var(--border-color)] p-1">
                  {canEdit && (
                    <button onClick={() => { onEdit(); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-[var(--bg-contrast-hover)] rounded-md" data-tooltip="Edit this widget's configuration.">
                      <PencilIcon /> Edit
                    </button>
                  )}
                  <button onClick={() => { onHide(); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-[var(--bg-contrast-hover)] rounded-md" data-tooltip="Hide this widget. You can restore it later from the 'Hidden' menu in the header.">
                    <EyeOffIcon /> Hide
                  </button>
                  <button onClick={onDelete} className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/20 rounded-md" data-tooltip="Permanently delete this widget from the dashboard.">
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

        {resizingInfo && (
          <div
            className="resize-ghost-preview"
            style={{ width: `${resizingInfo.width}px` }}
          >
            <span className="resize-ghost-label">
              {resizingInfo.sizeLabel.replace('/', '-')} Width
            </span>
          </div>
        )}
      </div>
      {widget.type !== 'title' && (
        <div
          className="resize-handle-wrapper noprint"
          onMouseDown={handleResizeMouseDown}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="resize-handle-indicator"></div>
        </div>
      )}
    </div>
  );
};

export default WidgetWrapper;
