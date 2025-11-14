import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { SaveIcon } from './Icons';

interface TitleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  initialTitle: string;
}

const TitleEditModal: React.FC<TitleEditModalProps> = ({ isOpen, onClose, onSave, initialTitle }) => {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle || '');
      setError('');
    }
  }, [isOpen, initialTitle]);

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Title cannot be empty.');
      return;
    }
    onSave(trimmedTitle);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Widget Title">
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="widget-title-input" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Widget Title
          </label>
          <input
            id="widget-title-input"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none"
            placeholder="Enter new title"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
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

export default TitleEditModal;
