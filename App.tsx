
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { AppState, ColumnConfig, RowData, ParsedFile, SavedDashboard, AnyWidget, ChartWidgetConfig, KpiWidgetConfig, WidgetSize, TextWidgetConfig, TitleWidgetConfig, AIServiceConfig, AIInsightWidget, StructuredInsight, PivotWidgetConfig } from './types';
import { Analytics } from "@vercel/analytics/react";

// Page Components
import UploadPage from './pages/UploadPage';
import ConfigurePage from './pages/ConfigurePage';
import DashboardPage from './pages/DashboardPage';
import LandingPage from './pages/LandingPage';

// Modal Components
import ChartModal from './components/ChartModal';
import CalculatedColumnModal from './components/CalculatedColumnModal';
import LoadDashboardModal from './components/LoadDashboardModal';
import SaveDashboardModal from './components/SaveDashboardModal';
import KpiModal from './components/KpiModal';
import TitleModal from './components/TitleModal';
import TextModal from './components/TextModal';
import SettingsModal from './components/SettingsModal';
import AIInsightModal from './components/AIInsightModal';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import ManageHiddenWidgetsModal from './components/ManageHiddenWidgetsModal';
import TitleEditModal from './components/TitleEditModal';
import PivotModal from './components/PivotModal';

// Utils and Data
import { parseFile, processData } from './utils/fileParser';
import { generateInsight } from './utils/ai';
import { themes, ThemeName } from './themes';
import { isPotentiallyNumeric } from './utils/dataCleaner';
import { useAuth } from './contexts/AuthContext';

const SESSION_STORAGE_KEY = 'sheetsight_active_session';

