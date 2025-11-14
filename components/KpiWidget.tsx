import React, { useMemo } from 'react';
import { KpiWidget, RowData, Computation } from '../types';

interface KpiWidgetComponentProps {
  widget: KpiWidget;
  data: RowData[];
}

const KpiWidgetComponent: React.FC<KpiWidgetComponentProps> = ({ widget, data }) => {
  const { config } = widget;

  const computedValue = useMemo(() => {
    const { column, computation } = config;
    if (!column) return null;

    const values = data
      .map(row => row[column])
      .filter(val => typeof val === 'number') as number[];

    if (values.length === 0 && computation !== 'COUNT') return 0;
    
    let result: number;
    switch (computation) {
      case 'SUM':
        result = values.reduce((acc, val) => acc + val, 0);
        break;
      case 'AVERAGE':
        result = values.reduce((acc, val) => acc + val, 0) / values.length;
        break;
      case 'MIN':
        result = Math.min(...values);
        break;
      case 'MAX':
        result = Math.max(...values);
        break;
      case 'COUNT':
        result = data.map(row => row[column]).filter(val => val !== null && val !== undefined).length;
        break;
      default:
        return null;
    }
    return result;
  }, [data, config]);

  const displayValue = computedValue !== null 
    ? computedValue.toLocaleString(undefined, { maximumFractionDigits: 2 }) 
    : 'N/A';

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <p className="text-sm text-gray-400 uppercase tracking-wider">{config.computation} of {config.column}</p>
      <p className="text-4xl lg:text-5xl font-bold text-indigo-400 mt-2">{displayValue}</p>
    </div>
  );
};

export default KpiWidgetComponent;
