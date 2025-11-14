
import React from 'react';
import { CloseIcon } from './Icons';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-[var(--bg-card)] rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b border-[var(--border-color)]">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                        <CloseIcon />
                    </button>
                </header>
                <main className="p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};