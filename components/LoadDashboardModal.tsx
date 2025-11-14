import React from 'react';
import { Modal } from './Modal';
import { SavedDashboard } from '../types';
import { FolderOpenIcon, CloseIcon } from './Icons';

interface LoadDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboards: SavedDashboard[];
  onLoad: (dashboard: SavedDashboard) => void;
  onDelete: (name: string) => void;
}

const LoadDashboardModal: React.FC<LoadDashboardModalProps> = ({ isOpen, onClose, dashboards, onLoad, onDelete }) => {
    
    const timeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Load Dashboard">
      <div className="flex flex-col gap-4">
        {dashboards.length === 0 ? (
          <div className="text-center text-[var(--text-tertiary)] py-12">
            <p className="text-lg">You have no saved dashboards yet.</p>
            <p>Create a dashboard and click "Save" to see it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((dash) => (
              <div key={dash.name} className="bg-[var(--bg-contrast)] rounded-lg p-4 flex flex-col justify-between group">
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg mb-1">{dash.name}</h3>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(dash.name); }} 
                            className="text-[var(--text-tertiary)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Delete ${dash.name}`}
                        >
                            <CloseIcon className="w-5 h-5" />
                        </button>
                    </div>
                  <p className="text-sm text-[var(--text-secondary)] truncate" title={dash.fileName}>{dash.fileName}</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">Saved {timeAgo(dash.createdAt)}</p>
                </div>
                <button
                  onClick={() => onLoad(dash)}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] text-[var(--text-on-accent)] font-semibold py-2 px-4 rounded-lg transition-all"
                >
                  <FolderOpenIcon /> Load
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default LoadDashboardModal;