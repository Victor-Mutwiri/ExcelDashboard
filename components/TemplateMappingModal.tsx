
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { DashboardTemplate, ColumnConfig } from '../types';
import { CheckIcon, ChevronRightIcon, LayoutIcon } from './Icons';

interface TemplateMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: DashboardTemplate | null;
  columnConfig: ColumnConfig[];
  onConfirm: (mapping: Record<string, string>) => void;
}

const TemplateMappingModal: React.FC<TemplateMappingModalProps> = ({ isOpen, onClose, template, columnConfig, onConfirm }) => {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && template) {
      // Auto-match based on fuzzy name matching
      const initialMapping: Record<string, string> = {};
      
      template.requiredFields.forEach(field => {
        // Simple heuristic: look for containment (case-insensitive)
        const match = columnConfig.find(c => {
           const cName = c.label.toLowerCase();
           const fKey = field.key.toLowerCase();
           const fLabel = field.label.toLowerCase();
           
           // Type check
           const isTypeMatch = field.dataType === 'number' ? c.isNumeric : true; // String/Date flexible
           if (!isTypeMatch) return false;

           return cName.includes(fKey) || cName.includes(fLabel) || (fKey.includes('date') && cName.includes('date')) || (fKey.includes('revenue') && (cName.includes('amount') || cName.includes('total')));
        });
        
        if (match) {
            initialMapping[field.key] = match.label;
        } else {
            initialMapping[field.key] = '';
        }
      });
      setMapping(initialMapping);
      setErrors([]);
    }
  }, [isOpen, template, columnConfig]);

  const handleMappingChange = (key: string, value: string) => {
    setMapping(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!template) return;
    
    const newErrors: string[] = [];
    template.requiredFields.forEach(field => {
        if (!field.optional && !mapping[field.key]) {
            newErrors.push(`Please select a column for "${field.label}"`);
        }
    });

    if (newErrors.length > 0) {
        setErrors(newErrors);
        return;
    }

    onConfirm(mapping);
  };

  if (!template) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Configure ${template.name}`} maxWidth="max-w-3xl">
      <div className="flex flex-col gap-6">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800 flex items-start gap-4">
            <div className="p-2 bg-white dark:bg-indigo-800 rounded-full shadow-sm hidden sm:block">
                <LayoutIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
            </div>
            <div>
                <h3 className="font-bold text-indigo-900 dark:text-indigo-200 mb-1">Map Your Data</h3>
                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                    To build this dashboard, we need to know which columns in your file match the template's requirements.
                </p>
            </div>
        </div>

        <div className="space-y-4">
            {template.requiredFields.map((field) => {
                const isMapped = !!mapping[field.key];
                const columnsForType = columnConfig.filter(c => field.dataType === 'number' ? c.isNumeric : true);

                return (
                    <div key={field.key} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center p-3 border border-[var(--border-color)] rounded-lg bg-[var(--bg-input)]">
                        <div className="md:col-span-5">
                            <label className="font-semibold text-sm block">{field.label}</label>
                            <span className="text-xs text-[var(--text-tertiary)] capitalize">{field.dataType} column required {field.optional && '(Optional)'}</span>
                        </div>
                        <div className="md:col-span-1 flex justify-center text-[var(--text-tertiary)]">
                            <ChevronRightIcon className="w-5 h-5 rotate-90 md:rotate-0" />
                        </div>
                        <div className="md:col-span-6">
                            <select
                                value={mapping[field.key] || ''}
                                onChange={(e) => handleMappingChange(field.key, e.target.value)}
                                className={`w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none transition-colors ${
                                    !isMapped && !field.optional ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10' : 'border-[var(--border-color)] bg-[var(--bg-contrast)]'
                                }`}
                            >
                                <option value="">-- Select Your Column --</option>
                                {columnsForType.map(c => (
                                    <option key={c.id} value={c.label}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                );
            })}
        </div>

        {errors.length > 0 && (
            <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm">
                <ul className="list-disc pl-5">
                    {errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
            </div>
        )}

        <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-[var(--border-color)]">
          <button type="button" onClick={onClose} className="py-2 px-4 bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg transition-colors">
            Back to Selection
          </button>
          <button type="button" onClick={handleSubmit} className="flex items-center gap-2 py-2 px-6 bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] text-[var(--text-on-accent)] rounded-lg transition-colors font-bold shadow-md">
            <CheckIcon /> Generate Dashboard
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TemplateMappingModal;
