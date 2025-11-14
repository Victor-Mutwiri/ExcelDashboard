import React, { useMemo } from 'react';
import { KpiWidget, RowData, ColumnConfig } from '../types';
import { calculateKpiValue } from '../utils/kpiEvaluator';

interface KpiWidgetComponentProps {
  widget: KpiWidget;
  data: RowData[];
  columnConfig: ColumnConfig[];
}

const KpiWidgetComponent: React.FC<KpiWidgetComponentProps> = ({ widget, data, columnConfig }) => {
  const { config } = widget;

  const computedValue = useMemo(() => {
    return calculateKpiValue(data, config, columnConfig);
  }, [data, config, columnConfig]);

  const displayValue = computedValue !== null 
    ? computedValue.toLocaleString(undefined, { maximumFractionDigits: 3 }) 
    : 'N/A';

  return (
    <div className="flex flex-col justify-center items-center text-center h-full">
      <h4 className="text-base text-[var(--text-secondary)] font-semibold truncate">{config.title}</h4>
      <p className="text-3xl sm:text-4xl font-bold text-[var(--color-accent)] mt-1">{displayValue}</p>
      <p className="text-sm text-[var(--text-tertiary)] mt-2">{config.computation}</p>
    </div>
  );
};

export default KpiWidgetComponent;
