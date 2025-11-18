
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { SaveIcon } from './Icons';

interface SaveDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  existingNames: string[];
}

const SaveDashboardModal: React.FC<SaveDashboardModalProps> = ({ isOpen, onClose, onSave, existingNames }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Reset state when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setName('');
      setError('');
    }
  }, [isOpen]);

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Dashboard name cannot be empty.');
      return;
    }
    if (existingNames.includes(trimmedName)) {
      setError('A dashboard with this name already exists.');
      return;
    }
    onSave(trimmedName);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save Dashboard" maxWidth="max-w-md">
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="dashboard-name" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Dashboard Name
          </label>
          <input
            id="dashboard-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none"
            placeholder="e.g., Q3 Sales Report"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
        <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-[var(--border-color)]">
          <button type="button" onClick={onClose} className="py-2 px-4 bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="flex items-center gap-2 py-2 px-4 bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] text-[var(--text-on-accent)] rounded-lg transition-colors font-semibold">
            <SaveIcon /> Save
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SaveDashboardModal;
