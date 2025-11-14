import React, { useState, useMemo, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { Modal } from './Modal';
import { ColumnConfig, RowData, ChartType, Computation, ChartWidgetConfig } from '../types';
import { ChartIcon, AreaChartIcon, CheckIcon } from './Icons';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: RowData[];
  columnConfig: ColumnConfig[];
  onSave: (config: ChartWidgetConfig) => void;
}

const PRESET_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28', '#a4de6c', '#d0ed57', '#ffc658'];

const ChartModal: React.FC<ChartModalProps> = ({ isOpen, onClose, data, columnConfig, onSave }) => {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [xAxisKey, setXAxisKey] = useState<string>('');
  const [yAxisKeys, setYAxisKeys] = useState<string[]>([]);
  const [seriesConfig, setSeriesConfig] = useState<Record<string, Computation>>({});
  const [chartTitle, setChartTitle] = useState('My Chart');
  const [seriesColors, setSeriesColors] = useState<Record<string, string>>({});

  const numericColumns = useMemo(() => columnConfig.filter(c => c.isNumeric), [columnConfig]);
  const categoricalColumns = useMemo(() => columnConfig.filter(c => !c.isNumeric), [columnConfig]);

  const xAxisColumns = useMemo(() => {
    return chartType === 'pie' ? columnConfig : categoricalColumns;
  }, [chartType, columnConfig, categoricalColumns]);

  useEffect(() => {
    setXAxisKey('');
    setYAxisKeys([]);
    setSeriesConfig({});
  }, [chartType]);
  
  const handleSaveChart = () => {
    if (!xAxisKey || yAxisKeys.length === 0) return;
    onSave({
      chartType,
      xAxisKey,
      yAxisKeys,
      seriesConfig,
      title: chartTitle,
      seriesColors
    });
  };

  const handleYAxisToggle = (label: string) => {
    const isPie = chartType === 'pie';
    let newKeys: string[];

    if (isPie) {
        newKeys = yAxisKeys.includes(label) ? [] : [label];
    } else {
        newKeys = yAxisKeys.includes(label)
            ? yAxisKeys.filter(k => k !== label)
            : [...yAxisKeys, label];
    }
    setYAxisKeys(newKeys);

    const nextConfig: Record<string, Computation> = {};
    for (const key of newKeys) {
        nextConfig[key] = seriesConfig[key] || 'SUM';
    }
    setSeriesConfig(nextConfig);
  };
  
  const handleAggregationChange = (key: string, aggregation: Computation) => {
    setSeriesConfig(prev => ({ ...prev, [key]: aggregation }));
  };

  const handleColorChange = (seriesKey: string, color: string) => {
    setSeriesColors(prev => ({...prev, [seriesKey]: color}));
  };

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
                case 'SUM':
                    result = values.reduce((s, v) => s + v, 0);
                    break;
                case 'AVERAGE':
                    result = values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
                    break;
                case 'MIN':
                    result = values.length ? Math.min(...values) : 0;
                    break;
                case 'MAX':
                    result = values.length ? Math.max(...values) : 0;
                    break;
                case 'COUNT':
                    result = rows.filter(r => r[yKey] != null).length;
                    break;
            }
            aggregatedRow[yKey] = result;
        });
        return aggregatedRow;
    });
  }, [data, xAxisKey, yAxisKeys, seriesConfig]);


  const renderChart = () => {
    const isConfigComplete = xAxisKey && yAxisKeys.length > 0;

    if (!isConfigComplete) return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
        <ChartIcon className="w-16 h-16" />
        <p className="text-lg">Please select data for the axes to build your chart.</p>
      </div>
    );

    const ChartComponent = {
      bar: BarChart,
      line: LineChart,
      area: AreaChart,
      pie: PieChart,
    }[chartType];

    const SeriesComponent = {
      bar: Bar,
      line: Line,
      area: Area,
    }[chartType];

    return (
      <ResponsiveContainer width="100%" height="100%">
        {chartType === 'pie' ? (
          <PieChart>
            <Pie 
              data={aggregatedData.map(row => ({ name: String(row[xAxisKey]), value: row[yAxisKeys[0]] as number }))} 
              dataKey="value" 
              nameKey="name" 
              cx="50%" 
              cy="50%" 
              outerRadius={150} 
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {aggregatedData.map((_entry, index) => <Cell key={`cell-${index}`} fill={PRESET_COLORS[index % PRESET_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
            <Legend />
          </PieChart>
        ) : (
          <ChartComponent data={aggregatedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey={xAxisKey} stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
            <Legend />
            {yAxisKeys.map((key, index) => (
              React.createElement(SeriesComponent, {
                key,
                type: "monotone",
                dataKey: key,
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chart Studio">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[70vh]">
        {/* Configuration Panel */}
        <div className="md:col-span-1 flex flex-col gap-6 bg-gray-900/50 p-4 rounded-lg overflow-y-auto">
          {/* Chart Type */}
          <div>
            <h3 className="font-semibold text-white mb-2">Chart Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {(['bar', 'line', 'area', 'pie'] as ChartType[]).map(type => (
                <button key={type} onClick={() => setChartType(type)} className={`capitalize p-2 rounded-md text-sm transition-colors flex items-center justify-center gap-2 ${chartType === type ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                   { {bar: <ChartIcon className="w-4 h-4" />, area: <AreaChartIcon className="w-4 h-4" />, line: <span className="w-4 h-4 leading-4 font-bold">-</span>, pie: <span className="w-4 h-4 leading-4 font-bold">&#9675;</span>}[type] } {type}
                </button>
              ))}
            </div>
          </div>

          {/* Data Selection */}
          <div>
            <h3 className="font-semibold text-white mb-2">Data</h3>
            <div className="space-y-3">
              <select value={xAxisKey} onChange={e => setXAxisKey(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                <option value="">{chartType === 'pie' ? 'Select Label Column' : 'Select X-Axis'}</option>
                {xAxisColumns.map(c => <option key={c.id} value={c.label}>{c.label}</option>)}
              </select>
              
              <div className="bg-gray-700 border border-gray-600 rounded-md p-2 space-y-2 max-h-40 overflow-y-auto">
                <label className="font-medium text-sm text-gray-300 px-1">{chartType === 'pie' ? 'Value Column (select one)' : 'Y-Axis Columns'}</label>
                {numericColumns.map(c => (
                  <label key={c.id} className="flex items-center gap-2 p-1.5 hover:bg-gray-600/50 rounded-md cursor-pointer">
                    <input type="checkbox" checked={yAxisKeys.includes(c.label)} onChange={() => handleYAxisToggle(c.label)} className="form-checkbox h-4 w-4 rounded bg-gray-800 border-gray-500 text-indigo-600 focus:ring-indigo-500" />
                    <span>{c.label}</span>
                  </label>
                ))}
              </div>
              {yAxisKeys.length > 0 && (
                <div className="pt-3 mt-3 border-t border-gray-700/50">
                  <label className="font-medium text-sm text-gray-300 px-1">Aggregation</label>
                  <div className="space-y-2 mt-2">
                    {yAxisKeys.map(key => (
                      <div key={key} className="flex items-center justify-between gap-2 bg-gray-700/50 p-1.5 rounded-md">
                        <span className="text-sm text-gray-300 truncate px-1">{key}</span>
                        <select 
                          value={seriesConfig[key] || 'SUM'}
                          onChange={(e) => handleAggregationChange(key, e.target.value as Computation)}
                          className="bg-gray-800 border border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="SUM">Sum</option>
                          <option value="AVERAGE">Average</option>
                          <option value="COUNT">Count</option>
                          <option value="MIN">Min</option>
                          <option value="MAX">Max</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Customization */}
          {yAxisKeys.length > 0 && (
            <div>
              <h3 className="font-semibold text-white mb-2">Customize</h3>
              <div className="space-y-4">
                 <input type="text" value={chartTitle} onChange={e => setChartTitle(e.target.value)} placeholder="Chart Title" className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                {chartType !== 'pie' && yAxisKeys.map((key) => (
                  <div key={key}>
                    <label className="text-sm font-medium text-gray-300">{key} Color</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {PRESET_COLORS.map(color => (
                        <button key={color} style={{ backgroundColor: color }} onClick={() => handleColorChange(key, color)} className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${seriesColors[key] === color ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : ''}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chart Preview */}
        <div className="md:col-span-2 bg-gray-900/50 p-4 rounded-lg flex flex-col items-center justify-center">
            <h2 className="text-xl font-bold text-white mb-4 w-full text-center">{chartTitle}</h2>
            {renderChart()}
        </div>
      </div>
       <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-700">
          <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSaveChart} disabled={!xAxisKey || yAxisKeys.length === 0} className="flex items-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
            <CheckIcon />
            Save Chart
          </button>
        </div>
    </Modal>
  );
};

export default ChartModal;
