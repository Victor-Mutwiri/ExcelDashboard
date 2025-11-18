
import React, { useState } from 'react';
import { AnyWidget, WidgetSize, RowData, ColumnConfig } from '../types';
import { themes, ThemeName } from '../themes';
import DashboardCanvas from '../components/DashboardCanvas';
import { ChartIcon, PlusIcon, ResetIcon, SaveIcon, FolderOpenIcon, KpiIcon, TableIcon, ExportIcon, EyeIcon, CloseIcon, TitleIcon, BackIcon, CalculatorIcon, TextIcon, SparklesIcon, SettingsIcon } from '../components/Icons';
import type { Session } from '@supabase/supabase-js';
import Logo from '../components/Logo';

interface DashboardPageProps {
    fileName: string;
    widgets: AnyWidget[];
    setWidgets: React.Dispatch<React.SetStateAction<AnyWidget[]>>;
    data: RowData[];
    columnConfig: ColumnConfig[];
    theme: ThemeName;
    isPreviewMode: boolean;
    setIsPreviewMode: (isPreview: boolean) => void;
    session: Session | null;
    onSignOut: () => void;
    
    // Handlers
    onDeleteWidget: (id: string) => void;
    onUpdateWidgetSize: (id: string, size: WidgetSize) => void;
    onToggleWidgetVisibility: (id: string) => void;
    onEditWidget: (id: string) => void;
    onAddWidget: (type: 'chart' | 'kpi' | 'datatable' | 'title' | 'calc' | 'text' | 'ai') => void;
    onReset: () => void;
    onLoad: () => void;
    onSave: () => void;
    onBackToConfig: () => void;
    onShowLandingPage: () => void;
    onManageHidden: () => void;
    onSettings: () => void;
    onExportPDF: () => void;

    // Derived State
    hiddenWidgetsCount: number;
    canGoBackToConfig: boolean;
}