export default function App() {
  const { session, signOut } = useAuth();

  // Load saved session once on mount (lazy initialization)
  const [initialSession] = useState(() => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.error('Failed to load session from local storage:', err);
      return null;
    }
  });

  // Initialize states with saved values or defaults
  const [showLandingPage, setShowLandingPage] = useState<boolean>(initialSession?.showLandingPage ?? true);
  const [appState, setAppState] = useState<AppState>(initialSession?.appState ?? 'UPLOAD');
  const [fileName, setFileName] = useState<string>(initialSession?.fileName ?? '');
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(initialSession?.parsedFile ?? null);
  const [selectedSheet, setSelectedSheet] = useState<string>(initialSession?.selectedSheet ?? '');
  
  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>(initialSession?.columnConfig ?? []);
  const [data, setData] = useState<RowData[]>(initialSession?.data ?? []);
  const [widgets, setWidgets] = useState<AnyWidget[]>(initialSession?.widgets ?? []);

  // Modal States
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isPivotModalOpen, setIsPivotModalOpen] = useState(false);
  const [isManageHiddenOpen, setIsManageHiddenOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isTitleEditModalOpen, setIsTitleEditModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null);

  // UI States
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [authActionCallback, setAuthActionCallback] = useState<(() => void) | null>(null);

  // Persisted States
  const [savedDashboards, setSavedDashboards] = useState<SavedDashboard[]>([]);
  const [aiSettings, setAiSettings] = useState<AIServiceConfig[]>([]);
  const [theme, setTheme] = useState<ThemeName>(() => {
    return (localStorage.getItem('dashboard-theme') as ThemeName) || 'light';
  });

  // Effect for Session Persistence
  useEffect(() => {
    const sessionData = {
      showLandingPage,
      appState,
      fileName,
      parsedFile,
      selectedSheet,
      columnConfig,
      data,
      widgets
    };

    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    } catch (e) {
      console.warn('Failed to save session to local storage (possibly quota exceeded):', e);
    }
  }, [showLandingPage, appState, fileName, parsedFile, selectedSheet, columnConfig, data, widgets]);

  // Effect for Print Preview
  useEffect(() => {
    document.body.classList.toggle('print-preview-mode', isPreviewMode);
  }, [isPreviewMode]);

  // Effect for Theme
  useEffect(() => {
    const root = document.documentElement;
    Object.values(themes).forEach(t => root.classList.remove(`theme-${t.name.toLowerCase()}`));
    root.classList.add(`theme-${theme}`);
    localStorage.setItem('dashboard-theme', theme);
  }, [theme]);

  // Effect to load data from localStorage on initial mount
  useEffect(() => {
    try {
      const storedDashboards = localStorage.getItem('dashboards');
      if (storedDashboards) setSavedDashboards(JSON.parse(storedDashboards));
      
      const storedAiSettings = localStorage.getItem('ai_settings');
      if (storedAiSettings) setAiSettings(JSON.parse(storedAiSettings));
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);
  
  // --- AUTHENTICATION & GATING ---
  const withAuth = (action: () => void) => {
    if (session) {
      action();
    } else {
      setAuthActionCallback(() => action);
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = useCallback(() => {
    setIsAuthModalOpen(false);
    if (authActionCallback) {
      authActionCallback();
      setAuthActionCallback(null);
    }
  }, [authActionCallback]);

  const handleReset = useCallback(() => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setAppState('UPLOAD');
    setFileName('');
    setParsedFile(null);
    setSelectedSheet('');
    setColumnConfig([]);
    setData([]);
    setWidgets([]);
    setIsPreviewMode(false);
    setShowLandingPage(false); 
  }, []);
  
  const handleSheetSelected = useCallback((sheetName: string, file: ParsedFile | null = parsedFile) => {
    if (!file) return;
    setSelectedSheet(sheetName);
    const sheetData = file.sheets[sheetName];
    const headers = sheetData[0] || [];
    const initialConfig: ColumnConfig[] = headers.map((h, i) => ({
      id: `col_${i}`,
      label: String(h || `Column ${i + 1}`),
      isNumeric: sheetData.slice(1).every(row => row[i] === null || row[i] === '' || isPotentiallyNumeric(row[i])),
    }));
    setColumnConfig(initialConfig);
  }, [parsedFile]);

  // --- DATA HANDLING & STATE TRANSITIONS ---
  const handleFileUploaded = useCallback(async (file: File) => {
    try {
      setFileName(file.name);
      const parsed = await parseFile(file);
      setParsedFile(parsed);

      if (!parsed.isExcel || Object.keys(parsed.sheets).length === 1) {
        const sheetName = Object.keys(parsed.sheets)[0];
        handleSheetSelected(sheetName, parsed);
      }
      setAppState('CONFIGURE');
    } catch (error) {
      console.error("Error processing file:", error);
      handleReset();
    }
  }, [handleSheetSelected, handleReset]);

  const handleDataPasted = useCallback((pastedData: string) => {
    try {
      setFileName('Pasted Data');
      const rows = pastedData.trim().split('\n').map(row => row.split('\t'));
      const parsed: ParsedFile = { sheets: { 'Sheet1': rows }, isExcel: false };
      setParsedFile(parsed);
      handleSheetSelected('Sheet1', parsed);
      setAppState('CONFIGURE');
    } catch (error) {
      console.error("Error processing pasted data:", error);
      handleReset();
    }
  }, [handleSheetSelected, handleReset]);

  const handleConfigConfirmed = useCallback((finalConfig: ColumnConfig[]) => {
    if (!parsedFile || !selectedSheet) return;
    setColumnConfig(finalConfig);
    const processedData = processData(parsedFile.sheets[selectedSheet], finalConfig);
    setData(processedData);
    if(appState !== 'DASHBOARD') {
        setWidgets([{ id: `datatable-${Date.now()}`, type: 'datatable', size: 'full', title: fileName }]);
    }
    setAppState('DASHBOARD');
  }, [parsedFile, selectedSheet, fileName, appState]);

  const handleGetStarted = () => {
    handleReset();
    setShowLandingPage(false);
  };

  // --- WIDGET & DASHBOARD MANAGEMENT ---
  const handleAddCalculatedColumn = useCallback((name: string, formula: string) => {
    const newId = `calc_${Date.now()}`;
    const newColumn: ColumnConfig = { id: newId, label: name, isNumeric: true, formula };
    const newConfig = [...columnConfig, newColumn];
    setColumnConfig(newConfig);

    if (appState === 'DASHBOARD' && parsedFile && selectedSheet) {
      setData(processData(parsedFile.sheets[selectedSheet], newConfig));
    }
    
    setIsCalcModalOpen(false);
  }, [columnConfig, appState, parsedFile, selectedSheet]);

  const handleSaveDashboard = (name: string) => {
    const newDashboard: SavedDashboard = { name, createdAt: new Date().toISOString(), data, columnConfig, fileName, widgets };
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
    setParsedFile({ sheets: { 'Loaded Sheet': [] }, isExcel: false }); // Mock parsedFile to disable re-config
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
      setWidgets(prev => [...prev, { id: `chart-${Date.now()}`, type: 'chart', size: '1/2', config }]);
    }
    setIsChartModalOpen(false);
    setEditingWidgetId(null);
  };

  const handleSavePivot = (config: PivotWidgetConfig) => {
    if (editingWidgetId) {
        setWidgets(prev => prev.map(w => (w.id === editingWidgetId && w.type === 'pivot' ? { ...w, config } : w)));
    } else {
        setWidgets(prev => [...prev, { id: `pivot-${Date.now()}`, type: 'pivot', size: 'full', config }]);
    }
    setIsPivotModalOpen(false);
    setEditingWidgetId(null);
  };

  const handleSaveTitle = (config: TitleWidgetConfig) => {
    const existingTitle = widgets.find(w => w.type === 'title');
    if (existingTitle) {
      setWidgets(prev => prev.map(w => (w.id === existingTitle.id && w.type === 'title' ? { ...w, config } : w)));
    } else {
      setWidgets(prev => [{ id: `title-${Date.now()}`, type: 'title', size: 'full', config }, ...prev]);
    }
    setIsTitleModalOpen(false);
    setEditingWidgetId(null);
  };
  
  const handleSaveText = (config: TextWidgetConfig) => {
    if (editingWidgetId) {
      setWidgets(prev => prev.map(w => (w.id === editingWidgetId && w.type === 'text' ? { ...w, config } : w)));
    } else {
      setWidgets(prev => [...prev, { id: `text-${Date.now()}`, type: 'text', size: '1/2', config }]);
    }
    setIsTextModalOpen(false);
    setEditingWidgetId(null);
  };

  const handleAddKpi = (config: KpiWidgetConfig) => {
    setWidgets(prev => [...prev, { id: `kpi-${Date.now()}`, type: 'kpi', size: '1/4', config }]);
    setIsKpiModalOpen(false);
  };

  const handleGenerateAIInsight = async (config: { title: string; selectedColumns: string[]; aiServiceId: string }) => {
    const newWidgetId = `ai-${Date.now()}`;
    const newAiWidget: AIInsightWidget = { id: newWidgetId, type: 'ai', size: '1/2', config: { ...config, insight: [], status: 'loading' } };
    setWidgets(prev => [...prev, newAiWidget]);

    try {
        const aiService = aiSettings.find(s => s.id === config.aiServiceId);
        if (!aiService) throw new Error("Selected AI service configuration not found.");
        
        const insightJsonString = await generateInsight(data, config, aiService, columnConfig);

        let parsedResponse: { insights: StructuredInsight[] };
        try {
            const jsonMatch = insightJsonString.match(/```json\n([\s\S]*?)\n```/);
            const jsonToParse = jsonMatch ? jsonMatch[1] : insightJsonString;
            parsedResponse = JSON.parse(jsonToParse);
        } catch (e) {
            throw new Error("The AI returned an invalid response format. Please try again.");
        }
        
        if (!parsedResponse.insights || !Array.isArray(parsedResponse.insights)) {
             throw new Error("The AI response is missing the 'insights' array.");
        }

        setWidgets(prev => prev.map(w => (w.id === newWidgetId && w.type === 'ai') ? { ...w, config: { ...w.config, insight: parsedResponse.insights, status: 'success' } } : w));
    } catch (error: any) {
        setWidgets(prev => prev.map(w => (w.id === newWidgetId && w.type === 'ai') ? { ...w, config: { ...w.config, status: 'error', errorMessage: error.message || 'Failed to generate insight.' } } : w));
    }
  };
  
  const handleDeleteWidget = (id: string) => setWidgets(prev => prev.filter(w => w.id !== id));
  const handleToggleWidgetVisibility = (id: string) => setWidgets(prev => prev.map(w => w.id === id ? { ...w, isHidden: !w.isHidden } : w));
  const handleUpdateWidgetSize = (id: string, size: WidgetSize) => setWidgets(prev => prev.map(w => w.id === id ? { ...w, size } : w));

  const handleEditWidget = (id: string) => {
    const widget = widgets.find(w => w.id === id);
    if (!widget) return;
    setEditingWidgetId(id);
    switch (widget.type) {
        case 'chart': setIsChartModalOpen(true); break;
        case 'title': setIsTitleModalOpen(true); break;
        case 'text': setIsTextModalOpen(true); break;
        case 'pivot': setIsPivotModalOpen(true); break;
        case 'datatable': case 'ai': setIsTitleEditModalOpen(true); break;
    }
  };

  const handleSaveWidgetTitle = (newTitle: string) => {
    if (!editingWidgetId) return;
    setWidgets(prev => prev.map(w => {
        if (w.id !== editingWidgetId) return w;
        if (w.type === 'datatable') return { ...w, title: newTitle };
        if (w.type === 'ai') return { ...w, config: { ...w.config, title: newTitle } };
        return w;
    }));
    setIsTitleEditModalOpen(false);
    setEditingWidgetId(null);
  };

  const handleAddWidget = (type: 'chart' | 'kpi' | 'datatable' | 'title' | 'calc' | 'text' | 'ai' | 'pivot') => {
    const action = () => {
        if (type === 'chart') setIsChartModalOpen(true);
        else if (type === 'kpi') setIsKpiModalOpen(true);
        else if (type === 'text') setIsTextModalOpen(true);
        else if (type === 'ai') setIsAiModalOpen(true);
        else if (type === 'calc') setIsCalcModalOpen(true);
        else if (type === 'pivot') setIsPivotModalOpen(true);
        else if (type === 'title') {
          const existingTitle = widgets.find(w => w.type === 'title');
          if (existingTitle) setEditingWidgetId(existingTitle.id);
          setIsTitleModalOpen(true);
        } else if (type === 'datatable') {
            const title = `Data Table (${widgets.filter(w => w.type === 'datatable').length + 1})`;
            setWidgets(prev => [...prev, { id: `datatable-${Date.now()}`, type: 'datatable', size: 'full', title }]);
        }
    };
    
    if (type === 'ai') {
        withAuth(action);
    } else {
        action();
    }
  };
  
  const handleExportPDF = () => {
    withAuth(() => {
        setIsPreviewMode(false);
        setToast({ message: "Use your browser's print dialog to 'Save as PDF'.", type: 'success' });
        setTimeout(() => window.print(), 100);
    });
  };

  // --- DERIVED STATE & MEMOS ---
  const hiddenWidgets = useMemo(() => widgets.filter(w => w.isHidden), [widgets]);
  const widgetToEdit = useMemo(() => editingWidgetId ? widgets.find(w => w.id === editingWidgetId) : undefined, [editingWidgetId, widgets]);
  const canGoBackToConfig = useMemo(() => !!(parsedFile && selectedSheet && parsedFile.sheets[selectedSheet] && parsedFile.sheets[selectedSheet].length >= 1), [parsedFile, selectedSheet]);

  const getWidgetTitleForEdit = (widget?: AnyWidget): string => {
    if (!widget) return '';
    if (widget.type === 'datatable') return widget.title;
    if (widget.type === 'ai') return widget.config.title;
    return '';
  };

  // --- RENDER LOGIC ---
  if (showLandingPage) {
    return (
      <>
        <LandingPage onGetStarted={handleGetStarted} />
        <Analytics />
      </>
    );
  }

  const renderContent = () => {
    switch (appState) {
      case 'UPLOAD':
        return <UploadPage onFileUpload={handleFileUploaded} onDataPaste={handleDataPasted} onOpenLoadModal={() => withAuth(() => setIsLoadModalOpen(true))} />;
      case 'CONFIGURE':
        if (!parsedFile) return null; // Should not happen
        return <ConfigurePage fileName={fileName} parsedFile={parsedFile} selectedSheet={selectedSheet} onSheetSelect={(sheet) => handleSheetSelected(sheet)} initialColumnConfig={columnConfig} onConfirm={handleConfigConfirmed} onReset={handleReset} />;
      case 'DASHBOARD':
        return <DashboardPage
                    fileName={fileName}
                    widgets={widgets}
                    setWidgets={setWidgets}
                    data={data}
                    columnConfig={columnConfig}
                    theme={theme}
                    isPreviewMode={isPreviewMode}
                    setIsPreviewMode={setIsPreviewMode}
                    session={session}
                    onSignOut={signOut}
                    onDeleteWidget={handleDeleteWidget}
                    onUpdateWidgetSize={handleUpdateWidgetSize}
                    onToggleWidgetVisibility={handleToggleWidgetVisibility}
                    onEditWidget={handleEditWidget}
                    onAddWidget={handleAddWidget}
                    onReset={handleReset}
                    onLoad={() => withAuth(() => setIsLoadModalOpen(true))}
                    onSave={() => withAuth(() => setIsSaveModalOpen(true))}
                    onBackToConfig={() => setAppState('CONFIGURE')}
                    onShowLandingPage={() => setShowLandingPage(true)}
                    onManageHidden={() => setIsManageHiddenOpen(true)}
                    onSettings={() => withAuth(() => setIsSettingsModalOpen(true))}
                    onExportPDF={handleExportPDF}
                    hiddenWidgetsCount={hiddenWidgets.length}
                    canGoBackToConfig={canGoBackToConfig}
                />;
    }
  };

  const rootContainerClasses = appState === 'DASHBOARD' ? "" : "min-h-screen flex items-center justify-center p-4";

  return (
    <div className={rootContainerClasses}>
      {renderContent()}
      
      {/* All modals remain here as they are global overlays */}
      <div className="noprint">
        <ChartModal isOpen={isChartModalOpen} onClose={() => { setIsChartModalOpen(false); setEditingWidgetId(null); }} data={data} columnConfig={columnConfig} onSave={handleSaveChart} chartColors={themes[theme].chartColors} initialConfig={widgetToEdit?.type === 'chart' ? widgetToEdit.config : undefined} />
        <TitleModal isOpen={isTitleModalOpen} onClose={() => { setIsTitleModalOpen(false); setEditingWidgetId(null); }} onSave={handleSaveTitle} initialConfig={widgetToEdit?.type === 'title' ? widgetToEdit.config : undefined} />
        <TextModal isOpen={isTextModalOpen} onClose={() => { setIsTextModalOpen(false); setEditingWidgetId(null); }} onSave={handleSaveText} initialConfig={widgetToEdit?.type === 'text' ? widgetToEdit.config : undefined} />
        <AIInsightModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} columnConfig={columnConfig} aiSettings={aiSettings} onGenerate={handleGenerateAIInsight} />
        <PivotModal isOpen={isPivotModalOpen} onClose={() => { setIsPivotModalOpen(false); setEditingWidgetId(null); }} columnConfig={columnConfig} onSave={handleSavePivot} initialConfig={widgetToEdit?.type === 'pivot' ? widgetToEdit.config : undefined} />
        <CalculatedColumnModal isOpen={isCalcModalOpen} onClose={() => setIsCalcModalOpen(false)} numericColumns={columnConfig.filter(c => c.isNumeric)} existingLabels={columnConfig.map(c => c.label)} onSubmit={handleAddCalculatedColumn} />
        <KpiModal isOpen={isKpiModalOpen} onClose={() => setIsKpiModalOpen(false)} data={data} numericColumns={columnConfig.filter(c => c.isNumeric)} onSubmit={handleAddKpi} />
        <LoadDashboardModal isOpen={isLoadModalOpen} onClose={() => setIsLoadModalOpen(false)} dashboards={savedDashboards} onLoad={handleLoadDashboard} onDelete={handleDeleteDashboard} />
        <SaveDashboardModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} onSave={handleSaveDashboard} existingNames={savedDashboards.map(d => d.name)} />
        <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} onSave={handleSaveAiSettings} initialConfigs={aiSettings} currentTheme={theme} onThemeChange={setTheme} />
        <TitleEditModal isOpen={isTitleEditModalOpen} onClose={() => { setIsTitleEditModalOpen(false); setEditingWidgetId(null); }} onSave={handleSaveWidgetTitle} initialTitle={getWidgetTitleForEdit(widgetToEdit)} />
        <ManageHiddenWidgetsModal isOpen={isManageHiddenOpen} onClose={() => setIsManageHiddenOpen(false)} hiddenWidgets={hiddenWidgets} onToggleVisibility={handleToggleWidgetVisibility} />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={handleAuthSuccess} />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <Analytics />
      </div>
    </div>
  );
}
