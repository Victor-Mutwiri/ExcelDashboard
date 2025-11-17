

import React, { useState, useCallback, useEffect, useMemo } from 'react';
// FIX: Imported 'StructuredInsight' to resolve a 'Cannot find name' error when parsing AI responses.
import { AppState, ColumnConfig, RowData, ParsedFile, SavedDashboard, AnyWidget, ChartWidgetConfig, KpiWidgetConfig, WidgetSize, TextWidgetConfig, TitleWidgetConfig, AIServiceConfig, AIInsightWidget, DataTableWidget, StructuredInsight } from './types';
import FileUpload from './components/FileUpload';
import DataConfiguration from './components/DataConfiguration';
import DashboardCanvas from './components/DashboardCanvas';
import ChartModal from './components/ChartModal';
import CalculatedColumnModal from './components/CalculatedColumnModal';
import LoadDashboardModal from './components/LoadDashboardModal';
import SaveDashboardModal from './components/SaveDashboardModal';
import KpiModal from './components/KpiModal';
import TitleModal from './components/TitleModal';
import TextModal from './components/TextModal';
import SettingsModal from './components/SettingsModal';
import AIInsightModal from './components/AIInsightModal';
import Toast from './components/Toast';
import LandingPage from './components/LandingPage';
import ManageHiddenWidgetsModal from './components/ManageHiddenWidgetsModal';
import TitleEditModal from './components/TitleEditModal';
import { parseFile, processData } from './utils/fileParser';
import { generateInsight } from './utils/ai';
import { ChartIcon, PlusIcon, ResetIcon, SaveIcon, FolderOpenIcon, KpiIcon, TableIcon, ExportIcon, EyeIcon, CloseIcon, TitleIcon, BackIcon, CalculatorIcon, TextIcon, SparklesIcon, SettingsIcon } from './components/Icons';
import { themes, ThemeName } from './themes';
import { isPotentiallyNumeric } from './utils/dataCleaner';


