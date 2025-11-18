
import React, { useMemo } from 'react';
import { PivotWidget, RowData } from '../types';
import { computePivotTable } from '../utils/pivotHelper';

interface PivotTableWidgetProps {
    widget: PivotWidget;
    data: RowData[];
}

const PivotTableWidget: React.FC<PivotTableWidgetProps> = ({ widget, data }) => {
    const { config } = widget;

    const pivotData = useMemo(() => {
        return computePivotTable(data, config);
    }, [data, config]);

    const { rowKeys, colKeys, data: grid, rowTotals, colTotals, grandTotal } = pivotData;
    
    const hasRowHeader = config.rowFields.length > 0;
    const hasColHeader = config.colFields.length > 0;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-grow overflow-auto border border-[var(--border-color)] rounded-lg">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-[var(--bg-contrast)] text-[var(--text-secondary)] sticky top-0 z-10">
                        {/* Column Headers Row */}
                        <tr>
                            {/* Top Left Corner */}
                            <th className="p-3 border-b border-r border-[var(--border-color)] bg-[var(--bg-contrast)] font-bold sticky left-0 z-20 min-w-[150px]">
                                {hasRowHeader ? config.rowFields[0] : ''} \ {hasColHeader ? config.colFields[0] : ''}
                            </th>
                            
                            {/* Column Keys */}
                            {colKeys.map(cKey => (
                                <th key={cKey} className="p-3 border-b border-[var(--border-color)] font-semibold text-right min-w-[100px]">
                                    {cKey}
                                </th>
                            ))}
                            
                            {/* Grand Total Header */}
                            <th className="p-3 border-b border-l border-[var(--border-color)] font-bold text-right bg-[var(--bg-contrast)] min-w-[100px]">
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Data Rows */}
                        {rowKeys.map(rKey => (
                            <tr key={rKey} className="hover:bg-[var(--bg-contrast-hover)] border-b border-[var(--border-color)] last:border-b-0">
                                {/* Row Label */}
                                <td className="p-3 border-r border-[var(--border-color)] font-semibold bg-[var(--bg-card)] sticky left-0 z-10 truncate max-w-[200px]">
                                    {rKey}
                                </td>

                                {/* Data Cells */}
                                {colKeys.map(cKey => {
                                    const val = grid[rKey]?.[cKey];
                                    return (
                                        <td key={`${rKey}-${cKey}`} className="p-3 text-right text-[var(--text-primary)]">
                                            {val !== undefined ? val.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '-'}
                                        </td>
                                    );
                                })}

                                {/* Row Total */}
                                <td className="p-3 border-l border-[var(--border-color)] font-bold text-right bg-[var(--bg-contrast)]">
                                    {rowTotals[rKey]?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 0}
                                </td>
                            </tr>
                        ))}
                        
                        {/* Column Totals Row */}
                        <tr className="bg-[var(--bg-contrast)] font-bold border-t-2 border-[var(--border-color)] sticky bottom-0 z-10 shadow-lg">
                            <td className="p-3 border-r border-[var(--border-color)] sticky left-0 z-20 bg-[var(--bg-contrast)]">
                                Grand Total
                            </td>
                            {colKeys.map(cKey => (
                                <td key={`total-${cKey}`} className="p-3 text-right">
                                    {colTotals[cKey]?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 0}
                                </td>
                            ))}
                            <td className="p-3 border-l border-[var(--border-color)] text-right">
                                {grandTotal?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 0}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="mt-2 text-xs text-[var(--text-tertiary)] flex justify-between px-1">
                <span>{config.aggregation} of {config.valueField}</span>
                <span>{rowKeys.length} rows x {colKeys.length} columns</span>
            </div>
        </div>
    );
};

export default PivotTableWidget;
