
import React, { useState, useMemo, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ReferenceLine, LabelList } from 'recharts';
import { Modal } from './Modal';
import { ColumnConfig, RowData, ChartType, Computation, ChartWidgetConfig } from '../types';
import { ChartIcon, AreaChartIcon, CheckIcon, LineChartIcon, ColorSwatchIcon } from './Icons';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: RowData[];
  columnConfig: ColumnConfig[];
  onSave: (config: ChartWidgetConfig) => void;
  chartColors: string[];
  initialConfig?: ChartWidgetConfig;
}

const ChartModal: React.FC<ChartModalProps> = ({ isOpen, onClose, data, columnConfig, onSave, chartColors, initialConfig }) => {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [xAxisKey, setXAxisKey] = useState<string>('');
  const [yAxisKeys, setYAxisKeys] = useState<string[]>([]);
  const [seriesConfig, setSeriesConfig] = useState<Record<string, Computation>>({});
  const [chartTitle, setChartTitle] = useState('My Chart');
  const [seriesColors, setSeriesColors] = useState<Record<string, string>>({});
  const [valueColors, setValueColors] = useState<Record<string, string>>({});
  const [seriesType, setSeriesType] = useState<Record<string, 'bar' | 'line'>>({});
  const [showDataLabels, setShowDataLabels] = useState(false);
  const [refLine, setRefLine] = useState<{ enabled: boolean; label: string; value: number; color: string }>({
      enabled: false,
      label: 'Target',
      value: 1000,
      color: '#ff7300'
  });

  const isEditing = !!initialConfig;

  const numericColumns = useMemo(() => columnConfig.filter(c => c.isNumeric), [columnConfig]);
  const categoricalColumns = useMemo(() => columnConfig.filter(c => !c.isNumeric), [columnConfig]);

  const xAxisColumns = useMemo(() => {
    return chartType === 'pie' ? columnConfig : categoricalColumns;
  }, [chartType, columnConfig, categoricalColumns]);
  
  const uniqueXAxisValues = useMemo(() => {
    if (!xAxisKey || chartType !== 'bar') return [];
    return [...new Set(data.map(d => d[xAxisKey] as string).filter(Boolean))];
  }, [data, xAxisKey, chartType]);

  const resetState = () => {
    setChartType('bar');
    setXAxisKey('');
    setYAxisKeys([]);
    setSeriesConfig({});
    setChartTitle('My Chart');
    setSeriesColors({});
    setValueColors({});
    setSeriesType({});
    setShowDataLabels(false);
    setRefLine({ enabled: false, label: 'Target', value: 1000, color: '#ff7300' });
  };

  useEffect(() => {
    if (isOpen) {
      if (initialConfig) {
        setChartType(initialConfig.chartType);
        setXAxisKey(initialConfig.xAxisKey);
        setYAxisKeys(initialConfig.yAxisKeys || []);
        setSeriesConfig(initialConfig.seriesConfig);
        setChartTitle(initialConfig.title);
        setSeriesColors(initialConfig.seriesColors);
        setValueColors(initialConfig.valueColors || {});
        setSeriesType(initialConfig.seriesType || {});
        setShowDataLabels(initialConfig.showDataLabels ?? false);
        if (initialConfig.referenceLine) {
            setRefLine({ enabled: true, ...initialConfig.referenceLine });
        } else {
            setRefLine({ enabled: false, label: 'Target', value: 1000, color: '#ff7300' });
        }
      } else {
        resetState();
      }
    }
  }, [isOpen, initialConfig]);
  
  const handleSave = () => {
    if (!xAxisKey || yAxisKeys.length === 0) return;
    onSave({
      chartType,
      xAxisKey,
      yAxisKeys,
      seriesConfig,
      title: chartTitle,
      seriesColors,
      valueColors,
      seriesType,
      showDataLabels,
      ...(refLine.enabled && { referenceLine: { label: refLine.label, value: refLine.value, color: refLine.color }})
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
    const nextSeriesType: Record<string, 'bar' | 'line'> = {};
    for (const key of newKeys) {
        nextConfig[key] = seriesConfig[key] || 'SUM';
        nextSeriesType[key] = seriesType[key] || 'bar';
    }
    setSeriesConfig(nextConfig);
    setSeriesType(nextSeriesType);
  };
  
  const handleAggregationChange = (key: string, aggregation: Computation) => {
    setSeriesConfig(prev => ({ ...prev, [key]: aggregation }));
  };

  const handleColorChange = (seriesKey: string, color: string) => {
    setSeriesColors(prev => ({...prev, [seriesKey]: color}));
  };
  
  const handleValueColorChange = (value: string, color: string) => {
    setValueColors(prev => ({...prev, [value]: color}));
  };

  const handleSeriesTypeChange = (key: string, type: 'bar' | 'line') => {
    setSeriesType(prev => ({...prev, [key]: type}));
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
      <div className="flex flex-col items-center justify-center h-full text-[var(--text-tertiary)] gap-4">
        <ChartIcon className="w-16 h-16" />
        <p className="text-lg">Please select data for the axes to build your chart.</p>
      </div>
    );
    
    const isPieWithNegativeValues = chartType === 'pie' && aggregatedData.some(d => (d[yAxisKeys[0]] as number) < 0);

    if (isPieWithNegativeValues) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-tertiary)] gap-4 text-center p-4">
                <span className="text-5xl" role="img" aria-label="Warning">⚠️</span>
                <h3 className="font-semibold text-xl text-[var(--text-primary)]">Invalid Data for Pie Chart</h3>
                <p>Pie charts represent parts of a whole and cannot display negative values.</p>
                <p className="text-sm mt-2">Consider using a Bar Chart for this data or applying a filter to exclude negative results.</p>
            </div>
        );
    }

    const effectiveChartType = yAxisKeys.some(k => seriesType[k] === 'line') ? 'bar' : chartType;

    const ChartComponent = {
      bar: BarChart,
      line: LineChart,
      area: AreaChart,
      pie: PieChart,
    }[effectiveChartType];

    const hasLineSeries = yAxisKeys.some(k => seriesType[k] === 'line');
    const lineSeriesKeys = yAxisKeys.filter(k => seriesType[k] === 'line');

    const tooltipStyle = {
        backgroundColor: 'var(--bg-card)', 
        border: '1px solid var(--border-color)',
        color: 'var(--text-primary)'
    };

    const dataLabelFormatter = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 3 });

    const yAxisDomain = [
      (dataMin: number) => Math.floor(Math.min(0, dataMin) * 1.1),
      (dataMax: number) => Math.ceil(Math.max(0, dataMax) * 1.1)
    ];

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
              labelLine={false}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            >
              {aggregatedData.map((_entry, index) => <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
          </PieChart>
        ) : (
          <ChartComponent data={aggregatedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey={xAxisKey} stroke="var(--text-secondary)" interval={0} angle={-30} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" orientation="left" stroke="var(--text-secondary)" domain={yAxisDomain} />
            {hasLineSeries && <YAxis yAxisId="right" orientation="right" stroke={seriesColors[lineSeriesKeys[0]] || '#82ca9d'} domain={yAxisDomain} />}
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            {refLine.enabled && <ReferenceLine yAxisId="left" y={refLine.value} label={refLine.label} stroke={refLine.color} strokeDasharray="3 3" />}
            {yAxisKeys.map((key, index) => {
                const type = seriesType[key];
                const color = seriesColors[key] || chartColors[index % chartColors.length];

                if (hasLineSeries && type === 'line') {
                    return <Line key={key} yAxisId="right" type="monotone" dataKey={key} stroke={color} strokeWidth={2}>
                      {showDataLabels && <LabelList dataKey={key} position="top" fill="var(--text-secondary)" fontSize={11} formatter={dataLabelFormatter} />}
                    </Line>;
                }

                const isBar = (hasLineSeries && type === 'bar') || chartType === 'bar';
                if (isBar) {
                    return (
                        <Bar key={key} yAxisId={hasLineSeries ? "left" : undefined} dataKey={key} fill={color}>
                            {showDataLabels && <LabelList dataKey={key} position="top" fill="var(--text-secondary)" fontSize={11} formatter={dataLabelFormatter} />}
                            {aggregatedData.map((entry) => {
                                const xValue = entry[xAxisKey] as string;
                                const cellColor = valueColors[xValue];
                                return <Cell key={`cell-${xValue}`} fill={cellColor || color} />;
                            })}
                        </Bar>
                    );
                }
                
                if (chartType === 'line') {
                  return <Line key={key} type="monotone" dataKey={key} stroke={color}>
                    {showDataLabels && <LabelList dataKey={key} position="top" fill="var(--text-secondary)" fontSize={11} formatter={dataLabelFormatter} />}
                  </Line>;
                }
                if (chartType === 'area') {
                  return <Area key={key} type="monotone" dataKey={key} stroke={color} fill={color} fillOpacity={0.6} strokeWidth={2}>
                    {showDataLabels && <LabelList dataKey={key} position="top" fill="var(--text-secondary)" fontSize={11} formatter={dataLabelFormatter} />}
                  </Area>;
                }
                return null;
            })}
          </ChartComponent>
        )}
      </ResponsiveContainer>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Chart" : "Chart Studio"} maxWidth="max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[70vh]">
        {/* Configuration Panel */}
        <div className="md:col-span-1 flex flex-col gap-6 bg-black/10 p-4 rounded-lg overflow-y-auto">
          {/* Chart Type */}
          <div>
            <h3 className="font-semibold mb-2">Chart Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {(['bar', 'line', 'area', 'pie'] as ChartType[]).map(type => (
                <button key={type} onClick={() => setChartType(type)} className={`capitalize p-2 rounded-md text-sm transition-colors flex items-center justify-center gap-2 ${chartType === type ? 'bg-[var(--bg-accent)] text-[var(--text-on-accent)]' : 'bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)]'}`}>
                   { {bar: <ChartIcon className="w-4 h-4" />, area: <AreaChartIcon className="w-4 h-4" />, line: <LineChartIcon className="w-4 h-4" />, pie: <span className="w-4 h-4 leading-4 font-bold">&#9675;</span>}[type] } {type}
                </button>
              ))}
            </div>
          </div>

          {/* Data Selection */}
          <div>
            <h3 className="font-semibold mb-2">Data</h3>
            <div className="space-y-3">
              <select value={xAxisKey} onChange={e => setXAxisKey(e.target.value)} className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none">
                <option value="">{chartType === 'pie' ? 'Select Label Column' : 'Select X-Axis'}</option>
                {xAxisColumns.map(c => <option key={c.id} value={c.label}>{c.label}</option>)}
              </select>
              
              <div className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md p-2 space-y-2 max-h-40 overflow-y-auto">
                <label className="font-medium text-sm text-[var(--text-secondary)] px-1">{chartType === 'pie' ? 'Value Column (select one)' : 'Y-Axis Columns'}</label>
                {numericColumns.map(c => (
                  <label key={c.id} className="flex items-center gap-2 p-1.5 hover:bg-[var(--bg-contrast-hover)] rounded-md cursor-pointer">
                    <input type="checkbox" checked={yAxisKeys.includes(c.label)} onChange={() => handleYAxisToggle(c.label)} className="form-checkbox h-4 w-4 rounded bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--bg-accent)] focus:ring-[var(--ring-color)]" />
                    <span>{c.label}</span>
                  </label>
                ))}
              </div>
              {yAxisKeys.length > 0 && (
                <div className="pt-3 mt-3 border-t border-[var(--border-color)]">
                  <label className="font-medium text-sm text-[var(--text-secondary)] px-1">Series Config</label>
                  <div className="space-y-2 mt-2">
                    {yAxisKeys.map(key => (
                      <div key={key} className="grid grid-cols-3 items-center justify-between gap-2 bg-[var(--bg-contrast)] p-1.5 rounded-md">
                        <span className="text-sm text-[var(--text-secondary)] truncate px-1 col-span-1">{key}</span>
                        <select 
                          value={seriesConfig[key] || 'SUM'}
                          onChange={(e) => handleAggregationChange(key, e.target.value as Computation)}
                          className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-[var(--ring-color)] focus:outline-none col-span-1"
                        >
                          <option value="SUM">Sum</option>
                          <option value="AVERAGE">Average</option>
                          <option value="COUNT">Count</option>
                          <option value="MIN">Min</option>
                          <option value="MAX">Max</option>
                        </select>
                        {chartType === 'bar' && (
                           <select 
                           value={seriesType[key] || 'bar'}
                           onChange={(e) => handleSeriesTypeChange(key, e.target.value as 'bar' | 'line')}
                           className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-[var(--ring-color)] focus:outline-none col-span-1"
                         >
                           <option value="bar">Bar</option>
                           <option value="line">Line</option>
                         </select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Customization */}
          {yAxisKeys.length > 0 && chartType !== 'pie' && (
            <div>
              <h3 className="font-semibold mb-2">Customize</h3>
              <div className="space-y-4">
                 <input type="text" value={chartTitle} onChange={e => setChartTitle(e.target.value)} placeholder="Chart Title" className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none" />
                {yAxisKeys.map((key) => (
                  <div key={key}>
                    <label className="text-sm font-medium text-[var(--text-secondary)]">{key} Color</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {chartColors.map(color => (
                        <button key={color} style={{ backgroundColor: color }} onClick={() => handleColorChange(key, color)} className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${seriesColors[key] === color ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-card)] ring-white' : ''}`} />
                      ))}
                    </div>
                  </div>
                ))}
                {chartType === 'bar' && uniqueXAxisValues.length > 0 && (
                    <div className="pt-3 mt-3 border-t border-[var(--border-color)]">
                        <h4 className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
                           <ColorSwatchIcon /> Category Colors
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                          {uniqueXAxisValues.map(value => (
                            <div key={value} className="flex items-center justify-between gap-2">
                              <label className="text-sm truncate flex-grow" title={value}>{value}</label>
                              <input 
                                type="color" 
                                value={valueColors[value] || '#8884d8'} 
                                onChange={e => handleValueColorChange(value, e.target.value)}
                                className="w-10 h-6 p-0 bg-transparent border border-[var(--border-color)] rounded-md cursor-pointer" 
                              />
                            </div>
                          ))}
                        </div>
                    </div>
                )}
                {/* Chart Options */}
                <div className="pt-3 mt-3 border-t border-[var(--border-color)] space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer" data-tooltip="Display the exact value on top of each bar, line point, or area segment.">
                        <input type="checkbox" checked={showDataLabels} onChange={e => setShowDataLabels(e.target.checked)} className="form-checkbox h-4 w-4 rounded bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--bg-accent)] focus:ring-[var(--ring-color)]" />
                        <span>Show Data Labels</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer" data-tooltip="Add a horizontal line to the chart to indicate a target, average, or threshold.">
                        <input type="checkbox" checked={refLine.enabled} onChange={e => setRefLine(prev => ({ ...prev, enabled: e.target.checked }))} className="form-checkbox h-4 w-4 rounded bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--bg-accent)] focus:ring-[var(--ring-color)]" />
                        <span>Add Reference Line</span>
                    </label>
                    {refLine.enabled && (
                        <div className="mt-2 space-y-2 pl-6">
                            <input type="text" value={refLine.label} onChange={e => setRefLine(prev => ({...prev, label: e.target.value}))} placeholder="Line Label" className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-1 text-sm" />
                            <input type="number" value={refLine.value} onChange={e => setRefLine(prev => ({...prev, value: parseFloat(e.target.value) || 0}))} placeholder="Value" className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-1 text-sm" />
                            <input type="color" value={refLine.color} onChange={e => setRefLine(prev => ({...prev, color: e.target.value}))} className="w-full h-8 p-0 bg-transparent border border-[var(--border-color)] rounded-md cursor-pointer" />
                        </div>
                    )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chart Preview */}
        <div className="md:col-span-2 bg-black/10 p-4 rounded-lg flex flex-col items-center justify-center">
            <h2 className="text-xl font-bold w-full text-center">{chartTitle}</h2>
            {renderChart()}
        </div>
      </div>
       <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-[var(--border-color)]">
          <button type="button" onClick={onClose} className="py-2 px-4 bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={!xAxisKey || yAxisKeys.length === 0} className="flex items-center gap-2 py-2 px-4 bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] text-[var(--text-on-accent)] rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
            <CheckIcon />
            {isEditing ? 'Save Changes' : 'Save Chart'}
          </button>
        </div>
    </Modal>
  );
};

export default ChartModal;
