import React, { useState } from 'react';
import { ClipboardIcon, CheckIcon } from './Icons';

interface PasteDataProps {
  onDataPaste: (data: string) => void;
}

const PasteData: React.FC<PasteDataProps> = ({ onDataPaste }) => {
  const [pastedText, setPastedText] = useState('');

  const handleProcess = () => {
    if (pastedText.trim()) {
      onDataPaste(pastedText);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full text-[var(--text-secondary)] text-center mb-4">
        <ClipboardIcon className="mx-auto mb-2 h-8 w-8 text-[var(--color-accent)]" />
        <p className="font-semibold text-[var(--text-primary)]">
          Paste your data from a spreadsheet
        </p>
        <p className="text-sm mt-1">(e.g., from Excel or Google Sheets)</p>
      </div>
      <textarea
        value={pastedText}
        onChange={(e) => setPastedText(e.target.value)}
        className="w-full h-40 p-3 bg-[var(--bg-input)] border-2 border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[var(--ring-color)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
        placeholder="Copy cells from your spreadsheet and paste them here..."
      />
      <button
        onClick={handleProcess}
        disabled={!pastedText.trim()}
        className="mt-4 flex items-center justify-center gap-2 w-full max-w-xs bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] text-[var(--text-on-accent)] font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CheckIcon /> Process Pasted Data
      </button>
    </div>
  );
};

export default PasteData;