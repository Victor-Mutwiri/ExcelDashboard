import React, { useState, useCallback } from 'react';
import { UploadIcon, FolderOpenIcon, ClipboardIcon } from './Icons';
import PasteData from './PasteData';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  onDataPaste: (data: string) => void;
  onOpenLoadModal: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, onDataPaste, onOpenLoadModal }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  }, [onFileUpload]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const renderContent = () => {
    if (activeTab === 'upload') {
      return (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          className={`relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg transition-colors duration-300 ${isDragging ? 'border-[var(--color-accent)] bg-[var(--bg-contrast)]' : 'border-[var(--border-color-heavy)] hover:border-[var(--color-accent)]'}`}
        >
          <input
            type="file"
            id="file-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
          />
          <div className="text-[var(--text-secondary)]">
            <UploadIcon className="mx-auto mb-4 h-12 w-12" />
            <p className="font-semibold text-[var(--text-primary)]">
              <span className="text-[var(--color-accent)]">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm mt-1">XLSX, XLS, or CSV files</p>
          </div>
        </div>
      );
    }
    return <PasteData onDataPaste={onDataPaste} />;
  };

  return (
    <div className="w-full max-w-2xl text-center bg-[var(--bg-card)] rounded-2xl shadow-lg transition-all">
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-2">DataDash</h1>
        <p className="text-lg text-[var(--text-secondary)] mb-8">Instantly turn your spreadsheets into interactive dashboards.</p>
        
        <div className="flex justify-center border-b border-[var(--border-color)] mb-6">
            <button 
                onClick={() => setActiveTab('upload')} 
                className={`flex items-center gap-2 px-4 py-2 font-semibold transition-colors ${activeTab === 'upload' ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
                <UploadIcon /> Upload File
            </button>
            <button 
                onClick={() => setActiveTab('paste')} 
                className={`flex items-center gap-2 px-4 py-2 font-semibold transition-colors ${activeTab === 'paste' ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
                <ClipboardIcon /> Paste Data
            </button>
        </div>
        
        {renderContent()}

      </div>
      <div className="bg-black/10 p-4 rounded-b-2xl">
        <button 
            onClick={onOpenLoadModal}
            className="flex items-center justify-center gap-2 mx-auto text-[var(--color-accent)] font-semibold hover:text-[var(--color-accent-secondary)] transition-colors"
        >
            <FolderOpenIcon /> Or load a saved dashboard
        </button>
      </div>
    </div>
  );
};

export default FileUpload;