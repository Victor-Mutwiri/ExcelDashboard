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
      <div className="w-full text-gray-400 text-center mb-4">
        <ClipboardIcon className="mx-auto mb-2 h-8 w-8 text-indigo-400" />
        <p className="font-semibold text-gray-300">
          Paste your data from a spreadsheet
        </p>
        <p className="text-sm mt-1">(e.g., from Excel or Google Sheets)</p>
      </div>
      <textarea
        value={pastedText}
        onChange={(e) => setPastedText(e.target.value)}
        className="w-full h-40 p-3 bg-gray-700/50 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 transition-colors"
        placeholder="Copy cells from your spreadsheet and paste them here..."
      />
      <button
        onClick={handleProcess}
        disabled={!pastedText.trim()}
        className="mt-4 flex items-center justify-center gap-2 w-full max-w-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CheckIcon /> Process Pasted Data
      </button>
    </div>
  );
};

export default PasteData;
