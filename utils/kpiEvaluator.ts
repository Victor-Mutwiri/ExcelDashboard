import { RowData, Computation, ColumnConfig } from '../types';
import { evaluateFormula } from './formulaEvaluator';

// This function will compute the final KPI value from the raw data and the widget config.
// The valueFormula should use column IDs like "{col_1}"
export const calculateKpiValue = (
    data: RowData[],
    config: { valueFormula: string; computation: Computation },
    columnConfig: ColumnConfig[]
): number | null => {

    // 1. Calculate the formula's result for each row.
    const rowResults = data.map(row => {
        // Create the value map that evaluateFormula expects, e.g., { col_1: 150.5, col_2: 90 }
        const rowValuesForEval: Record<string, number> = {};
        columnConfig.forEach(c => {
            const value = row[c.label];
            if (typeof value === 'number') {
                rowValuesForEval[c.id] = value;
            }
        });

        return evaluateFormula(config.valueFormula, rowValuesForEval);
    }).filter(val => typeof val === 'number') as number[]; // Filter out nulls/errors

    if (rowResults.length === 0 && config.computation !== 'COUNT') {
        return null;
    }

    // 2. Apply the final aggregation.
    let finalValue: number;
    switch (config.computation) {
        case 'SUM':
            finalValue = rowResults.reduce((acc, val) => acc + val, 0);
            break;
        case 'AVERAGE':
            finalValue = rowResults.length > 0 ? rowResults.reduce((acc, val) => acc + val, 0) / rowResults.length : 0;
            break;
        case 'MIN':
            finalValue = rowResults.length > 0 ? Math.min(...rowResults) : 0;
            break;
        case 'MAX':
            finalValue = rowResults.length > 0 ? Math.max(...rowResults) : 0;
            break;
        case 'COUNT':
            // Count of rows where formula could be successfully computed
            finalValue = rowResults.length;
            break;
        default:
            return null;
    }

    return finalValue;
};
