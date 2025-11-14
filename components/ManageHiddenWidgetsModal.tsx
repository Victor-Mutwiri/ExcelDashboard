import React from 'react';
import { Modal } from './Modal';
import { AnyWidget } from '../types';
import { EyeIcon } from './Icons';

interface ManageHiddenWidgetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hiddenWidgets: AnyWidget[];
  onToggleVisibility: (id: string) => void;
}

const getWidgetTitle = (widget: AnyWidget) => {
    if (widget.type === 'datatable') return widget.title;
    // FIX: TitleWidget uses `config.text` for its content, not `config.title`.
    if (widget.type === 'title') return widget.config.text;
    return widget.config.title;
}

const ManageHiddenWidgetsModal: React.FC<ManageHiddenWidgetsModalProps> = ({ isOpen, onClose, hiddenWidgets, onToggleVisibility }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Hidden Widgets">
      <div className="flex flex-col gap-4">
        {hiddenWidgets.length === 0 ? (
          <div className="text-center text-[var(--text-tertiary)] py-12">
            <p className="text-lg">No widgets are currently hidden.</p>
            <p>You can hide a widget using the menu on the widget card.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {hiddenWidgets.map((widget) => (
              <div key={widget.id} className="bg-[var(--bg-contrast)] rounded-lg p-3 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{getWidgetTitle(widget)}</h3>
                  <p className="text-sm text-[var(--text-tertiary)] capitalize">{widget.type} Widget</p>
                </div>
                <button
                  onClick={() => onToggleVisibility(widget.id)}
                  className="flex items-center gap-2 bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] text-[var(--text-on-accent)] font-semibold py-2 px-4 rounded-lg transition-all text-sm"
                >
                  <EyeIcon /> Show
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
       <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-[var(--border-color)]">
          <button type="button" onClick={onClose} className="py-2 px-4 bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg transition-colors">
            Close
          </button>
        </div>
    </Modal>
  );
};

export default ManageHiddenWidgetsModal;