const UserMenu: React.FC<{ session: Session; onSettings: () => void; onSignOut: () => void; }> = ({ session, onSettings, onSignOut }) => {
    const [isOpen, setIsOpen] = useState(false);
    const userInitial = session.user?.email?.[0].toUpperCase() || '?';

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(prev => !prev)}
                className="w-10 h-10 bg-[var(--bg-accent)] text-[var(--text-on-accent)] rounded-full flex items-center justify-center font-bold text-lg"
                data-tooltip={`Logged in as ${session.user.email}`}
                data-tooltip-pos="bottom"
            >
                {userInitial}
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-xl z-20 p-2">
                    <div className="px-3 py-2 border-b border-[var(--border-color)]">
                        <p className="text-sm text-[var(--text-secondary)]">Signed in as</p>
                        <p className="font-semibold truncate">{session.user.email}</p>
                    </div>
                    <div className="pt-2">
                        <button onClick={onSettings} className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-[var(--bg-contrast-hover)] rounded-md">
                            <SettingsIcon /> Settings
                        </button>
                        <button onClick={onSignOut} className="w-full text-left flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-md">
                           <CloseIcon /> Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const DashboardPage: React.FC<DashboardPageProps> = ({
    fileName,
    widgets,
    setWidgets,
    data,
    columnConfig,
    theme,
    isPreviewMode,
    setIsPreviewMode,
    session,
    onSignOut,
    onDeleteWidget,
    onUpdateWidgetSize,
    onToggleWidgetVisibility,
    onEditWidget,
    onAddWidget,
    onReset,
    onLoad,
    onSave,
    onBackToConfig,
    onShowLandingPage,
    onManageHidden,
    onSettings,
    onExportPDF,
    hiddenWidgetsCount,
    canGoBackToConfig
}) => {
    const [isAddWidgetMenuOpen, setAddWidgetMenuOpen] = useState(false);
    const [isExportMenuOpen, setExportMenuOpen] = useState(false);

    return (
        <div className="w-full min-h-screen flex flex-col overflow-x-hidden">
            {isPreviewMode && (
                <div className="fixed top-0 left-0 right-0 bg-gray-800 text-white p-3 flex justify-center items-center gap-4 z-50">
                    <p className="font-semibold">Print Preview Mode</p>
                    <button onClick={() => setIsPreviewMode(false)} className="px-4 py-1 text-sm font-semibold bg-gray-600 hover:bg-gray-500 rounded-lg flex items-center gap-2">
                        <CloseIcon className="w-4 h-4" /> Exit Preview
                    </button>
                </div>
            )}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 noprint bg-[var(--bg-header)] theme-corporate:text-white px-4 sm:px-6 lg:px-8 py-4 border-b border-[var(--border-color)] shadow-sm">
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                <div className="flex items-center gap-4">
                    <button onClick={onShowLandingPage} className="flex items-center gap-2 group" data-tooltip="Back to Home Page" data-tooltip-pos="bottom">
                    <Logo className="w-8 h-8 text-[var(--color-accent)] transition-transform group-hover:scale-110" />
                    <span className="text-lg font-bold">
                        <span style={{ color: 'var(--logo-color-sheet)' }}>Sheet</span>
                        <span style={{ color: 'var(--logo-color-sight)' }}>Sight</span>
                    </span>
                    </button>
                    <div className="border-l border-[var(--border-color-heavy)] pl-4 hidden sm:block">
                    <h1 className="text-xl font-bold leading-tight max-w-[200px] truncate">{fileName}</h1>
                    <p className="text-sm text-[var(--text-secondary)]">Interactive Dashboard</p>
                    </div>
                </div>
                <div className="sm:hidden">
                     {session ? (
                        <UserMenu session={session} onSettings={onSettings} onSignOut={onSignOut} />
                    ) : (
                        <button onClick={onSettings} className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-contrast)] rounded-full">
                            <SettingsIcon />
                        </button>
                    )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                {hiddenWidgetsCount > 0 && (
                  <button data-tooltip="View and restore widgets you've hidden from the dashboard." data-tooltip-pos="bottom" onClick={onManageHidden} className="px-4 py-2 text-sm font-semibold bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg flex items-center gap-2">
                    <EyeIcon /> <span className="hidden sm:inline">Hidden</span> <span className="bg-[var(--bg-accent)] text-[var(--text-on-accent)] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{hiddenWidgetsCount}</span>
                  </button>
                )}
                 <button data-tooltip="Return to the data configuration screen to rename, reorder, or remove columns." data-tooltip-pos="bottom" onClick={onBackToConfig} disabled={!canGoBackToConfig} className="px-4 py-2 text-sm font-semibold bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <BackIcon /> <span className="hidden sm:inline">Back to Config</span>
                </button>
                <button data-tooltip="Clear the current dashboard and start over with a new file or pasted data." data-tooltip-pos="bottom" onClick={onReset} className="px-4 py-2 text-sm font-semibold bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg flex items-center gap-2">
                  <ResetIcon /> <span className="hidden sm:inline">Start Over</span>
                </button>
                 <button data-tooltip="Load a previously saved dashboard session." data-tooltip-pos="bottom" onClick={onLoad} className="px-4 py-2 text-sm font-semibold bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg flex items-center gap-2">
                  <FolderOpenIcon /> <span className="hidden sm:inline">Load</span>
                </button>
                <button data-tooltip="Save your current dashboard layout, widgets, and data." data-tooltip-pos="bottom" onClick={onSave} className="px-4 py-2 text-sm font-semibold text-[var(--text-on-accent)] bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] rounded-lg flex items-center gap-2">
                  <SaveIcon /> <span className="hidden sm:inline">Save</span>
                </button>
                <div className="relative">
                    <button data-tooltip="Add a new widget to your dashboard." data-tooltip-pos="bottom" onClick={() => setAddWidgetMenuOpen(prev => !prev)} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-500 rounded-lg flex items-center gap-2">
                        <PlusIcon /> <span className="hidden sm:inline">Add</span>
                    </button>
                    {isAddWidgetMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-xl z-20">
                            <button data-tooltip="Add a customizable main title for your report." onClick={() => { onAddWidget('title'); setAddWidgetMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-contrast-hover)]"><TitleIcon /> Report Title</button>
                            <button data-tooltip="Display a key performance indicator with a single, prominent value." onClick={() => { onAddWidget('kpi'); setAddWidgetMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-contrast-hover)]"><KpiIcon /> KPI Card</button>
                            <button data-tooltip="Visualize your data with bar, line, area, or pie charts." onClick={() => { onAddWidget('chart'); setAddWidgetMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-contrast-hover)]"><ChartIcon /> Chart</button>
                            <button data-tooltip="Add a rich text block for comments, analysis, or notes." onClick={() => { onAddWidget('text'); setAddWidgetMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-contrast-hover)]"><TextIcon /> Text Block</button>
                            <button data-tooltip="Add a searchable, sortable table of your raw data." onClick={() => { onAddWidget('datatable'); setAddWidgetMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-contrast-hover)]"><TableIcon /> Data Table</button>
                            <div className="border-t border-[var(--border-color)] my-1"></div>
                            <button data-tooltip="Generate an insight from your data using AI." onClick={() => { onAddWidget('ai'); setAddWidgetMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-contrast-hover)]"><SparklesIcon /> AI Insight</button>
                            <button data-tooltip="Create a new column by performing calculations on existing numeric columns." onClick={() => { onAddWidget('calc'); setAddWidgetMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-contrast-hover)]"><CalculatorIcon /> Calculated Column</button>
                        </div>
                    )}
                </div>
                 <div className="relative">
                    <button data-tooltip="Export your dashboard." data-tooltip-pos="bottom" onClick={() => setExportMenuOpen(prev => !prev)} className="px-4 py-2 text-sm font-semibold bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg flex items-center gap-2">
                        <ExportIcon /> <span className="hidden sm:inline">Export</span>
                    </button>
                    {isExportMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-xl z-20">
                            <button data-tooltip="See how your dashboard will look when printed." onClick={() => { setIsPreviewMode(true); setExportMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-contrast-hover)]">Print Preview</button>
                            <button data-tooltip="Use your browser's print dialog to save the dashboard as a PDF file." onClick={() => { onExportPDF(); setExportMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-contrast-hover)]">Save as PDF</button>
                        </div>
                    )}
                </div>
                <div className="hidden sm:block">
                    {session ? (
                        <UserMenu session={session} onSettings={onSettings} onSignOut={onSignOut} />
                    ) : (
                        <button data-tooltip="Configure dashboard settings, including AI providers and theme." data-tooltip-pos="bottom" onClick={onSettings} className="px-4 py-2 text-sm font-semibold bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg flex items-center gap-2">
                            <SettingsIcon /> <span className="hidden sm:inline">Settings</span>
                        </button>
                    )}
                </div>
              </div>
            </header>
            <main className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8 printable-area">
              <DashboardCanvas 
                widgets={widgets}
                setWidgets={setWidgets}
                data={data} 
                columnConfig={columnConfig}
                onDeleteWidget={onDeleteWidget}
                onUpdateWidgetSize={onUpdateWidgetSize}
                onToggleWidgetVisibility={onToggleWidgetVisibility}
                onEditWidget={onEditWidget}
                chartColors={themes[theme].chartColors}
              />
            </main>
        </div>
    );
};

export default DashboardPage;
