import React, { useState, useCallback } from 'react';
import { UploadIcon, FolderOpenIcon } from './Icons';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  onOpenLoadModal: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, onOpenLoadModal }) => {
  const [isDragging, setIsDragging] = useState(false);

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

  return (
    <div className="w-full max-w-2xl p-8 text-center bg-gray-800 border-2 border-dashed border-gray-600 rounded-2xl shadow-lg transition-all">
      <h1 className="text-4xl font-bold text-white mb-2">DataDash</h1>
      <p className="text-lg text-gray-400 mb-8">Instantly turn your spreadsheets into interactive dashboards.</p>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg transition-colors duration-300 ${isDragging ? 'border-indigo-500 bg-gray-700/50' : 'border-gray-500 hover:border-indigo-500'}`}
      >
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
        />
        <div className="text-gray-400">
          <UploadIcon className="mx-auto mb-4 h-12 w-12" />
          <p className="font-semibold text-gray-300">
            <span className="text-indigo-400">Click to upload</span> or drag and drop
          </p>
          <p className="text-sm mt-1">XLSX, XLS, or CSV files</p>
        </div>
      </div>
      <div className="mt-6">
        <button 
            onClick={onOpenLoadModal}
            className="flex items-center justify-center gap-2 mx-auto text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
        >
            <FolderOpenIcon /> Or load a saved dashboard
        </button>
      </div>
    </div>
  );
};

export default FileUpload;