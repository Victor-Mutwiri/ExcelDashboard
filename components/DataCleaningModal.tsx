
import React, { useState, useMemo } from 'react';
import { Modal } from './Modal';
import { RowData, ColumnConfig } from '../types';
import { countDuplicates, removeDuplicates, getMissingValueStats, fillMissingValues, MissingValueStrategy, formatTextColumn, TextFormatType } from '../utils/dataCleaner';
import { BroomIcon, CheckIcon, TrashIcon } from './Icons';

interface DataCleaningModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: RowData[];
  columnConfig: ColumnConfig[];
  onSave: (newData: RowData[]) => void;
}

const DataCleaningModal: React.FC<DataCleaningModalProps> = ({ isOpen, onClose, data, columnConfig, onSave }) => {
  const [activeTab, setActiveTab] = useState<'duplicates' | 'missing' | 'formatting'>('duplicates');
  const [workingData, setWorkingData] = useState<RowData[]>(data);
  const [tempData, setTempData] = useState<RowData[]>(data); // For tracking changes within the modal session

  // Duplicates State
  const [duplicateKeys, setDuplicateKeys] = useState<string[]>([]);
  
  // Missing Values State
  const [missingStrategies, setMissingStrategies] = useState<Record<string, MissingValueStrategy>>({});

  // Formatting State
  const [formatOperations, setFormatOperations] = useState<Record<string, TextFormatType>>({});

  // Reset or Sync when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setWorkingData(data);
      setTempData(data);
      setDuplicateKeys([]);
      setMissingStrategies({});
      setFormatOperations({});
    }
  }, [isOpen, data]);

  // --- DUPLICATES LOGIC ---
  const duplicateCount = useMemo(() => {
    return countDuplicates(tempData, duplicateKeys);
  }, [tempData, duplicateKeys]);

  const handleRemoveDuplicates = () => {
    const cleaned = removeDuplicates(tempData, duplicateKeys);
    setTempData(cleaned);
    setDuplicateKeys([]); // Reset selection
  };

  // --- MISSING VALUES LOGIC ---
  const missingStats = useMemo(() => {
    return getMissingValueStats(tempData, columnConfig);
  }, [tempData, columnConfig]);

  const handleApplyMissing = () => {
    let newData = [...tempData];
    Object.entries(missingStrategies).forEach(([colLabel, strategy]) => {
      newData = fillMissingValues(newData, colLabel, strategy, columnConfig.filter(c => c.isNumeric));
    });
    setTempData(newData);
    setMissingStrategies({});
  };

  // --- FORMATTING LOGIC ---
  const textColumns = columnConfig.filter(c => !c.isNumeric);

  const handleApplyFormatting = () => {
    let newData = [...tempData];
    Object.entries(formatOperations).forEach(([colLabel, type]) => {
      newData = formatTextColumn(newData, colLabel, type);
    });
    setTempData(newData);
    setFormatOperations({});
  };

  // --- GLOBAL SAVE ---
  const handleSave = () => {
    onSave(tempData);
    onClose();
  };

  const tabs = [
    { id: 'duplicates', label: 'Remove Duplicates' },
    { id: 'missing', label: 'Missing Values' },
    { id: 'formatting', label: 'Text Formatting' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Clean Data" maxWidth="max-w-4xl">
      <div className="flex flex-col h-[70vh]">
        {/* Tabs */}
        <div className="flex border-b border-[var(--border-color)] mb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 font-semibold text-sm transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto p-2">
          
          {/* DUPLICATES TAB */}
          {activeTab === 'duplicates' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-contrast)] p-4 rounded-lg border border-[var(--border-color)]">
                <p className="text-sm text-[var(--text-secondary)] mb-3">
                  Select columns to identify duplicates. Rows with identical values in <strong>all</strong> selected columns will be treated as duplicates.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                  {columnConfig.map(col => (
                    <label key={col.id} className="flex items-center gap-2 p-2 hover:bg-[var(--bg-input)] rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={duplicateKeys.includes(col.label)}
                        onChange={() => setDuplicateKeys(prev => 
                          prev.includes(col.label) ? prev.filter(k => k !== col.label) : [...prev, col.label]
                        )}
                        className="form-checkbox text-[var(--color-accent)]"
                      />
                      <span className="text-sm truncate">{col.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-black/5 p-4 rounded-lg">
                <div>
                   <span className="text-lg font-bold">{duplicateCount}</span>
                   <span className="text-[var(--text-secondary)] ml-2">duplicates found</span>
                </div>
                <button
                  onClick={handleRemoveDuplicates}
                  disabled={duplicateCount === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <TrashIcon className="w-4 h-4" /> Remove Duplicates
                </button>
              </div>
            </div>
          )}

          {/* MISSING VALUES TAB */}
          {activeTab === 'missing' && (
            <div className="space-y-4">
               <div className="bg-[var(--bg-contrast)] p-3 rounded-lg border border-[var(--border-color)] mb-4">
                 <p className="text-sm text-[var(--text-secondary)]">
                   Define how to handle empty cells for each column.
                 </p>
               </div>
               <div className="space-y-2">
                 {columnConfig.map(col => {
                   const count = missingStats[col.label] || 0;
                   if (count === 0) return null;
                   return (
                     <div key={col.id} className="flex flex-col md:flex-row md:items-center justify-between bg-[var(--bg-input)] p-3 rounded border border-[var(--border-color)] gap-3">
                        <div className="flex items-center gap-3">
                            <div className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">{count} missing</div>
                            <span className="font-semibold text-sm">{col.label}</span>
                            <span className="text-xs text-[var(--text-tertiary)]">({col.isNumeric ? 'Numeric' : 'Text'})</span>
                        </div>
                        <select
                          value={missingStrategies[col.label] || ''}
                          onChange={(e) => setMissingStrategies(prev => ({ ...prev, [col.label]: e.target.value as any }))}
                          className="bg-[var(--bg-contrast)] border border-[var(--border-color)] rounded px-2 py-1 text-sm focus:ring-1 focus:ring-[var(--color-accent)]"
                        >
                          <option value="">-- Select Action --</option>
                          <option value="remove">Remove entire row</option>
                          {col.isNumeric && <option value="zero">Fill with 0</option>}
                          {col.isNumeric && <option value="average">Fill with Average</option>}
                          {!col.isNumeric && <option value="unknown">Fill with "Unknown"</option>}
                        </select>
                     </div>
                   );
                 })}
                 {Object.values(missingStats).every(v => v === 0) && (
                    <div className="text-center text-[var(--text-tertiary)] py-8">No missing values detected.</div>
                 )}
               </div>
               {Object.keys(missingStrategies).length > 0 && (
                 <div className="flex justify-end mt-4">
                    <button onClick={handleApplyMissing} className="px-4 py-2 bg-[var(--bg-accent)] text-[var(--text-on-accent)] rounded-lg text-sm font-semibold hover:bg-[var(--bg-accent-hover)]">
                        Apply Strategies
                    </button>
                 </div>
               )}
            </div>
          )}

          {/* FORMATTING TAB */}
          {activeTab === 'formatting' && (
             <div className="space-y-4">
                <div className="bg-[var(--bg-contrast)] p-3 rounded-lg border border-[var(--border-color)] mb-4">
                 <p className="text-sm text-[var(--text-secondary)]">
                   Standardize text columns.
                 </p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {textColumns.map(col => (
                   <div key={col.id} className="bg-[var(--bg-input)] p-3 rounded border border-[var(--border-color)] flex items-center justify-between">
                      <span className="text-sm font-semibold truncate max-w-[50%]">{col.label}</span>
                      <select
                          value={formatOperations[col.label] || ''}
                          onChange={(e) => setFormatOperations(prev => ({ ...prev, [col.label]: e.target.value as any }))}
                          className="bg-[var(--bg-contrast)] border border-[var(--border-color)] rounded px-2 py-1 text-sm focus:ring-1 focus:ring-[var(--color-accent)] w-40"
                        >
                          <option value="">-- No Change --</option>
                          <option value="trim">Trim Whitespace</option>
                          <option value="upper">UPPERCASE</option>
                          <option value="lower">lowercase</option>
                          <option value="title">Title Case</option>
                      </select>
                   </div>
                 ))}
               </div>
               {Object.keys(formatOperations).length > 0 && (
                 <div className="flex justify-end mt-4">
                    <button onClick={handleApplyFormatting} className="px-4 py-2 bg-[var(--bg-accent)] text-[var(--text-on-accent)] rounded-lg text-sm font-semibold hover:bg-[var(--bg-accent-hover)]">
                        Apply Formatting
                    </button>
                 </div>
               )}
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-[var(--border-color)] mt-2">
          <div className="text-sm">
            <span className="font-semibold">{tempData.length}</span> rows remaining
            {tempData.length !== data.length && (
               <span className="text-red-500 ml-2">(-{data.length - tempData.length} removed)</span>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg transition-colors">
                Cancel
            </button>
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors">
                <CheckIcon /> Done
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DataCleaningModal;
