
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { TextWidgetConfig } from '../types';
import { CheckIcon } from './Icons';
import MarkdownRenderer from './MarkdownRenderer';

interface TextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: TextWidgetConfig) => void;
  initialConfig?: TextWidgetConfig;
}

const TextModal: React.FC<TextModalProps> = ({ isOpen, onClose, onSave, initialConfig }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const isEditing = !!initialConfig;

  useEffect(() => {
    if (isOpen) {
      if (initialConfig) {
        setTitle(initialConfig.title);
        setContent(initialConfig.content);
      } else {
        setTitle('New Text Block');
        setContent('Write your **Markdown** content here.\n\n- Use asterisks for *italics* or **bold**.\n- Use backticks for `inline code`.\n- Start lines with a hyphen for lists.');
      }
    }
  }, [isOpen, initialConfig]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title, content });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Text Block' : 'Add Text Block'} maxWidth="max-w-4xl">
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="text-title" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Title</label>
          <input
            id="text-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[40vh]">
          <div className="flex flex-col">
            <label htmlFor="text-content" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Content (Markdown)</label>
            <textarea
              id="text-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full flex-grow bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md p-3 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none font-mono text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Live Preview</label>
            <div className="w-full h-full flex-grow bg-black/10 rounded-md p-3 overflow-y-auto">
              <MarkdownRenderer content={content} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-[var(--border-color)]">
        <button type="button" onClick={onClose} className="py-2 px-4 bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg transition-colors">Cancel</button>
        <button type="button" onClick={handleSave} disabled={!title.trim()} className="flex items-center gap-2 py-2 px-4 bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] text-[var(--text-on-accent)] rounded-lg transition-colors font-semibold disabled:opacity-50">
          <CheckIcon /> {isEditing ? 'Save Changes' : 'Add Text Block'}
        </button>
      </div>
    </Modal>
  );
};

export default TextModal;
