import React, { useState } from 'react';
import { Modal } from './Modal';
import { ColumnConfig, Computation, KpiWidgetConfig } from '../types';
import { KpiIcon } from './Icons';

interface KpiModalProps {
  isOpen: boolean;
  onClose: () => void;
  numericColumns: ColumnConfig[];
  onSubmit: (config: KpiWidgetConfig) => void;
}

const computations: Computation[] = ['SUM', 'AVERAGE', 'MIN', 'MAX', 'COUNT'];

const KpiModal: React.FC<KpiModalProps> = ({ isOpen, onClose, numericColumns, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('');
  const [selectedComputation, setSelectedComputation] = useState<Computation>('SUM');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!selectedColumn) {
      setError('Please select a column.');
      return;
    }
    onSubmit({
      title: title.trim(),
      column: selectedColumn,
      computation: selectedComputation,
    });
    // Reset form for next time
    setTitle('');
    setSelectedColumn('');
    setSelectedComputation('SUM');
    setError('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create KPI Card">
      <div className="flex flex-col gap-6">
        <div>
          <label htmlFor="kpi-title" className="block text-sm font-medium text-gray-300 mb-1">
            Card Title
          </label>
          <input
            id="kpi-title"
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(''); }}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="e.g., Total Revenue"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="kpi-column" className="block text-sm font-medium text-gray-300 mb-1">
                    Column to Calculate
                </label>
                 <select
                    id="kpi-column"
                    value={selectedColumn}
                    onChange={e => { setSelectedColumn(e.target.value); setError(''); }}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                    <option value="">-- Choose Column --</option>
                    {numericColumns.map(col => (
                        <option key={col.id} value={col.label}>{col.label}</option>
                    ))}
                </select>
            </div>
             <div>
                <label htmlFor="kpi-computation" className="block text-sm font-medium text-gray-300 mb-1">
                    Computation
                </label>
                 <select
                    id="kpi-computation"
                    value={selectedComputation}
                    onChange={e => setSelectedComputation(e.target.value as Computation)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                    {computations.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
        </div>

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        
        <div className="flex justify-end gap-4 mt-4">
          <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className="flex items-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors font-semibold">
            <KpiIcon /> Add KPI Card
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default KpiModal;
