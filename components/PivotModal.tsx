
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { ColumnConfig, Computation, PivotWidgetConfig } from '../types';
import { PivotIcon, ChevronRightIcon, TrashIcon, PlusIcon } from './Icons';

interface PivotModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnConfig: ColumnConfig[];
  onSave: (config: PivotWidgetConfig) => void;
  initialConfig?: PivotWidgetConfig;
}

const PivotModal: React.FC<PivotModalProps> = ({ isOpen, onClose, columnConfig, onSave, initialConfig }) => {
  const [title, setTitle] = useState('Pivot Table');
  const [rowField, setRowField] = useState<string>('');
  const [colField, setColField] = useState<string>('');
  const [valueField, setValueField] = useState<string>('');
  const [aggregation, setAggregation] = useState<Computation>('SUM');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialConfig) {
        setTitle(initialConfig.title);
        setRowField(initialConfig.rowFields[0] || '');
        setColField(initialConfig.colFields[0] || '');
        setValueField(initialConfig.valueField);
        setAggregation(initialConfig.aggregation);
      } else {
        setTitle('Pivot Table');
        setRowField('');
        setColField('');
        setValueField('');
        setAggregation('SUM');
      }
      setError('');
    }
  }, [isOpen, initialConfig]);

  const handleSave = () => {
    if (!title.trim()) {
        setError('Title is required.');
        return;
    }
    if (!rowField && !colField) {
        setError('Please select at least a Row or a Column field.');
        return;
    }
    if (!valueField) {
        setError('Please select a Value field to aggregate.');
        return;
    }

    onSave({
        title,
        rowFields: rowField ? [rowField] : [],
        colFields: colField ? [colField] : [],
        valueField,
        aggregation
    });
    onClose();
  };

  const numericColumns = columnConfig.filter(c => c.isNumeric);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Pivot Table" maxWidth="max-w-4xl">
      <div className="flex flex-col gap-6">
        <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Widget Title</label>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none"
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rows */}
            <div className="p-4 bg-[var(--bg-contrast)] rounded-lg border border-[var(--border-color)]">
                <h4 className="font-bold mb-3 flex items-center gap-2"><ChevronRightIcon className="rotate-90 w-4 h-4" /> Rows (Y-Axis)</h4>
                <select 
                    value={rowField} 
                    onChange={e => setRowField(e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm mb-2"
                >
                    <option value="">-- Select Row Field --</option>
                    {columnConfig.map(c => <option key={c.id} value={c.label}>{c.label}</option>)}
                </select>
                <p className="text-xs text-[var(--text-tertiary)]">Group data vertically by unique values in this column.</p>
            </div>

            {/* Columns */}
            <div className="p-4 bg-[var(--bg-contrast)] rounded-lg border border-[var(--border-color)]">
                <h4 className="font-bold mb-3 flex items-center gap-2"><ChevronRightIcon className="w-4 h-4" /> Columns (X-Axis)</h4>
                <select 
                    value={colField} 
                    onChange={e => setColField(e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm mb-2"
                >
                    <option value="">-- Select Column Field --</option>
                    {columnConfig.map(c => <option key={c.id} value={c.label}>{c.label}</option>)}
                </select>
                <p className="text-xs text-[var(--text-tertiary)]">Group data horizontally. Optional if Rows are selected.</p>
            </div>

            {/* Values */}
            <div className="p-4 bg-[var(--bg-contrast)] rounded-lg border border-[var(--border-color)]">
                <h4 className="font-bold mb-3 flex items-center gap-2"><PlusIcon className="w-4 h-4" /> Values (Calculated)</h4>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-semibold text-[var(--text-secondary)]">Field</label>
                        <select 
                            value={valueField} 
                            onChange={e => setValueField(e.target.value)}
                            className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm"
                        >
                            <option value="">-- Select Value Field --</option>
                            {columnConfig.map(c => <option key={c.id} value={c.label}>{c.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-[var(--text-secondary)]">Aggregation</label>
                        <select 
                            value={aggregation} 
                            onChange={e => setAggregation(e.target.value as Computation)}
                            className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm"
                        >
                            <option value="SUM">Sum</option>
                            <option value="COUNT">Count</option>
                            <option value="AVERAGE">Average</option>
                            <option value="MIN">Min</option>
                            <option value="MAX">Max</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm text-center">{error}</div>}

        <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-[var(--border-color)]">
          <button type="button" onClick={onClose} className="py-2 px-4 bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg transition-colors">Cancel</button>
          <button type="button" onClick={handleSave} className="flex items-center gap-2 py-2 px-4 bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] text-[var(--text-on-accent)] rounded-lg transition-colors font-semibold">
            <PivotIcon /> Build Pivot Table
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PivotModal;
