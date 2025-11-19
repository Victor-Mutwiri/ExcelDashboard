
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { AIServiceConfig, AIServiceProvider } from '../types';
import { SaveIcon, PlusIcon, TrashIcon, EyeIcon, EyeOffIcon, SparklesIcon, PaintBrushIcon, UserIcon } from './Icons';
import { themes, ThemeName } from '../themes';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: AIServiceConfig[]) => void;
  initialConfigs: AIServiceConfig[];
  currentTheme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
  onDeleteAccount: () => void;
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

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, initialConfigs, currentTheme, onThemeChange, onDeleteAccount }) => {
  const [configs, setConfigs] = useState<AIServiceConfig[]>([]);
  const [apiKeysVisible, setApiKeysVisible] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('ai');
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfigs(JSON.parse(JSON.stringify(initialConfigs)));
      setErrors({});
      setActiveTab('ai');
      setDeleteConfirmation(false);
    }
  }, [isOpen, initialConfigs]);

  const handleConfigChange = (id: string, field: keyof Omit<AIServiceConfig, 'id'>, value: string) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
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
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" maxWidth="max-w-4xl">
      <div className="flex flex-col">
        <div className="flex flex-col md:flex-row gap-x-8 gap-y-4 min-h-[50vh]">
          {/* Left Nav */}
          <aside className="w-full md:w-1/3 lg:w-1/4 border-b md:border-b-0 md:border-r border-[var(--border-color)] pb-4 md:pb-0 md:pr-6">
            <nav className="flex flex-row md:flex-col gap-1">
              <button
                onClick={() => setActiveTab('ai')}
                className={`flex items-center gap-3 w-full text-left p-2 rounded-md transition-colors ${
                  activeTab === 'ai'
                    ? 'bg-[var(--bg-accent)] text-[var(--text-on-accent)] font-semibold'
                    : 'hover:bg-[var(--bg-contrast)]'
                }`}
              >
                <SparklesIcon className="w-5 h-5" />
                AI Services
              </button>
              <button
                onClick={() => setActiveTab('appearance')}
                className={`flex items-center gap-3 w-full text-left p-2 rounded-md transition-colors ${
                  activeTab === 'appearance'
                    ? 'bg-[var(--bg-accent)] text-[var(--text-on-accent)] font-semibold'
                    : 'hover:bg-[var(--bg-contrast)]'
                }`}
              >
                <PaintBrushIcon className="w-5 h-5" />
                Appearance
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`flex items-center gap-3 w-full text-left p-2 rounded-md transition-colors ${
                  activeTab === 'account'
                    ? 'bg-[var(--bg-accent)] text-[var(--text-on-accent)] font-semibold'
                    : 'hover:bg-[var(--bg-contrast)]'
                }`}
              >
                <UserIcon className="w-5 h-5" />
                Account
              </button>
            </nav>
          </aside>

          {/* Right Content */}
          <main className="w-full md:w-2/3 lg:w-3/4 flex-grow">
            {activeTab === 'ai' && (
              <div className="flex flex-col gap-4 h-full">
                <div>
                  <h3 className="text-xl font-bold mb-1">AI Service Configuration</h3>
                  <p className="text-[var(--text-secondary)] text-sm">
                    Configure AI provider credentials. Keys are saved securely in your browser's local storage.
                  </p>
                </div>

                <div className="space-y-4 flex-grow overflow-y-auto pr-2 -mr-2 max-h-[45vh]">
                  {configs.length === 0 ? (
                    <div className="text-center text-[var(--text-tertiary)] pt-10">No AI services added yet.</div>
                  ) : (
                    configs.map(config => (
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
                    ))
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  <button onClick={handleAddConfig} className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg transition-colors font-semibold">
                    <PlusIcon /> Add New Service
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'appearance' && (
              <div className="flex flex-col gap-4 h-full">
                <div>
                  <h3 className="text-xl font-bold mb-1">Appearance Settings</h3>
                  <p className="text-[var(--text-secondary)] text-sm">
                    Change the look and feel of your dashboard. Changes are applied instantly.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="font-semibold">Theme</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(themes).map(([key, value]) => (
                      <button 
                        key={key} 
                        onClick={() => onThemeChange(key as ThemeName)} 
                        className={`p-3 rounded-lg border-2 transition-colors ${currentTheme === key ? 'border-[var(--color-accent)] bg-[var(--bg-accent)]/10' : 'border-transparent bg-[var(--bg-contrast)] hover:border-[var(--color-accent-secondary)]'}`}
                      >
                        <span className="font-semibold">{value.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'account' && (
                <div className="flex flex-col gap-4 h-full">
                    <div>
                        <h3 className="text-xl font-bold mb-1">Account Management</h3>
                        <p className="text-[var(--text-secondary)] text-sm">
                            Manage your account and data preferences.
                        </p>
                    </div>
                    
                    <div className="mt-8 border border-red-500/30 bg-red-500/5 rounded-lg p-6">
                        <h4 className="text-red-600 font-bold text-lg mb-2 flex items-center gap-2">
                             Danger Zone
                        </h4>
                        <p className="text-sm text-[var(--text-secondary)] mb-6">
                            Deleting your account is irreversible. All your saved dashboards, settings, and data will be permanently removed from this device and you will be signed out.
                        </p>
                        
                        {!deleteConfirmation ? (
                             <button 
                                onClick={() => setDeleteConfirmation(true)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-md"
                            >
                                Delete Account
                            </button>
                        ) : (
                            <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-red-500/20 shadow-lg animate-in fade-in zoom-in duration-200">
                                <p className="font-bold text-[var(--text-primary)] mb-2">Are you absolutely sure?</p>
                                <p className="text-sm text-[var(--text-secondary)] mb-4">
                                    This action cannot be undone. Your data will be lost.
                                </p>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={onDeleteAccount}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                                    >
                                        Yes, Delete My Account
                                    </button>
                                    <button 
                                        onClick={() => setDeleteConfirmation(false)}
                                        className="px-4 py-2 bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] text-[var(--text-primary)] font-semibold rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
          </main>
        </div>

        <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-[var(--border-color)]">
          <button type="button" onClick={onClose} className="py-2 px-4 bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg transition-colors">
            Close
          </button>
          {activeTab === 'ai' && (
            <button type="button" onClick={handleSave} className="flex items-center gap-2 py-2 px-4 bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] text-[var(--text-on-accent)] rounded-lg transition-colors font-semibold">
              <SaveIcon /> Save AI Settings
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
