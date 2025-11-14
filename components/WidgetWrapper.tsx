import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { AnyWidget, RowData, ColumnConfig, WidgetSize, ChartWidget, KpiWidget } from '../types';
import { DragHandleIcon, EllipsisVerticalIcon, TrashIcon } from './Icons';
import DataTable from './DataTable';
import KpiWidgetComponent from './KpiWidget';

interface WidgetWrapperProps {
  widget: AnyWidget;
  data: RowData[];
  columnConfig: ColumnConfig[];
  onDelete: () => void;
  onUpdateSize: (size: WidgetSize) => void;
  index: number;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

const PRESET_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28', '#a4de6c', '#d0ed57', '#ffc658'];

const sizeClasses: Record<WidgetSize, string> = {
  '1/3': 'w-full md:w-1/2 lg:w-1/3',
  '1/2': 'w-full md:w-1/2',
  '2/3': 'w-full lg:w-2/3',
  'full': 'w-full',
};

const ChartRenderer: React.FC<{ widget: ChartWidget; data: RowData[] }> = ({ widget, data }) => {
  const { config } = widget;
  const { chartType, xAxisKey, yAxisKeys, seriesConfig, seriesColors } = config;

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

  const ChartComponent = { bar: BarChart, line: LineChart, area: AreaChart, pie: PieChart }[chartType];
  const SeriesComponent = { bar: Bar, line: Line, area: Area }[chartType];

  return (
    <ResponsiveContainer width="100%" height={300}>
      {chartType === 'pie' ? (
        <PieChart>
          <Pie data={aggregatedData.map(row => ({ name: String(row[xAxisKey]), value: row[yAxisKeys[0]] as number }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
            {aggregatedData.map((_entry, index) => <Cell key={`cell-${index}`} fill={PRESET_COLORS[index % PRESET_COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
          <Legend />
        </PieChart>
      ) : (
        <ChartComponent data={aggregatedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey={xAxisKey} stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
          <Legend />
          {yAxisKeys.map((key, index) => (
            React.createElement(SeriesComponent, {
              key, type: "monotone", dataKey: key,
              stroke: seriesColors[key] || PRESET_COLORS[index % PRESET_COLORS.length],
              fill: seriesColors[key] || PRESET_COLORS[index % PRESET_COLORS.length],
              ...(chartType === 'area' && { fillOpacity: 0.6, strokeWidth: 2 }),
            })
          ))}
        </ChartComponent>
      )}
    </ResponsiveContainer>
  );
};


const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ widget, data, columnConfig, onDelete, onUpdateSize, index, onDragStart, onDragEnter, onDragEnd, isDragging }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const renderContent = () => {
    switch (widget.type) {
      case 'datatable':
        return <DataTable data={data} columnsConfig={columnConfig} />;
      case 'chart':
        return <ChartRenderer widget={widget} data={data} />;
      case 'kpi':
        return <KpiWidgetComponent widget={widget} data={data} />;
      default:
        return null;
    }
  };

  const title = widget.type === 'datatable' ? widget.title : widget.config.title;

  return (
    <div
      className={`${sizeClasses[widget.size]} p-3 transition-opacity duration-300 ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragEnter={() => onDragEnter(index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="bg-gray-800/50 rounded-xl h-full flex flex-col">
        <header className="flex items-center justify-between p-3 border-b border-gray-700/50">
          <div className="flex items-center gap-2">
            <div className="cursor-grab" onMouseDown={(e) => e.stopPropagation()}>
              <DragHandleIcon className="text-gray-500" />
            </div>
            <h3 className="font-bold text-white">{title}</h3>
          </div>
          <div className="relative">
            <button onClick={() => setIsMenuOpen(prev => !prev)} className="text-gray-400 hover:text-white">
              <EllipsisVerticalIcon />
            </button>
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-10">
                <div className="p-1">
                  <p className="px-3 py-1 text-xs text-gray-400">Resize</p>
                  {(['1/3', '1/2', '2/3', 'full'] as WidgetSize[]).map(size => (
                    <button key={size} onClick={() => { onUpdateSize(size); setIsMenuOpen(false); }} className="w-full text-left block px-3 py-1.5 text-sm hover:bg-gray-600 rounded-md">
                      {size.replace('/', '-')} Width
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-600 p-1">
                  <button onClick={onDelete} className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/20 rounded-md">
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
