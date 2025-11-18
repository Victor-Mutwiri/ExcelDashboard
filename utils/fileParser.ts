
import * as XLSX from 'xlsx';
import type { ColumnConfig, RowData, ParsedFile } from '../types';
import { evaluateFormula } from './formulaEvaluator';
import { parseNumericValue } from './dataCleaner';

/**
 * Formats a Date object into a 'YYYY-MM-DD' string.
 * @param date The Date object to format.
 * @returns A formatted date string.
 */
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseFile = (file: File): Promise<ParsedFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const sheets: Record<string, any[][]> = {};
        workbook.SheetNames.forEach((sheetName: string) => {
          const worksheet = workbook.Sheets[sheetName];
          sheets[sheetName] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
        });
        const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
        resolve({ sheets, isExcel });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
};

export const processData = (rawData: any[][], finalConfig: ColumnConfig[]): RowData[] => {
  if (rawData.length < 2) return [];
  const dataRows = rawData.slice(1);

  const originalColumns = finalConfig.filter(c => !c.formula);
  const calculatedColumns = finalConfig.filter(c => c.formula);

  const data: RowData[] = dataRows.map(row => {
    const rowData: RowData = {};
    
    // 1. Process original columns from raw file data
    originalColumns.forEach(config => {
      const originalColumnIndex = parseInt(config.id.split('_')[1]);
      let value = row[originalColumnIndex];
      
      if (value instanceof Date) {
        value = formatDate(value);
      } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
         // Handle ISO strings from JSON restoration
         const dateObj = new Date(value);
         if (!isNaN(dateObj.getTime())) {
             value = formatDate(dateObj);
         }
      } else if (config.isNumeric) {
        value = parseNumericValue(value);
      }
      rowData[config.label] = value;
    });

    // 2. Process calculated columns based on already processed values
    calculatedColumns.forEach(config => {
      const formula = config.formula!;
      const colIdRegex = /\{([^}]+)\}/g;
      let match;
      const dependencies = new Set<string>();
      while ((match = colIdRegex.exec(formula)) !== null) {
        dependencies.add(match[1]);
      }
      
      const valueMap: Record<string, number> = {};
      let canCalculate = true;

      dependencies.forEach(depId => {
        const depConfig = finalConfig.find(c => c.id === depId);
        if (!depConfig) {
          canCalculate = false;
          return;
        }
        const depValue = rowData[depConfig.label];
        if (typeof depValue === 'number') {
          valueMap[depId] = depValue;
        } else {
          canCalculate = false;
        }
      });
      
      rowData[config.label] = canCalculate ? evaluateFormula(formula, valueMap) : null;
    });
    return rowData;
  });
  return data;
};