export default function App() {
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [appState, setAppState] = useState<AppState>('UPLOAD');
  const [fileName, setFileName] = useState<string>('');
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  
  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>([]);
  const [data, setData] = useState<RowData[]>([]);
  const [widgets, setWidgets] = useState<AnyWidget[]>([]);

  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isManageHiddenOpen, setIsManageHiddenOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isTitleEditModalOpen, setIsTitleEditModalOpen] = useState(false);
  const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null);

  const [isAddWidgetMenuOpen, setAddWidgetMenuOpen] = useState(false);
  const [isExportMenuOpen, setExportMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);


  const [savedDashboards, setSavedDashboards] = useState<SavedDashboard[]>([]);
  const [aiSettings, setAiSettings] = useState<AIServiceConfig[]>([]);
  const [theme, setTheme] = useState<ThemeName>(() => {
    return (localStorage.getItem('dashboard-theme') as ThemeName) || 'light';
  });

  useEffect(() => {
    document.body.classList.toggle('print-preview-mode', isPreviewMode);
  }, [isPreviewMode]);

  useEffect(() => {
    const root = document.documentElement;
    Object.values(themes).forEach(t => root.classList.remove(`theme-${t.name.toLowerCase()}`));
    root.classList.add(`theme-${theme}`);
    localStorage.setItem('dashboard-theme', theme);
  }, [theme]);

  useEffect(() => {
    try {
      const storedDashboards = localStorage.getItem('dashboards');
      if (storedDashboards) {
        setSavedDashboards(JSON.parse(storedDashboards));
      }
      const storedAiSettings = localStorage.getItem('ai_settings');
      if (storedAiSettings) {
        setAiSettings(JSON.parse(storedAiSettings));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      setSavedDashboards([]);
      setAiSettings([]);
    }
  }, []);
  
  const handleFileUploaded = useCallback(async (file: File) => {
    try {
      setFileName(file.name);
      const parsed = await parseFile(file);
      setParsedFile(parsed);

      if (!parsed.isExcel || Object.keys(parsed.sheets).length === 1) {
        const sheetName = Object.keys(parsed.sheets)[0];
        setSelectedSheet(sheetName);
        const sheetData = parsed.sheets[sheetName];
        const headers = sheetData[0] || [];
        const initialConfig: ColumnConfig[] = headers.map((h, i) => ({
          id: `col_${i}`,
          label: String(h || `Column ${i + 1}`),
          isNumeric: sheetData.slice(1).every(row => row[i] === null || row[i] === '' || isPotentiallyNumeric(row[i])),
        }));
        setColumnConfig(initialConfig);
      }
      setAppState('CONFIGURE');
    } catch (error) {
      console.error("Error processing file:", error);
      handleReset();
    }
  }, []);

  const handleDataPasted = useCallback((pastedData: string) => {
    try {
      setFileName('Pasted Data');
      
      const rows = pastedData.trim().split('\n').map(row => row.split('\t'));
      
      const parsed: ParsedFile = {
        sheets: { 'Sheet1': rows },
        isExcel: false,
      };
      setParsedFile(parsed);
      setSelectedSheet('Sheet1');

      const headers = rows[0] || [];
      const initialConfig: ColumnConfig[] = headers.map((h, i) => ({
        id: `col_${i}`,
        label: String(h || `Column ${i + 1}`),
        // Check if all subsequent rows in this column are numeric after sanitizing
        isNumeric: rows.slice(1).every(row => row[i] === null || row[i] === '' || isPotentiallyNumeric(row[i])),
      }));
      setColumnConfig(initialConfig);
      setAppState('CONFIGURE');

    } catch (error) {
      console.error("Error processing pasted data:", error);
      handleReset();
    }
  }, []);

  const handleConfigConfirmed = useCallback((finalConfig: ColumnConfig[]) => {
    if (!parsedFile || !selectedSheet) return;
    setColumnConfig(finalConfig);
    const processedData = processData(parsedFile.sheets[selectedSheet], finalConfig);
    setData(processedData);
    if(appState !== 'DASHBOARD') {
        setWidgets([
            { id: `datatable-${Date.now()}`, type: 'datatable', size: 'full', title: fileName }
        ]);
    }
    setAppState('DASHBOARD');
  }, [parsedFile, selectedSheet, fileName, appState]);
  
  const handleSheetSelected = useCallback((sheetName: string) => {
    if (!parsedFile) return;
    setSelectedSheet(sheetName);
    const sheetData = parsedFile.sheets[sheetName];
    const headers = sheetData[0] || [];
    const initialConfig: ColumnConfig[] = headers.map((h, i) => ({
      id: `col_${i}`,
      label: String(h || `Column ${i + 1}`),
      isNumeric: sheetData.slice(1).every(row => row[i] === null || row[i] === '' || isPotentiallyNumeric(row[i])),
    }));
    setColumnConfig(initialConfig);
  }, [parsedFile]);

  const handleAddCalculatedColumn = useCallback((name: string, formula: string) => {
    const newId = `calc_${Date.now()}`;
    const newColumn: ColumnConfig = {
      id: newId,
      label: name,
      isNumeric: true, // Calculated columns are always numeric for now
      formula: formula,
    };
    const newConfig = [...columnConfig, newColumn];
    setColumnConfig(newConfig);

    // Re-process data if we are already in the dashboard view
    if (appState === 'DASHBOARD' && parsedFile && selectedSheet) {
      const processedData = processData(parsedFile.sheets[selectedSheet], newConfig);
      setData(processedData);
    }
    
    setIsCalcModalOpen(false);
  }, [columnConfig, appState, parsedFile, selectedSheet]);

  const handleReset = () => {
    setAppState('UPLOAD');
    setFileName('');
    setParsedFile(null);
    setSelectedSheet('');
    setColumnConfig([]);
    setData([]);
    setWidgets([]);
    setIsPreviewMode(false);
    // When starting over from dashboard, go back to upload, not landing
    setShowLandingPage(false); 
  };

  const handleSaveDashboard = (name: string) => {
    const newDashboard: SavedDashboard = {
      name,
      createdAt: new Date().toISOString(),
      data,
      columnConfig,
      fileName,
      widgets,
    };
    const updatedDashboards = [...savedDashboards, newDashboard];
    setSavedDashboards(updatedDashboards);
    localStorage.setItem('dashboards', JSON.stringify(updatedDashboards));
    setIsSaveModalOpen(false);
    setToast({ message: 'Dashboard saved successfully!', type: 'success' });
  };
  
  const handleLoadDashboard = (dashboard: SavedDashboard) => {
    setFileName(dashboard.fileName);
    setColumnConfig(dashboard.columnConfig);
    setData(dashboard.data);
    setWidgets(dashboard.widgets);
    // Note: We don't have the original parsedFile, so re-configuration is not possible from a loaded state.
    // This is a design decision for simplicity.
    setParsedFile({ sheets: { 'Loaded Sheet': [] }, isExcel: false });
    setSelectedSheet('Loaded Sheet');
    setAppState('DASHBOARD');
    setIsLoadModalOpen(false);
  };

  const handleDeleteDashboard = (name: string) => {
    const updatedDashboards = savedDashboards.filter(d => d.name !== name);
    setSavedDashboards(updatedDashboards);
    localStorage.setItem('dashboards', JSON.stringify(updatedDashboards));
  };
  
  const handleSaveAiSettings = (settings: AIServiceConfig[]) => {
    setAiSettings(settings);
    localStorage.setItem('ai_settings', JSON.stringify(settings));
    setIsSettingsModalOpen(false);
    setToast({ message: 'AI settings saved!', type: 'success' });
  };

  const handleSaveChart = (config: ChartWidgetConfig) => {
    if (editingWidgetId) {
      setWidgets(prev => prev.map(w => (w.id === editingWidgetId && w.type === 'chart' ? { ...w, config } : w)));
    } else {
      const newChartWidget: AnyWidget = {
        id: `chart-${Date.now()}`,
        type: 'chart',
        size: '1/2',
        config
      };
      setWidgets(prev => [...prev, newChartWidget]);
    }
    setIsChartModalOpen(false);
    setEditingWidgetId(null);
  };

  const handleSaveTitle = (config: TitleWidgetConfig) => {
    const existingTitle = widgets.find(w => w.type === 'title');
    
    if (existingTitle) {
      setWidgets(prev => prev.map(w => (w.id === existingTitle.id && w.type === 'title' ? { ...w, config } : w)));
    } else {
      const newTitleWidget: AnyWidget = {
          id: `title-${Date.now()}`,
          type: 'title',
          size: 'full', // Always full width
          config,
      };
      setWidgets(prev => [newTitleWidget, ...prev.filter(w => w.type !== 'title')]);
    }
    setIsTitleModalOpen(false);
    setEditingWidgetId(null);
  };
  
  const handleSaveText = (config: TextWidgetConfig) => {
    if (editingWidgetId) {
      setWidgets(prev => prev.map(w => (w.id === editingWidgetId && w.type === 'text' ? { ...w, config } : w)));
    } else {
      const newTextWidget: AnyWidget = {
        id: `text-${Date.now()}`,
        type: 'text',
        size: '1/2',
        config
      };
      setWidgets(prev => [...prev, newTextWidget]);
    }
    setIsTextModalOpen(false);
    setEditingWidgetId(null);
  };

  const handleAddKpi = (config: KpiWidgetConfig) => {
    const newKpiWidget: AnyWidget = {
        id: `kpi-${Date.now()}`,
        type: 'kpi',
        size: '1/4',
        config,
    };
    setWidgets(prev => [...prev, newKpiWidget]);
    setIsKpiModalOpen(false);
  };

  const handleGenerateAIInsight = async (config: { title: string; selectedColumns: string[]; aiServiceId: string }) => {
    const newWidgetId = `ai-${Date.now()}`;
    const newAiWidget: AIInsightWidget = {
        id: newWidgetId,
        type: 'ai',
        size: '1/2',
        config: {
            ...config,
            insight: [],
            status: 'loading',
        }
    };
    setWidgets(prev => [...prev, newAiWidget]);

    try {
        const aiService = aiSettings.find(s => s.id === config.aiServiceId);
        if (!aiService) {
            throw new Error("Selected AI service configuration not found.");
        }
        
        const insightJsonString = await generateInsight(data, config, aiService, columnConfig);

        let parsedResponse: { insights: StructuredInsight[] };
        try {
            // The AI might return markdown with a JSON block. Need to extract it.
            const jsonMatch = insightJsonString.match(/```json\n([\s\S]*?)\n```/);
            const jsonToParse = jsonMatch ? jsonMatch[1] : insightJsonString;
            parsedResponse = JSON.parse(jsonToParse);
        } catch (e) {
            console.error("Failed to parse AI response as JSON:", insightJsonString);
            throw new Error("The AI returned an invalid response format. Please try again.");
        }
        
        if (!parsedResponse.insights || !Array.isArray(parsedResponse.insights)) {
             throw new Error("The AI response is missing the 'insights' array.");
        }

        setWidgets(prev => prev.map(w => {
            if (w.id === newWidgetId && w.type === 'ai') {
                return { ...w, config: { ...w.config, insight: parsedResponse.insights, status: 'success' } };
            }
            return w;
        }));

    } catch (error: any) {
        console.error("Error generating AI insight:", error);
        setWidgets(prev => prev.map(w => {
            if (w.id === newWidgetId && w.type === 'ai') {
                return { ...w, config: { ...w.config, status: 'error', errorMessage: error.message || 'Failed to generate insight.' } };
            }
            return w;
        }));
    }
};
  
  const handleDeleteWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  const handleEditWidget = (id: string) => {
    const widget = widgets.find(w => w.id === id);
    if (!widget) return;

    setEditingWidgetId(id);
    switch (widget.type) {
        case 'chart':
            setIsChartModalOpen(true);
            break;
        case 'title':
            setIsTitleModalOpen(true);
            break;
        case 'text':
            setIsTextModalOpen(true);
            break;
        case 'datatable':
        case 'ai':
            setIsTitleEditModalOpen(true);
            break;
    }
  };

  const handleSaveWidgetTitle = (newTitle: string) => {
    if (!editingWidgetId) return;
    setWidgets(prev => prev.map(w => {
        if (w.id === editingWidgetId) {
            if (w.type === 'datatable') {
                return { ...w, title: newTitle };
            }
            if (w.type === 'ai') {
                return { ...w, config: { ...w.config, title: newTitle } };
            }
        }
        return w;
    }));
    setIsTitleEditModalOpen(false);
    setEditingWidgetId(null);
  };

  const handleToggleWidgetVisibility = (id: string) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, isHidden: !w.isHidden } : w));
  };

  const handleUpdateWidgetSize = (id: string, size: WidgetSize) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, size } : w));
  };

  const handleAddWidget = (type: 'chart' | 'kpi' | 'datatable' | 'title' | 'calc' | 'text' | 'ai') => {
    setAddWidgetMenuOpen(false);
    if (type === 'chart') setIsChartModalOpen(true);
    if (type === 'kpi') setIsKpiModalOpen(true);
    if (type === 'text') setIsTextModalOpen(true);
    if (type === 'ai') setIsAiModalOpen(true);
    if (type === 'calc') setIsCalcModalOpen(true);
    if (type === 'title') {
      const existingTitle = widgets.find(w => w.type === 'title');
      if (existingTitle) {
        setEditingWidgetId(existingTitle.id);
      }
      setIsTitleModalOpen(true);
    }
    if (type === 'datatable') {
        const newTableWidget: AnyWidget = {
            id: `datatable-${Date.now()}`,
            type: 'datatable',
            size: 'full',
            title: `Data Table (${widgets.filter(w => w.type === 'datatable').length + 1})`
        };
        setWidgets(prev => [...prev, newTableWidget]);
    }
  };
  
  const handleExportPDF = () => {
    setExportMenuOpen(false);
    setIsPreviewMode(false);
    setToast({ message: "Use your browser's print dialog to 'Save as PDF'.", type: 'success' });
    setTimeout(() => {
        window.print();
    }, 100);
  };

  const handleGetStarted = () => {
    // Reset state but keep on the upload page
    handleReset();
    setShowLandingPage(false);
  };

  const hiddenWidgets = useMemo(() => widgets.filter(w => w.isHidden), [widgets]);
  const widgetToEdit = useMemo(() =>
    editingWidgetId ? widgets.find(w => w.id === editingWidgetId) : undefined,
    [editingWidgetId, widgets]
  );
  
  const getWidgetTitleForEdit = (widget?: AnyWidget): string => {
    if (!widget) return '';
    if (widget.type === 'datatable') {
        return widget.title;
    }
    if (widget.type === 'ai') {
        return widget.config.title;
    }
    return '';
  };

  if (showLandingPage) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  const renderContent = () => {
    switch (appState) {
      case 'UPLOAD':
        return (
          <FileUpload
            onFileUpload={handleFileUploaded}
            onDataPaste={handleDataPasted}
            onOpenLoadModal={() => setIsLoadModalOpen(true)}
          />
        );
      case 'CONFIGURE':
        if (!parsedFile) return null; // Should not happen
        return (
          <DataConfiguration
            fileName={fileName}
            parsedFile={parsedFile}
            selectedSheet={selectedSheet}
            onSheetSelect={handleSheetSelected}
            initialColumnConfig={columnConfig}
            onConfirm={handleConfigConfirmed}
            onReset={handleReset}
          />
        );
      case 'DASHBOARD':
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
              <div className="flex items-center gap-4">
                <button onClick={() => setShowLandingPage(true)} className="flex items-center gap-2 group" data-tooltip="Back to Home Page">
                  <TableIcon className="w-8 h-8 text-[var(--color-accent)] transition-transform group-hover:scale-110" />
                  <span className="text-2xl font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--color-accent-secondary)]">DataDash</span>
                </button>
                <div className="border-l border-[var(--border-color-heavy)] pl-4">
                  <h1 className="text-xl font-bold leading-tight">{fileName}</h1>
                  <p className="text-sm text-[var(--text-secondary)]">Interactive Dashboard</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {hiddenWidgets.length > 0 && (
                  <button data-tooltip="View and restore widgets you've hidden from the dashboard." onClick={() => setIsManageHiddenOpen(true)} className="px-4 py-2 text-sm font-semibold bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg flex items-center gap-2">
                    <EyeIcon /> Hidden <span className="bg-[var(--bg-accent)] text-[var(--text-on-accent)] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{hiddenWidgets.length}</span>
                  </button>
                )}
                 <button data-tooltip="Return to the data configuration screen to rename, reorder, or remove columns." onClick={() => setAppState('CONFIGURE')} disabled={!parsedFile || !selectedSheet || !parsedFile.sheets[selectedSheet] || parsedFile.sheets[selectedSheet].length < 2} className="px-4 py-2 text-sm font-semibold bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <BackIcon /> Back to Config
                </button>
                <button data-tooltip="Clear the current dashboard and start over with a new file or pasted data." onClick={handleReset} className="px-4 py-2 text-sm font-semibold bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg flex items-center gap-2">
                  <ResetIcon /> Start Over
                </button>
                 <button data-tooltip="Load a previously saved dashboard session." onClick={() => setIsLoadModalOpen(true)} className="px-4 py-2 text-sm font-semibold bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg flex items-center gap-2">
                  <FolderOpenIcon /> Load
                </button>
                <button data-tooltip="Save your current dashboard layout, widgets, and data." onClick={() => setIsSaveModalOpen(true)} className="px-4 py-2 text-sm font-semibold text-[var(--text-on-accent)] bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] rounded-lg flex items-center gap-2">
                  <SaveIcon /> Save
                </button>
                <div className="relative">
                    <button data-tooltip="Add a new widget to your dashboard." onClick={() => setAddWidgetMenuOpen(prev => !prev)} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-500 rounded-lg flex items-center gap-2">
                        <PlusIcon /> Add
                    </button>
                    {isAddWidgetMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-xl z-20">
                            <button data-tooltip="Add a customizable main title for your report." onClick={() => handleAddWidget('title')} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-contrast-hover)]"><TitleIcon /> Report Title</button>
                            <button data-tooltip="Display a key performance indicator with a single, prominent value." onClick={() => handleAddWidget('kpi')} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-contrast-hover)]"><KpiIcon /> KPI Card</button>
                            <button data-tooltip="Visualize your data with bar, line, area, or pie charts." onClick={() => handleAddWidget('chart')} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-contrast-hover)]"><ChartIcon /> Chart</button>
                            <button data-tooltip="Add a rich text block for comments, analysis, or notes." onClick={() => handleAddWidget('text')} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-contrast-hover)]"><TextIcon /> Text Block</button>
                            <button data-tooltip="Add a searchable, sortable table of your raw data." onClick={() => handleAddWidget('datatable')} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-contrast-hover)]"><TableIcon /> Data Table</button>
                            <div className="border-t border-[var(--border-color)] my-1"></div>
                            <button data-tooltip="Generate an insight from your data using AI." onClick={() => handleAddWidget('ai')} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-contrast-hover)]"><SparklesIcon /> AI Insight</button>
                            <button data-tooltip="Create a new column by performing calculations on existing numeric columns." onClick={() => handleAddWidget('calc')} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-contrast-hover)]"><CalculatorIcon /> Calculated Column</button>
                        </div>
                    )}
                </div>
                 <div className="relative">
                    <button data-tooltip="Export your dashboard." onClick={() => setExportMenuOpen(prev => !prev)} className="px-4 py-2 text-sm font-semibold bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg flex items-center gap-2">
                        <ExportIcon /> Export
                    </button>
                    {isExportMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-xl z-20">
                            <button data-tooltip="See how your dashboard will look when printed." onClick={() => { setIsPreviewMode(true); setExportMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-contrast-hover)]">Print Preview</button>
                            <button data-tooltip="Use your browser's print dialog to save the dashboard as a PDF file." onClick={handleExportPDF} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-contrast-hover)]">Save as PDF</button>
                        </div>
                    )}
                </div>
                <button data-tooltip="Configure dashboard settings, including AI providers and theme." onClick={() => setIsSettingsModalOpen(true)} className="px-4 py-2 text-sm font-semibold bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg flex items-center gap-2">
                    <SettingsIcon /> Settings
                </button>
              </div>
            </header>
            <main className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8 printable-area">
              <DashboardCanvas 
                widgets={widgets}
                setWidgets={setWidgets}
                data={data} 
                columnConfig={columnConfig}
                onDeleteWidget={handleDeleteWidget}
                onUpdateWidgetSize={handleUpdateWidgetSize}
                onToggleWidgetVisibility={handleToggleWidgetVisibility}
                onEditWidget={handleEditWidget}
                chartColors={themes[theme].chartColors}
              />
            </main>
          </div>
        );
    }
  };

  const rootContainerClasses = appState === 'DASHBOARD'
    ? ""
    : "min-h-screen flex items-center justify-center p-4";

  return (
    <div className={rootContainerClasses}>
      {renderContent()}
      
      <div className="noprint">
        <ChartModal 
          isOpen={isChartModalOpen}
          onClose={() => {
            setIsChartModalOpen(false);
            setEditingWidgetId(null);
          }}
          data={data}
          columnConfig={columnConfig}
          onSave={handleSaveChart}
          chartColors={themes[theme].chartColors}
          initialConfig={widgetToEdit?.type === 'chart' ? widgetToEdit.config : undefined}
        />

        <TitleModal 
          isOpen={isTitleModalOpen}
          onClose={() => {
            setIsTitleModalOpen(false);
            setEditingWidgetId(null);
          }}
          onSave={handleSaveTitle}
          initialConfig={widgetToEdit?.type === 'title' ? widgetToEdit.config : undefined}
        />

        <TextModal
          isOpen={isTextModalOpen}
          onClose={() => {
            setIsTextModalOpen(false);
            setEditingWidgetId(null);
          }}
          onSave={handleSaveText}
          initialConfig={widgetToEdit?.type === 'text' ? widgetToEdit.config : undefined}
        />
        
        <AIInsightModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          columnConfig={columnConfig}
          aiSettings={aiSettings}
          onGenerate={handleGenerateAIInsight}
        />

        <CalculatedColumnModal 
          isOpen={isCalcModalOpen}
          onClose={() => setIsCalcModalOpen(false)}
          numericColumns={columnConfig.filter(c => c.isNumeric)}
          existingLabels={columnConfig.map(c => c.label)}
          onSubmit={handleAddCalculatedColumn}
        />
        
        <KpiModal
          isOpen={isKpiModalOpen}
          onClose={() => setIsKpiModalOpen(false)}
          data={data}
          numericColumns={columnConfig.filter(c => c.isNumeric)}
          onSubmit={handleAddKpi}
        />

        <LoadDashboardModal
          isOpen={isLoadModalOpen}
          onClose={() => setIsLoadModalOpen(false)}
          dashboards={savedDashboards}
          onLoad={handleLoadDashboard}
          onDelete={handleDeleteDashboard}
        />

        <SaveDashboardModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          onSave={handleSaveDashboard}
          existingNames={savedDashboards.map(d => d.name)}
        />
        
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          onSave={handleSaveAiSettings}
          initialConfigs={aiSettings}
          currentTheme={theme}
          onThemeChange={setTheme}
        />

        <TitleEditModal
          isOpen={isTitleEditModalOpen}
          onClose={() => {
            setIsTitleEditModalOpen(false);
            setEditingWidgetId(null);
          }}
          onSave={handleSaveWidgetTitle}
          initialTitle={getWidgetTitleForEdit(widgetToEdit)}
        />

        <ManageHiddenWidgetsModal
          isOpen={isManageHiddenOpen}
          onClose={() => setIsManageHiddenOpen(false)}
          hiddenWidgets={hiddenWidgets}
          onToggleVisibility={handleToggleWidgetVisibility}
        />

        {toast && (
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(null)}
            />
        )}
      </div>
    </div>
  );
}