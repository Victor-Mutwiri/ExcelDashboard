import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from './Modal';
import { ColumnConfig, Computation, KpiWidgetConfig, RowData } from '../types';
import { KpiIcon } from './Icons';
import { validateFormula } from '../utils/formulaEvaluator';
import { calculateKpiValue } from '../utils/kpiEvaluator';

interface KpiModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: RowData[];
  numericColumns: ColumnConfig[];
  onSubmit: (config: KpiWidgetConfig) => void;
}

type FormulaToken = {
  type: 'column' | 'operator' | 'number' | 'paren';
  value: string;
  text: string;
};

const operators = ['+', '-', '*', '/'];
const numbers = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.'];
const computations: Computation[] = ['SUM', 'AVERAGE', 'MIN', 'MAX', 'COUNT'];

const KpiModal: React.FC<KpiModalProps> = ({ isOpen, onClose, data, numericColumns, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [formula, setFormula] = useState<FormulaToken[]>([]);
  const [selectedComputation, setSelectedComputation] = useState<Computation>('SUM');
  const [error, setError] = useState('');

  const formulaString = useMemo(() => formula.map(t => t.value).join(' '), [formula]);
  const formulaDisplay = useMemo(() => formula.map(t => {
      if(t.type === 'column') return <span key={Math.random()} className="bg-indigo-500/50 text-indigo-200 rounded px-1.5 py-0.5">{t.text}</span>;
      if(t.type === 'operator') return <span key={Math.random()} className="text-cyan-400 mx-1">{t.text}</span>;
      if(t.type === 'number') return <span key={Math.random()} className="text-amber-400">{t.text}</span>;
      return <span key={Math.random()}>{t.text}</span>;
  }), [formula]);

   useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setFormula([]);
      setSelectedComputation('SUM');
      setError('');
    }
  }, [isOpen]);

  const livePreview = useMemo(() => {
    const validation = validateFormula(formulaString);
    if (!validation.isValid) {
      return { error: formulaString ? validation.error : 'Build a formula to see the result.' };
    }
    const result = calculateKpiValue(data, { valueFormula: formulaString, computation: selectedComputation }, numericColumns);
    return { result };
  }, [formulaString, selectedComputation, data, numericColumns]);

  const handleAddToken = (token: FormulaToken) => {
    setFormula(prev => {
      const lastToken = prev.length > 0 ? prev[prev.length - 1] : null;
      if (token.type === 'number' && lastToken && lastToken.type === 'number') {
        if (token.value === '.' && lastToken.value.includes('.')) return prev;
        const updatedLastToken = { ...lastToken, value: lastToken.value + token.value, text: lastToken.text + token.text };
        return [...prev.slice(0, -1), updatedLastToken];
      }
      return [...prev, token];
    });
    setError('');
  };

  const handleBackspace = () => setFormula(prev => prev.slice(0, -1));
  const handleClear = () => setFormula([]);

  const handleSubmit = () => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    const validation = validateFormula(formulaString);
    if (!validation.isValid) {
      setError(validation.error ?? 'The formula is invalid.');
      return;
    }
    onSubmit({
      title: title.trim(),
      valueFormula: formulaString,
      computation: selectedComputation,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create KPI Card">
      <div className="flex flex-col gap-6">
        <div>
          <label htmlFor="kpi-title" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Card Title
          </label>
          <input
            id="kpi-title"
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(''); }}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none"
            placeholder="e.g., Average Profit Margin"
          />
        </div>
        
        <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                KPI Calculation
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left side: builder */}
                <div className="flex flex-col gap-3 p-3 bg-black/10 rounded-lg">
                    <div className="h-16 p-2 bg-[var(--bg-input)] rounded-md border border-[var(--border-color)] flex items-center gap-1 flex-wrap overflow-x-auto">
                        {formula.length === 0 
                            ? <span className="text-[var(--text-tertiary)]">Build a formula...</span>
                            : formulaDisplay
                        }
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {operators.map(op => <button type="button" key={op} onClick={() => handleAddToken({type: 'operator', value: op, text: op})} className="h-10 bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-md text-cyan-400 text-lg font-mono">{op}</button>)}
                        <button type="button" onClick={() => handleAddToken({type: 'paren', value: '(', text: '('})} className="h-10 bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-md text-lg font-mono">(</button>
                        <button type="button" onClick={() => handleAddToken({type: 'paren', value: ')', text: ')'})} className="h-10 bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-md text-lg font-mono">)</button>
                        <button type="button" onClick={handleBackspace} className="h-10 bg-[var(--bg-contrast)] hover:bg-red-500/50 col-span-1 rounded-md">DEL</button>
                        <button type="button" onClick={handleClear} className="h-10 bg-[var(--bg-contrast)] hover:bg-red-500/50 col-span-1 rounded-md">CLR</button>
                        
                        {numbers.map(num => <button type="button" key={num} onClick={() => handleAddToken({type: 'number', value: num, text: num})} className="h-10 bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-md text-amber-400 font-mono">{num}</button>)}
                    </div>
                </div>

                {/* Right side: columns & preview */}
                <div className="flex flex-col gap-3">
                    <div className="p-3 bg-black/10 rounded-lg">
                        <h4 className="font-semibold mb-2">Numeric Columns</h4>
                        <div className="flex flex-wrap gap-2">
                            {numericColumns.map(c => <button type="button" key={c.id} onClick={() => handleAddToken({type: 'column', value: `{${c.id}}`, text: c.label})} className="px-2 py-1 bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] text-[var(--text-on-accent)] rounded-md text-sm truncate">{c.label}</button>)}
                        </div>
                    </div>
                    <div className="p-3 bg-black/10 rounded-lg flex-grow">
                        <h4 className="font-semibold mb-2">Live Preview</h4>
                        <div className="text-sm space-y-2">
                            {livePreview.error ? (
                                <p className="text-[var(--text-tertiary)]">{livePreview.error}</p>
                            ) : (
                                <div>
                                    <p className="font-semibold text-[var(--text-secondary)]">Final Value:</p>
                                    <p className="text-3xl font-bold text-green-400">{typeof livePreview.result === 'number' ? livePreview.result.toLocaleString(undefined, { maximumFractionDigits: 4 }) : 'N/A'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div>
            <label htmlFor="kpi-computation" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Final Aggregation
            </label>
            <select
                id="kpi-computation"
                value={selectedComputation}
                onChange={e => setSelectedComputation(e.target.value as Computation)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none"
            >
                {computations.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">This computation is applied to the results of your formula from every row.</p>
        </div>

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        
        <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-[var(--border-color)]">
          <button type="button" onClick={onClose} className="py-2 px-4 bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className="flex items-center gap-2 py-2 px-4 bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] text-[var(--text-on-accent)] rounded-lg transition-colors font-semibold">
            <KpiIcon /> Add KPI Card
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default KpiModal;