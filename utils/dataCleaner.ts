
import { RowData, ColumnConfig } from '../types';

/**
 * Attempts to parse a value into a number after sanitizing it.
 * Removes common currency symbols and thousands separators.
 * @param value The value to parse.
 * @returns A number, or null if parsing is not possible.
 */
export const parseNumericValue = (value: any): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }
  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  // Remove common currency symbols and thousands separators.
  const sanitized = value.trim().replace(/[$,€£,]/g, '');

  // Avoid parsing empty strings or just a dot/minus as a number
  if (sanitized === '' || sanitized === '.' || sanitized === '-') return null;

  const num = parseFloat(sanitized);
  return isNaN(num) ? null : num;
};

/**
 * Checks if a value can be considered numeric after sanitization.
 * @param value The value to check.
 * @returns True if the value is numeric, false otherwise.
 */
export const isPotentiallyNumeric = (value: any): boolean => {
  return parseNumericValue(value) !== null;
};

// --- Data Cleaning Functions ---

// DUPLICATES

export const countDuplicates = (data: RowData[], keys: string[]): number => {
  if (keys.length === 0) return 0;
  const seen = new Set<string>();
  let duplicates = 0;
  
  for (const row of data) {
    const compositeKey = keys.map(k => String(row[k])).join('|');
    if (seen.has(compositeKey)) {
      duplicates++;
    } else {
      seen.add(compositeKey);
    }
  }
  return duplicates;
};

export const removeDuplicates = (data: RowData[], keys: string[]): RowData[] => {
  if (keys.length === 0) return data;
  const seen = new Set<string>();
  return data.filter(row => {
    const compositeKey = keys.map(k => String(row[k])).join('|');
    if (seen.has(compositeKey)) {
      return false;
    }
    seen.add(compositeKey);
    return true;
  });
};

// MISSING VALUES

export const getMissingValueStats = (data: RowData[], columns: ColumnConfig[]) => {
  const stats: Record<string, number> = {};
  columns.forEach(col => {
    stats[col.label] = 0;
  });

  data.forEach(row => {
    columns.forEach(col => {
      const val = row[col.label];
      if (val === null || val === undefined || val === '') {
        stats[col.label]++;
      }
    });
  });
  return stats;
};

export type MissingValueStrategy = 'remove' | 'zero' | 'unknown' | 'average';

export const fillMissingValues = (data: RowData[], column: string, strategy: MissingValueStrategy, numericColumns: ColumnConfig[]): RowData[] => {
  // For 'remove', filter rows
  if (strategy === 'remove') {
    return data.filter(row => {
      const val = row[column];
      return val !== null && val !== undefined && val !== '';
    });
  }

  // Calculate average if needed
  let average = 0;
  if (strategy === 'average') {
    const isNumeric = numericColumns.some(c => c.label === column);
    if (isNumeric) {
      const validValues = data
        .map(r => r[column])
        .filter(v => typeof v === 'number') as number[];
      if (validValues.length > 0) {
        average = validValues.reduce((a, b) => a + b, 0) / validValues.length;
      }
    }
  }

  return data.map(row => {
    const val = row[column];
    if (val === null || val === undefined || val === '') {
      let newVal: any = val;
      switch (strategy) {
        case 'zero': newVal = 0; break;
        case 'unknown': newVal = 'Unknown'; break;
        case 'average': newVal = average; break;
      }
      return { ...row, [column]: newVal };
    }
    return row;
  });
};

// FORMATTING

export type TextFormatType = 'trim' | 'upper' | 'lower' | 'title';

const toTitleCase = (str: string) => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

export const formatTextColumn = (data: RowData[], column: string, type: TextFormatType): RowData[] => {
  return data.map(row => {
    const val = row[column];
    if (typeof val === 'string') {
      let newVal = val;
      switch (type) {
        case 'trim': newVal = val.trim(); break;
        case 'upper': newVal = val.toUpperCase(); break;
        case 'lower': newVal = val.toLowerCase(); break;
        case 'title': newVal = toTitleCase(val); break;
      }
      return { ...row, [column]: newVal };
    }
    return row;
  });
};
