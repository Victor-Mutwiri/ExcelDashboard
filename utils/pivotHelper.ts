
import { RowData, Computation, PivotWidgetConfig } from '../types';

export interface PivotNode {
    key: string;
    value: number | null;
    count: number;
    children: Record<string, PivotNode>;
}

export interface PivotResult {
    rowKeys: string[]; // Unique values for the row dimension(s)
    colKeys: string[]; // Unique values for the column dimension(s)
    data: Record<string, Record<string, number>>; // { 'rowKey': { 'colKey': value } }
    rowTotals: Record<string, number>; // { 'rowKey': total }
    colTotals: Record<string, number>; // { 'colKey': total }
    grandTotal: number;
}

const getValue = (row: RowData, field: string): string => {
    const val = row[field];
    return val !== null && val !== undefined ? String(val) : '(Blank)';
};

const aggregate = (values: number[], type: Computation): number => {
    if (values.length === 0) return 0;
    switch (type) {
        case 'SUM': return values.reduce((a, b) => a + b, 0);
        case 'AVERAGE': return values.reduce((a, b) => a + b, 0) / values.length;
        case 'MIN': return Math.min(...values);
        case 'MAX': return Math.max(...values);
        case 'COUNT': return values.length;
        default: return 0;
    }
};

export const computePivotTable = (data: RowData[], config: PivotWidgetConfig): PivotResult => {
    const { rowFields, colFields, valueField, aggregation } = config;

    // 1. Collect Unique Keys
    // Note: For MVP, we are handling single level Row/Col grouping. 
    // Multi-level would require recursive structure. 
    // We will concatenate keys for simplicity if multiple fields are selected, or just take the first one for now.
    const activeRowField = rowFields[0];
    const activeColField = colFields[0];
    
    // Using Sets to find unique values
    const rowKeySet = new Set<string>();
    const colKeySet = new Set<string>();
    
    // 2. Bucket Data
    // Structure: Map<RowKey, Map<ColKey, number[]>>
    const buckets = new Map<string, Map<string, number[]>>();

    data.forEach(row => {
        const rKey = activeRowField ? getValue(row, activeRowField) : 'Total';
        const cKey = activeColField ? getValue(row, activeColField) : 'Total';
        
        rowKeySet.add(rKey);
        colKeySet.add(cKey);

        let val = 0;
        const rawVal = row[valueField];
        if (typeof rawVal === 'number') {
            val = rawVal;
        } else if (aggregation === 'COUNT') {
            val = 1; // For count, presence matters
        }

        if (!buckets.has(rKey)) {
            buckets.set(rKey, new Map());
        }
        const rowMap = buckets.get(rKey)!;
        if (!rowMap.has(cKey)) {
            rowMap.set(cKey, []);
        }
        rowMap.get(cKey)!.push(val);
    });

    const rowKeys = Array.from(rowKeySet).sort();
    const colKeys = Array.from(colKeySet).sort();

    // 3. Calculate Aggregations
    const resultData: Record<string, Record<string, number>> = {};
    const rowTotals: Record<string, number> = {};
    const colTotals: Record<string, number> = {};
    let grandTotalVals: number[] = [];

    rowKeys.forEach(rKey => {
        resultData[rKey] = {};
        const rowVals: number[] = [];
        
        colKeys.forEach(cKey => {
            const rawValues = buckets.get(rKey)?.get(cKey) || [];
            const aggValue = aggregate(rawValues, aggregation);
            
            resultData[rKey][cKey] = aggValue;
            rowVals.push(...rawValues);
            
            // Add to col total bucket (we need raw values for correct aggregation like AVG)
            // Optimization: For SUM/COUNT we could add aggValue, but for MIN/MAX/AVG we need raw.
            // To keep it simple and performant for MVP, we might approximate totals or re-bucket.
            // Let's re-bucket for column totals.
        });
        rowTotals[rKey] = aggregate(rowVals, aggregation);
        grandTotalVals.push(...rowVals);
    });

    // Column Totals Logic
    colKeys.forEach(cKey => {
        const colVals: number[] = [];
        rowKeys.forEach(rKey => {
             const rawValues = buckets.get(rKey)?.get(cKey) || [];
             colVals.push(...rawValues);
        });
        colTotals[cKey] = aggregate(colVals, aggregation);
    });

    const grandTotal = aggregate(grandTotalVals, aggregation);

    return {
        rowKeys,
        colKeys,
        data: resultData,
        rowTotals,
        colTotals,
        grandTotal
    };
};
