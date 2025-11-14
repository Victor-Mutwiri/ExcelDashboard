import React from 'react';
import { AIInsightWidget } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { SparklesIcon } from './Icons';

interface AIInsightWidgetComponentProps {
  widget: AIInsightWidget;
}

const AIInsightWidgetComponent: React.FC<AIInsightWidgetComponentProps> = ({ widget }) => {
  const { config } = widget;

  switch (config.status) {
    case 'loading':
      return (
        <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)] animate-pulse">
          <SparklesIcon className="w-10 h-10 mb-4 animate-spin" />
          <p className="font-semibold">Generating insight with AI...</p>
        </div>
      );
    case 'success':
      return (
        <div className="overflow-y-auto h-full">
            <MarkdownRenderer content={config.insight} />
        </div>
      );
    case 'error':
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-500/80">
          <h4 className="font-bold mb-2">Error Generating Insight</h4>
          <p className="text-sm text-center">{config.errorMessage || 'An unknown error occurred.'}</p>
        </div>
      );
    default:
      return (
        <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)]">
          <p>AI Insight widget is idle.</p>
        </div>
      );
  }
};

export default AIInsightWidgetComponent;