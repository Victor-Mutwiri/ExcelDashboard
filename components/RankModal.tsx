
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { ColumnConfig, Computation, RankWidgetConfig } from '../types';
import { TrophyIcon } from './Icons';

interface RankModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnConfig: ColumnConfig[];
  onSave: (config: RankWidgetConfig) => void;
  initialConfig?: RankWidgetConfig;
}

const RankModal: React.FC<RankModalProps> = ({ isOpen, onClose, columnConfig, onSave, initialConfig }) => {
  const [title, setTitle] = useState('Top Performers');
  const [categoryField, setCategoryField] = useState<string>('');
  const [valueField, setValueField] = useState<string>('');
  const [aggregation, setAggregation] = useState<Computation>('SUM');
  const [limit, setLimit] = useState<number>(5);
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialConfig) {
        setTitle(initialConfig.title);
        setCategoryField(initialConfig.categoryField);
        setValueField(initialConfig.valueField);
        setAggregation(initialConfig.aggregation);
        setLimit(initialConfig.limit);
        setOrder(initialConfig.order);
      } else {
        setTitle('Top Performers');
        setCategoryField('');
        setValueField('');
        setAggregation('SUM');
        setLimit(5);
        setOrder('desc');
      }
      setError('');
    }
  }, [isOpen, initialConfig]);

  const handleSave = () => {
    if (!title.trim()) {
        setError('Title is required.');
        return;
    }
    if (!categoryField) {
        setError('Please select a Category (Item) field.');
        return;
    }
    if (!valueField) {
        setError('Please select a Metric (Value) field.');
        return;
    }

    onSave({
        title,
        categoryField,
        valueField,
        aggregation,
        limit,
        order
    });
    onClose();
  };

  const numericColumns = columnConfig.filter(c => c.isNumeric);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Rank List" maxWidth="max-w-xl">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Category (Item Name)</label>
                <select 
                    value={categoryField} 
                    onChange={e => setCategoryField(e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm"
                >
                    <option value="">-- Select Category --</option>
                    {columnConfig.map(c => <option key={c.id} value={c.label}>{c.label}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Metric (Value)</label>
                <select 
                    value={valueField} 
                    onChange={e => setValueField(e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm"
                >
                    <option value="">-- Select Metric --</option>
                    {numericColumns.map(c => <option key={c.id} value={c.label}>{c.label}</option>)}
                </select>
            </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
             <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Calculation</label>
                <select 
                    value={aggregation} 
                    onChange={e => setAggregation(e.target.value as Computation)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm"
                >
                    <option value="SUM">Sum</option>
                    <option value="AVERAGE">Average</option>
                    <option value="MAX">Max</option>
                    <option value="MIN">Min</option>
                    <option value="COUNT">Count</option>
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Ranking Order</label>
                <select 
                    value={order} 
                    onChange={e => setOrder(e.target.value as 'desc' | 'asc')}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm"
                >
                    <option value="desc">Top (High to Low)</option>
                    <option value="asc">Bottom (Low to High)</option>
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Limit Items</label>
                 <input
                    type="number"
                    min="1"
                    max="50"
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value) || 5)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none"
                />
            </div>
        </div>

        {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm text-center">{error}</div>}

        <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-[var(--border-color)]">
          <button type="button" onClick={onClose} className="py-2 px-4 bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg transition-colors">Cancel</button>
          <button type="button" onClick={handleSave} className="flex items-center gap-2 py-2 px-4 bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] text-[var(--text-on-accent)] rounded-lg transition-colors font-semibold">
            <TrophyIcon /> Create Leaderboard
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RankModal;
