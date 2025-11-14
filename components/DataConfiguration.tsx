
import React, { useState, useMemo, useEffect } from 'react';
import type { ColumnConfig, ParsedFile, RowData } from '../types';
import { TableIcon, ResetIcon, CheckIcon, CloseIcon } from './Icons';
import { evaluateFormula } from '../utils/formulaEvaluator';

interface DataConfigurationProps {
  fileName: string;
  parsedFile: ParsedFile;
  selectedSheet: string;
  onSheetSelect: (sheetName: string) => void;
  initialColumnConfig: ColumnConfig[];
  onConfirm: (config: ColumnConfig[]) => void;
  onReset: () => void;
}

const DraggableHeader: React.FC<{
  config: ColumnConfig;
  index: number;
  onDragStart: (index: number) => void;
  onDrop: (index: number) => void;
  onLabelChange: (id: string, newLabel: string) => void;
  onRemove: (id: string) => void;
}> = ({ config, index, onDragStart, onDrop, onLabelChange, onRemove }) => {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      draggable={!config.formula}
      onDragStart={() => onDragStart(index)}
      onDrop={() => onDrop(index)}
      onDragOver={handleDragOver}
      className={`p-3 bg-gray-700 rounded-md flex items-center gap-2 group ${config.formula ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <input
        type="text"
        value={config.label}
        onChange={(e) => onLabelChange(config.id, e.target.value)}
        className="flex-grow bg-transparent text-white font-semibold focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded px-2 py-1"
        disabled={!!config.formula}
      />
       {config.formula && <span title="Calculated Column" className="text-indigo-400">ƒx</span>}
      <button
        onClick={() => onRemove(config.id)}
        className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={`Remove column ${config.label}`}
      >
        <CloseIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

const DataConfiguration: React.FC<DataConfigurationProps> = ({
  fileName,
  parsedFile,
  selectedSheet,
  onSheetSelect,
  initialColumnConfig,
  onConfirm,
  onReset,
}) => {
  const [config, setConfig] = useState<ColumnConfig[]>(initialColumnConfig);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    setConfig(initialColumnConfig);
  }, [initialColumnConfig]);

  const sheetNames = Object.keys(parsedFile.sheets);

  const handleLabelChange = (id: string, newLabel: string) => {
    setConfig(prev => prev.map(c => c.id === id ? { ...c, label: newLabel } : c));
  };

  const handleRemoveColumn = (idToRemove: string) => {
    const isDependency = config.some(c => 
      c.formula?.includes(`{${idToRemove}}`)
    );
    if (isDependency) {
      alert('This column is used in a calculation and cannot be removed. Please remove the calculated column first.');
      return;
    }
    setConfig(prev => prev.filter(c => c.id !== idToRemove));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };
  
  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null) return;

    const newConfig = [...config];
    const draggedItem = newConfig[draggedIndex];
    
    if (config[dropIndex].formula) {
      setDraggedIndex(null);
      return;
    }

    newConfig.splice(draggedIndex, 1);
    
    const newDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;

    newConfig.splice(newDropIndex, 0, draggedItem);
    setConfig(newConfig);
    setDraggedIndex(null);
  };

  const previewRows = useMemo(() => {
    if (!selectedSheet) return [];
    const rawRows = parsedFile.sheets[selectedSheet].slice(1, 6);

    const originalColumns = config.filter(c => !c.formula);
    const calculatedColumns = config.filter(c => c.formula);

    return rawRows.map(rawRow => {
      const processedRow: RowData = {};
      
      originalColumns.forEach(col => {
        const originalIndex = parseInt(col.id.split('_')[1]);
        let value = rawRow[originalIndex];
        if (col.isNumeric) {
          value = value !== null ? parseFloat(value) : null;
          if (isNaN(value as number)) value = null;
        }
        processedRow[col.id] = value;
      });

      calculatedColumns.forEach(col => {
        const formula = col.formula!;
        const colIdRegex = /\{([^}]+)\}/g;
        let match;
        const dependencies = new Set<string>();
        while ((match = colIdRegex.exec(formula)) !== null) {
          dependencies.add(match[1]);
        }
        
        const valueMap: Record<string, number> = {};
        let canCalculate = true;

        dependencies.forEach(depId => {
          const depValue = processedRow[depId];
          if (typeof depValue === 'number') {
            valueMap[depId] = depValue;
          } else {
            canCalculate = false;
          }
        });

        processedRow[col.id] = canCalculate ? evaluateFormula(formula, valueMap) : null;
      });
      return processedRow;
    });
  }, [selectedSheet, parsedFile.sheets, config]);


  if (!selectedSheet && sheetNames.length > 1) {
    return (
      <div className="w-full max-w-3xl p-8 bg-gray-800 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-2">Select a Worksheet</h2>
        <p className="text-gray-400 mb-6">Your file "{fileName}" contains multiple sheets. Please choose one to continue.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {sheetNames.map(name => (
            <button
              key={name}
              onClick={() => onSheetSelect(name)}
              className="flex items-center gap-2 p-4 bg-gray-700 hover:bg-indigo-600 rounded-lg transition-colors"
            >
              <TableIcon /> {name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-6xl p-8 bg-gray-800 rounded-2xl shadow-lg flex flex-col gap-6">
          <div>
              <h2 className="text-2xl font-bold text-white">Configure Your Data</h2>
              <p className="text-gray-400">Rename, reorder, or remove columns. This will be the structure for your dashboard.</p>
          </div>

          <div className="bg-gray-900/50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Columns</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {config.map((c, i) => (
                  <DraggableHeader
                  key={c.id}
                  config={c}
                  index={i}
                  onDragStart={handleDragStart}
                  onDrop={handleDrop}
                  onLabelChange={handleLabelChange}
                  onRemove={handleRemoveColumn}
                  />
              ))}
              </div>
          </div>

          <div className="bg-gray-900/50 p-4 rounded-lg overflow-x-auto">
              <h3 className="font-semibold mb-3 text-lg">Data Preview</h3>
              <table className="w-full text-left text-sm">
              <thead>
                  <tr>
                  {config.map(c => <th key={c.id} className="p-2 font-semibold border-b border-gray-600">{c.label}</th>)}
                  </tr>
              </thead>
              <tbody>
                  {previewRows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-gray-700/50">
                        {config.map(c => {
                            const value = row[c.id];
                            const displayValue = typeof value === 'number' ? value.toLocaleString(undefined, {maximumFractionDigits: 2}) : String(value ?? '');
                            return <td key={c.id} className="p-2 truncate max-w-[150px]">{displayValue}</td>
                        })}
                    </tr>
                  ))}
              </tbody>
              </table>
          </div>

          <div className="flex justify-between items-center mt-4">
              <button onClick={onReset} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ResetIcon /> Back
              </button>
              <button onClick={() => onConfirm(config)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">
              <CheckIcon /> Confirm & Build Dashboard
              </button>
          </div>
      </div>
    </>
  );
};

export default DataConfiguration;