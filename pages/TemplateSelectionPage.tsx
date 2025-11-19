
import React, { useState, useMemo } from 'react';
import { DashboardTemplate, ColumnConfig } from '../types';
import { dashboardTemplates } from '../data/templates';
import TemplateMappingModal from '../components/TemplateMappingModal';
import { ChartIcon, CalculatorIcon, UserIcon, SparklesIcon, ClipboardIcon, PlusIcon, CheckIcon, LayoutIcon, BackIcon } from '../components/Icons';
import Logo from '../components/Logo';

// Icon Mapper
const IconMap: Record<string, React.FC<any>> = {
    ChartAnalyticsIcon: ChartIcon,
    CalculatorIcon: CalculatorIcon,
    UserIcon: UserIcon,
    SparklesIcon: SparklesIcon,
    ClipboardIcon: ClipboardIcon,
    PlusIcon: PlusIcon
};

interface TemplateSelectionPageProps {
    onTemplateSelected: (template: DashboardTemplate, mapping: Record<string, string>) => void;
    onStartBlank: () => void;
    columnConfig: ColumnConfig[];
    onBack: () => void;
    onBackToLanding: () => void;
}

const TemplateSelectionPage: React.FC<TemplateSelectionPageProps> = ({ onTemplateSelected, onStartBlank, columnConfig, onBack, onBackToLanding }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedTemplate, setSelectedTemplate] = useState<DashboardTemplate | null>(null);
    const [isMappingOpen, setIsMappingOpen] = useState(false);

    const categories = useMemo(() => {
        const cats = new Set(dashboardTemplates.map(t => t.category));
        return ['All', ...Array.from(cats)];
    }, []);

    const filteredTemplates = useMemo(() => {
        if (selectedCategory === 'All') return dashboardTemplates;
        return dashboardTemplates.filter(t => t.category === selectedCategory);
    }, [selectedCategory]);

    const handleTemplateClick = (template: DashboardTemplate) => {
        setSelectedTemplate(template);
        setIsMappingOpen(true);
    };

    const handleMappingConfirm = (mapping: Record<string, string>) => {
        if (selectedTemplate) {
            onTemplateSelected(selectedTemplate, mapping);
        }
        setIsMappingOpen(false);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)] flex flex-col">
             <header className="bg-[var(--bg-header)] border-b border-[var(--border-color)] p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBackToLanding} className="flex items-center gap-2 group" title="Back to Home">
                        <Logo className="w-8 h-8 transition-transform group-hover:scale-110" />
                        <span className="text-xl font-bold">
                            <span style={{ color: 'var(--logo-color-sheet)' }}>Sheet</span>
                            <span style={{ color: 'var(--logo-color-sight)' }}>Sight</span>
                        </span>
                    </button>
                    <div className="h-6 w-px bg-[var(--border-color)] hidden sm:block"></div>
                    <h2 className="text-lg font-semibold text-[var(--text-secondary)] hidden sm:block">Choose a Template</h2>
                </div>
                <button onClick={onBack} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium flex items-center gap-2">
                    <BackIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Back to Data</span>
                </button>
            </header>

            <main className="flex-grow container mx-auto px-6 py-10">
                
                {/* Category Filters */}
                <div className="flex flex-wrap gap-2 mb-10 justify-center">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all transform ${
                                selectedCategory === cat
                                    ? 'bg-[var(--bg-accent)] text-[var(--text-on-accent)] scale-105 shadow-md'
                                    : 'bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] text-[var(--text-secondary)]'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Blank Canvas Card */}
                    <div 
                        onClick={onStartBlank}
                        className="group bg-[var(--bg-card)] border-2 border-dashed border-[var(--border-color)] hover:border-[var(--color-accent)] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:-translate-y-1"
                    >
                        <div className="w-16 h-16 bg-[var(--bg-contrast)] group-hover:bg-indigo-50 rounded-full flex items-center justify-center mb-4 transition-colors">
                            <PlusIcon className="w-8 h-8 text-[var(--text-tertiary)] group-hover:text-[var(--color-accent)]" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Start from Scratch</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Build your dashboard widget by widget on a blank canvas.</p>
                    </div>

                    {/* Template Cards */}
                    {filteredTemplates.map(template => {
                        const Icon = IconMap[template.iconName] || LayoutIcon;
                        return (
                            <div 
                                key={template.id}
                                onClick={() => handleTemplateClick(template)}
                                className="group bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--color-accent)] hover:ring-1 hover:ring-[var(--color-accent)] rounded-xl p-6 flex flex-col cursor-pointer transition-all hover:-translate-y-1 shadow-sm hover:shadow-lg"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                        <Icon className="w-6 h-6 text-[var(--color-accent)]" />
                                    </div>
                                    <span className="text-xs font-bold px-2 py-1 bg-[var(--bg-contrast)] rounded-full text-[var(--text-secondary)] uppercase tracking-wider">
                                        {template.category}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold mb-2 group-hover:text-[var(--color-accent)] transition-colors">{template.name}</h3>
                                <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4 flex-grow">{template.description}</p>
                                
                                <div className="flex flex-wrap gap-1 mt-auto">
                                    {template.requiredFields.slice(0, 3).map(f => (
                                        <span key={f.key} className="text-[10px] px-1.5 py-0.5 bg-[var(--bg-contrast)] rounded border border-[var(--border-color)] text-[var(--text-tertiary)]">
                                            {f.label}
                                        </span>
                                    ))}
                                    {template.requiredFields.length > 3 && (
                                        <span className="text-[10px] px-1.5 py-0.5 text-[var(--text-tertiary)]">+{template.requiredFields.length - 3} more</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            <TemplateMappingModal 
                isOpen={isMappingOpen}
                onClose={() => setIsMappingOpen(false)}
                template={selectedTemplate}
                columnConfig={columnConfig}
                onConfirm={handleMappingConfirm}
            />
        </div>
    );
};

export default TemplateSelectionPage;