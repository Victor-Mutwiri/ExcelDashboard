
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { TitleWidgetConfig } from '../types';
import { CheckIcon } from './Icons';

interface TitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: TitleWidgetConfig) => void;
  initialConfig?: TitleWidgetConfig;
}

export const professionalFonts = {
  'Roboto': "'Roboto', sans-serif",
  'Open Sans': "'Open Sans', sans-serif",
  'Lato': "'Lato', sans-serif",
  'Montserrat': "'Montserrat', sans-serif",
  'Oswald': "'Oswald', sans-serif",
  'Source Sans Pro': "'Source Sans Pro', sans-serif",
  'Raleway': "'Raleway', sans-serif",
  'PT Sans': "'PT Sans', sans-serif",
  'Merriweather': "'Merriweather', serif",
  'Playfair Display': "'Playfair Display', serif",
};

const TitleModal: React.FC<TitleModalProps> = ({ isOpen, onClose, onSave, initialConfig }) => {
  const [text, setText] = useState('Dashboard Title');
  const [fontFamily, setFontFamily] = useState('Roboto');
  const [fontSize, setFontSize] = useState(36);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');

  const isEditing = !!initialConfig;

  useEffect(() => {
    if (isOpen) {
      if (initialConfig) {
        setText(initialConfig.text);
        setFontFamily(initialConfig.fontFamily);
        setFontSize(initialConfig.fontSize);
        setTextAlign(initialConfig.textAlign);
      } else {
        // Reset to default for new title
        setText('Dashboard Title');
        setFontFamily('Roboto');
        setFontSize(36);
        setTextAlign('center');
      }
    }
  }, [isOpen, initialConfig]);

  const handleSave = () => {
    if (!text.trim()) return;
    onSave({ text, fontFamily, fontSize, textAlign });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Report Title" : "Add Report Title"} maxWidth="max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <div>
            <label htmlFor="title-text" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Title Text</label>
            <input
              id="title-text"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="title-font" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Font Family</label>
            <select
              id="title-font"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none"
            >
              {Object.keys(professionalFonts).map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="title-size" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Font Size (px)</label>
            <input
              id="title-size"
              type="number"
              min="12"
              max="120"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value, 10) || 12)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-md px-3 py-2 focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Text Align</label>
            <div className="flex items-center gap-2 rounded-md bg-[var(--bg-contrast)] p-1">
                {(['left', 'center', 'right'] as const).map(align => (
                    <button key={align} onClick={() => setTextAlign(align)} className={`w-full p-1.5 rounded text-sm capitalize transition-colors ${textAlign === align ? 'bg-[var(--bg-accent)] text-[var(--text-on-accent)]' : 'hover:bg-[var(--bg-contrast-hover)]'}`}>
                        {align}
                    </button>
                ))}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="md:col-span-2 bg-black/10 p-4 rounded-lg flex items-center justify-center min-h-[200px]">
          <h1
            style={{
              fontFamily: professionalFonts[fontFamily as keyof typeof professionalFonts],
              fontSize: `${fontSize}px`,
              textAlign: textAlign,
              color: 'var(--text-primary)',
              wordBreak: 'break-word',
            }}
          >
            {text || '...'}
          </h1>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-[var(--border-color)]">
        <button type="button" onClick={onClose} className="py-2 px-4 bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg transition-colors">
          Cancel
        </button>
        <button type="button" onClick={handleSave} disabled={!text.trim()} className="flex items-center gap-2 py-2 px-4 bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] text-[var(--text-on-accent)] rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
          <CheckIcon />
          {isEditing ? 'Save Changes' : 'Add Title'}
        </button>
      </div>
    </Modal>
  );
};

export default TitleModal;
