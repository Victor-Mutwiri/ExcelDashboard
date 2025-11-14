import React, { useState } from 'react';
import { AIInsightWidget, StructuredInsight } from '../types';
import { SparklesIcon, ChevronDownIcon } from './Icons';

interface AIInsightWidgetComponentProps {
  widget: AIInsightWidget;
}

const InsightItem: React.FC<{ insight: StructuredInsight, defaultOpen: boolean }> = ({ insight, defaultOpen }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    
    const confidenceColors: Record<string, string> = {
        High: 'bg-green-500',
        Medium: 'bg-yellow-500',
        Low: 'bg-red-500',
    };

    return (
        <div className="border-b border-[var(--border-color)] last:border-b-0">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left p-3 hover:bg-[var(--bg-contrast-hover)] transition-colors"
            >
                <h4 className="font-semibold text-md flex-grow pr-4">{insight.insight_title}</h4>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-0.5 text-xs font-bold text-white rounded-full ${confidenceColors[insight.confidence_level] || 'bg-gray-500'}`}>{insight.confidence_level}</span>
                    <ChevronDownIcon className={`w-5 h-5 transition-transform text-[var(--text-secondary)] ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            {isOpen && (
                <div className="p-3 bg-black/10">
                    <div className="space-y-4 text-sm">
                        <div>
                            <p className="font-semibold text-[var(--text-secondary)] mb-1">Summary</p>
                            <p>{insight.insight_summary}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-[var(--text-secondary)] mb-1">Analysis</p>
                            <p>{insight.analysis_details}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-[var(--text-secondary)] mb-1">Recommendation</p>
                            <p className="text-[var(--color-accent)] font-medium">{insight.actionable_recommendation}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


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
      if (!config.insight || config.insight.length === 0) {
          return (
              <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)] text-center">
                  <p>The AI did not find any specific insights in the data sample.</p>
              </div>
          );
      }
      return (
        <div className="overflow-y-auto h-full -m-4">
            <div className="flex flex-col">
              {config.insight.map((item, index) => (
                  <InsightItem key={index} insight={item} defaultOpen={index === 0} />
              ))}
            </div>
        </div>
      );
    case 'error':
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-500/80 text-center">
          <h4 className="font-bold mb-2">Error Generating Insight</h4>
          <p className="text-sm">{config.errorMessage || 'An unknown error occurred.'}</p>
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