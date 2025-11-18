
import React, { useState, useMemo } from 'react';
import { Modal } from './Modal';
import { ColumnConfig } from '../types';
import { CalculatorIcon } from './Icons';
import { evaluateFormula, validateFormula } from '../utils/formulaEvaluator';

interface CalculatedColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  numericColumns: ColumnConfig[];
  existingLabels: string[];
  onSubmit: (name: string, formula: string) => void;
}

type FormulaToken = {
  type: 'column' | 'operator' | 'number' | 'paren';
  value: string;
  text: string;
};

const operators = ['+', '-', '*', '/'];
const numbers = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.'];

const CalculatedColumnModal: React.FC<CalculatedColumnModalProps> = ({
  isOpen,
  onClose,
  numericColumns,
  existingLabels,
  onSubmit
}) => {
  const [name, setName] = useState('');
  const [formula, setFormula] = useState<FormulaToken[]>([]);
  const [error, setError] = useState<string>('');

  const formulaString = useMemo(() => formula.map(t => t.value).join(' '), [formula]);
  const formulaDisplay = useMemo(() => formula.map(t => {
      if(t.type === 'column') return <span key={Math.random()} className="bg-indigo-500/50 text-indigo-200 rounded px-1.5 py-0.5">{t.text}</span>;
      if(t.type === 'operator') return <span key={Math.random()} className="text-cyan-400 mx-1">{t.text}</span>;
      if(t.type === 'number') return <span key={Math.random()} className="text-amber-400">{t.text}</span>;
      return <span key={Math.random()}>{t.text}</span>;
  }), [formula]);

  const livePreview = useMemo(() => {
    const validation = validateFormula(formulaString);
    if (!validation.isValid) {
      return { error: formulaString ? validation.error : 'Start building your formula.' };
    }

    const colDependencies = formula.filter(t => t.type === 'column');
    const uniqueColIds = [...new Set(colDependencies.map(c => c.value))];
    
    const sampleValues: Record<string, number> = {};
    const sampleDisplay: Record<string, number> = {};

    uniqueColIds.forEach(idWithBraces => {
      const id = (idWithBraces as string).slice(1, -1);
      const col = numericColumns.find(c => c.id === id);
      const randomValue = Math.round(Math.random() * 90 + 10);
      sampleValues[id] = randomValue;
      if (col) {
        sampleDisplay[col.label] = randomValue;
      }
    });
    
    const result = evaluateFormula(formulaString, sampleValues);
    return { sampleDisplay, result };

  }, [formulaString, formula, numericColumns]);

  const handleAddToken = (token: FormulaToken) => {
    setFormula(prev => {
      const lastToken = prev.length > 0 ? prev[prev.length - 1] : null;

      // If the new token is a number or a dot
      if (token.type === 'number') {
        // And the last token was also a number
        if (lastToken && lastToken.type === 'number') {
          // Prevent adding multiple dots to the same number
          if (token.value === '.' && lastToken.value.includes('.')) {
            return prev;
          }
          // Update the last token by concatenating
          const updatedLastToken = {
            ...lastToken,
            value: lastToken.value + token.value,
            text: lastToken.text + token.text,
          };
          // Replace the last token with the updated one
          return [...prev.slice(0, -1), updatedLastToken];
        }
      }
      
      // Otherwise, just add the new token
      return [...prev, token];
    });
    setError('');
  };
  const handleBackspace = () => setFormula(prev => prev.slice(0, -1));
  const handleClear = () => setFormula([]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Column name is required.');
      return;
    }
    if (existingLabels.includes(name.trim())) {
      setError('This column name already exists.');
      return;
    }
    const validation = validateFormula(formulaString);
    if (!validation.isValid) {
      setError(validation.error ?? 'Invalid formula.');
      return;
    }
    onSubmit(name.trim(), formulaString);
    setName('');
    setFormula([]);
    setError('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Calculated Column" maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="new-column-name" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            New Column Name
          </label>
          <input
            id="new-column-name"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none"
            placeholder="e.g., Percentage Profit"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left side: builder */}
            <div className="flex flex-col gap-3 p-3 bg-black/10 rounded-lg">
                <div className="h-16 p-2 bg-[var(--bg-input)] rounded-md border border-[var(--border-color)] flex items-center gap-1 flex-wrap overflow-x-auto">
                    {formula.length === 0 
                        ? <span className="text-[var(--text-tertiary)]">Click buttons below to build formula...</span>
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
                    <h4 className="font-semibold mb-2" data-tooltip="Click a column name to add it to your formula.">Numeric Columns</h4>
                    <div className="flex flex-wrap gap-2">
                        {numericColumns.map(c => <button type="button" key={c.id} onClick={() => handleAddToken({type: 'column', value: `{${c.id}}`, text: c.label})} className="px-2 py-1 bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] text-[var(--text-on-accent)] rounded-md text-sm truncate">{c.label}</button>)}
                    </div>
                </div>
                 <div className="p-3 bg-black/10 rounded-lg flex-grow">
                    <h4 className="font-semibold mb-2" data-tooltip="See a sample calculation with random values to verify your formula.">Live Preview</h4>
                    <div className="text-sm space-y-2">
                        {livePreview.error ? (
                            <p className="text-[var(--text-tertiary)]">{livePreview.error}</p>
                        ) : (
                            <>
                                <div>
                                    <p className="font-semibold text-[var(--text-secondary)]">With sample values:</p>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                        {Object.entries(livePreview.sampleDisplay ?? {}).map(([label, value]) => (
                                            <p key={label}><span className="text-[var(--color-accent-secondary)]">{label}</span> = <span className="text-amber-300">{value}</span></p>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="font-semibold text-[var(--text-secondary)]">Result:</p>
                                    <p className="text-2xl font-bold text-green-400">{typeof livePreview.result === 'number' ? livePreview.result.toLocaleString(undefined, { maximumFractionDigits: 3 }) : 'Error'}</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        
        <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-[var(--border-color)]">
          <button type="button" onClick={onClose} className="py-2 px-4 bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg transition-colors">
            Cancel
          </button>
          <button type="submit" className="flex items-center gap-2 py-2 px-4 bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] text-[var(--text-on-accent)] rounded-lg transition-colors font-semibold">
            <CalculatorIcon className="w-5 h-5" /> Create Column
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CalculatedColumnModal;
