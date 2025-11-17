import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { ColumnConfig, AIServiceConfig, AIServiceProvider } from '../types';
import { SparklesIcon } from './Icons';

interface AIInsightModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnConfig: ColumnConfig[];
  aiSettings: AIServiceConfig[];
  onGenerate: (config: { title: string; selectedColumns: string[]; aiServiceId: string }) => void;
}

const providerNames: Record<AIServiceProvider, string> = {
  gemini: 'Google Gemini',
  openai: 'OpenAI',
  groq: 'Groq',
  custom: 'Custom',
};

const AIInsightModal: React.FC<AIInsightModalProps> = ({ isOpen, onClose, columnConfig, aiSettings, onGenerate }) => {
  const [title, setTitle] = useState('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [aiServiceId, setAiServiceId] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle('AI Data Insight');
      setSelectedColumns([]);
      setAiServiceId(aiSettings.length > 0 ? aiSettings[0].id : '');
      setError('');
    }
  }, [isOpen, aiSettings]);

  const handleColumnToggle = (label: string) => {
    setSelectedColumns(prev =>
      prev.includes(label) ? prev.filter(c => c !== label) : [...prev, label]
    );
  };

  const handleSubmit = () => {
    setError('');
    if (!title.trim()) {
      setError('A title for the widget is required.');
      return;
    }
    if (selectedColumns.length === 0) {
      setError('Please select at least one column for analysis.');
      return;
    }
    if (!aiServiceId) {
      setError('Please select an AI service. You can configure one in AI Settings.');
      return;
    }

    onGenerate({ title: title.trim(), selectedColumns, aiServiceId });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate AI Insight">
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="ai-title" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Widget Title</label>
          <input
            id="ai-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none"
          />
        </div>

        <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Columns to Analyze (Required)</label>
            <div className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md p-2 space-y-2 max-h-40 overflow-y-auto">
                {columnConfig.map(c => (
                  <label key={c.id} className="flex items-center gap-2 p-1.5 hover:bg-[var(--bg-contrast-hover)] rounded-md cursor-pointer">
                    <input type="checkbox" checked={selectedColumns.includes(c.label)} onChange={() => handleColumnToggle(c.label)} className="form-checkbox h-4 w-4 rounded bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--bg-accent)] focus:ring-[var(--ring-color)]" />
                    <span>{c.label}</span>
                  </label>
                ))}
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-2">
                Note: A statistical summary of the selected columns (including counts, sums, averages, etc.) will be sent to the AI, not the raw row-level data. This ensures privacy and accommodates large datasets.
            </p>
        </div>

        <div>
            <label htmlFor="ai-service" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">AI Service</label>
            {aiSettings.length > 0 ? (
                <select
                    id="ai-service"
                    value={aiServiceId}
                    onChange={(e) => setAiServiceId(e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none"
                >
                    {aiSettings.map(s => (
                        <option key={s.id} value={s.id}>{providerNames[s.provider]} - {s.model}</option>
                    ))}
                </select>
            ) : (
                <div className="text-center p-4 bg-black/10 rounded-md text-[var(--text-tertiary)]">
                    <p>No AI services configured.</p>
                    <p className="text-sm">Please add a provider in the "AI Settings" menu.</p>
                </div>
            )}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-[var(--border-color)]">
          <button type="button" onClick={onClose} className="py-2 px-4 bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg transition-colors">Cancel</button>
          <button type="button" onClick={handleSubmit} disabled={aiSettings.length === 0} className="flex items-center gap-2 py-2 px-4 bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] text-[var(--text-on-accent)] rounded-lg transition-colors font-semibold disabled:opacity-50">
            <SparklesIcon /> Generate Insight
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AIInsightModal;