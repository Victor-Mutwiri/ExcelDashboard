import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { AIServiceConfig, AIServiceProvider } from '../types';
import { SaveIcon, PlusIcon, TrashIcon, EyeIcon, EyeOffIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: AIServiceConfig[]) => void;
  initialConfigs: AIServiceConfig[];
}

const providerNames: Record<AIServiceProvider, string> = {
  gemini: 'Google Gemini',
  openai: 'OpenAI',
  groq: 'Groq',
  custom: 'Custom',
};

const getModelPlaceholder = (provider: AIServiceProvider) => {
    switch (provider) {
        case 'gemini': return 'gemini-2.5-flash';
        case 'groq': return 'llama3-70b-8192';
        case 'openai': return 'gpt-4o';
        case 'custom': return 'model-name';
        default: return 'e.g., model-name';
    }
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, initialConfigs }) => {
  const [configs, setConfigs] = useState<AIServiceConfig[]>([]);
  const [apiKeysVisible, setApiKeysVisible] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // When the modal opens, copy the initial configs to local state and clear errors
    if (isOpen) {
      setConfigs(JSON.parse(JSON.stringify(initialConfigs))); // Deep copy
      setErrors({});
    }
  }, [isOpen, initialConfigs]);

  const handleConfigChange = (id: string, field: keyof Omit<AIServiceConfig, 'id'>, value: string) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    // Clear error for this config when user types
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleAddConfig = () => {
    const newConfig: AIServiceConfig = {
      id: `ai-config-${Date.now()}`,
      provider: 'gemini',
      apiKey: '',
      model: '',
    };
    setConfigs(prev => [...prev, newConfig]);
  };

  const handleDeleteConfig = (id: string) => {
    setConfigs(prev => prev.filter(c => c.id !== id));
  };
  
  const toggleApiKeyVisibility = (id: string) => {
    setApiKeysVisible(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    let hasError = false;

    for (const config of configs) {
      const missingFields = [];
      if (!config.model.trim()) missingFields.push('Model name');
      if (!config.apiKey.trim()) missingFields.push('API key');

      if (missingFields.length > 0) {
        newErrors[config.id] = `${missingFields.join(' and ')} required.`;
        hasError = true;
      }
    }

    setErrors(newErrors);

    if (!hasError) {
      onSave(configs);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Service Settings">
      <div className="flex flex-col gap-6">
        <p className="text-[var(--text-secondary)]">
          Configure your AI provider credentials here. These will be used for upcoming features like automated chart generation and data analysis. Your keys are saved securely in your browser's local storage.
        </p>

        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
          {configs.map(config => (
            <div key={config.id} className="bg-black/10 p-4 rounded-lg border border-[var(--border-color)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Provider</label>
                  <select
                    value={config.provider}
                    onChange={(e) => handleConfigChange(config.id, 'provider', e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none"
                  >
                    {Object.entries(providerNames).map(([key, name]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Model Name</label>
                  <input
                    type="text"
                    value={config.model}
                    onChange={(e) => handleConfigChange(config.id, 'model', e.target.value)}
                    placeholder={getModelPlaceholder(config.provider)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">API Key</label>
                  <div className="relative">
                    <input
                      type={apiKeysVisible[config.id] ? 'text' : 'password'}
                      value={config.apiKey}
                      onChange={(e) => handleConfigChange(config.id, 'apiKey', e.target.value)}
                      placeholder="Enter your API key"
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 pr-10 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none"
                    />
                    <button type="button" onClick={() => toggleApiKeyVisibility(config.id)} className="absolute inset-y-0 right-0 flex items-center px-3 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                        {apiKeysVisible[config.id] ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
                {config.provider === 'custom' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Base URL (optional)</label>
                    <input
                      type="text"
                      value={config.baseURL || ''}
                      onChange={(e) => handleConfigChange(config.id, 'baseURL', e.target.value)}
                      placeholder="e.g., https://api.example.com/v1"
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none"
                    />
                  </div>
                )}
              </div>
              {errors[config.id] && (
                <div className="mt-3 text-sm text-red-500 bg-red-500/10 p-2 rounded-md border border-red-500/30">
                  {errors[config.id]}
                </div>
              )}
              <div className="flex justify-end mt-2">
                  <button onClick={() => handleDeleteConfig(config.id)} className="flex items-center gap-2 text-sm text-red-500 hover:bg-red-500/20 rounded-md px-3 py-1.5">
                      <TrashIcon /> Delete
                  </button>
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleAddConfig} className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg transition-colors font-semibold">
          <PlusIcon /> Add New Service
        </button>

        <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-[var(--border-color)]">
          <button type="button" onClick={onClose} className="py-2 px-4 bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="flex items-center gap-2 py-2 px-4 bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] text-[var(--text-on-accent)] rounded-lg transition-colors font-semibold">
            <SaveIcon /> Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;