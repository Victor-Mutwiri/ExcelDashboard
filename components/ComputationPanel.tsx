
import React, { useState, useMemo } from 'react';
import type { RowData, ColumnConfig, Computation, ComputationResult } from '../types';

interface ComputationPanelProps {
  data: RowData[];
  columnConfig: ColumnConfig[];
}

const computations: Computation[] = ['SUM', 'AVERAGE', 'MIN', 'MAX', 'COUNT'];

const ComputationPanel: React.FC<ComputationPanelProps> = ({ data, columnConfig }) => {
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [results, setResults] = useState<ComputationResult[]>([]);

  const numericColumns = useMemo(() =>
    columnConfig.filter(c => c.isNumeric),
    [columnConfig]
  );

  const handleCompute = (computation: Computation) => {
    if (!selectedColumn) return;

    const values = data
      .map(row => row[selectedColumn])
      .filter(val => typeof val === 'number') as number[];

    if (values.length === 0 && computation !== 'COUNT') return;
    
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
        result = data.map(row => row[selectedColumn]).filter(val => val !== null && val !== undefined).length;
        break;
      default:
        return;
    }

    setResults(prev => [...prev, { column: selectedColumn, computation, value: result }]);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Column Computations</h3>
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="column-select" className="block text-sm font-medium text-gray-300 mb-1">
              Select a numeric column
            </label>
            <select
              id="column-select"
              value={selectedColumn}
              onChange={e => setSelectedColumn(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">-- Choose Column --</option>
              {numericColumns.map(col => (
                <option key={col.id} value={col.label}>{col.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {computations.map(comp => (
              <button
                key={comp}
                onClick={() => handleCompute(comp)}
                disabled={!selectedColumn}
                className="px-4 py-2 bg-gray-700 text-sm font-semibold rounded-md hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {comp}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto">
        <h3 className="text-lg font-semibold text-white mb-3">Results</h3>
        {results.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Your computation results will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((res, i) => (
              <div key={i} className="p-3 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400">{res.computation} of "{res.column}"</p>
                <p className="text-xl font-bold text-indigo-400">{res.value.toLocaleString(undefined, { maximumFractionDigits: 3 })}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComputationPanel;
