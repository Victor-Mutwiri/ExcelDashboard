import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { AppState, ColumnConfig, RowData, ParsedFile, SavedDashboard, AnyWidget, ChartWidgetConfig, KpiWidgetConfig, WidgetSize, ChartWidget, TitleWidgetConfig } from './types';
import FileUpload from './components/FileUpload';
import DataConfiguration from './components/DataConfiguration';
import DashboardCanvas from './components/DashboardCanvas';
import ChartModal from './components/ChartModal';
import CalculatedColumnModal from './components/CalculatedColumnModal';
import LoadDashboardModal from './components/LoadDashboardModal';
import SaveDashboardModal from './components/SaveDashboardModal';
import KpiModal from './components/KpiModal';
import TitleModal from './components/TitleModal';
import Toast from './components/Toast';
import LandingPage from './components/LandingPage';
import ManageHiddenWidgetsModal from './components/ManageHiddenWidgetsModal';
import { parseFile, processData } from './utils/fileParser';
import { ChartIcon, PlusIcon, ResetIcon, SaveIcon, FolderOpenIcon, KpiIcon, TableIcon, ExportIcon, PaintBrushIcon, EyeIcon, CloseIcon, TitleIcon } from './components/Icons';
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
  const [isManageHiddenOpen, setIsManageHiddenOpen] = useState(false);
  const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null);

  const [isAddWidgetMenuOpen, setAddWidgetMenuOpen] = useState(false);
  const [isExportMenuOpen, setExportMenuOpen] = useState(false);
  const [isThemeMenuOpen, setThemeMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);


  const [savedDashboards, setSavedDashboards] = useState<SavedDashboard[]>([]);
  const [theme, setTheme] = useState<ThemeName>(() => {
    return (localStorage.getItem('dashboard-theme') as ThemeName) || 'dark';
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
    } catch (error) {
      console.error("Failed to load dashboards from localStorage", error);
      setSavedDashboards([]);
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
    setWidgets([
        { id: `datatable-${Date.now()}`, type: 'datatable', size: 'full', title: fileName }
    ]);
    setAppState('DASHBOARD');
  }, [parsedFile, selectedSheet, fileName]);
  
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
    if (appState === 'DASHBOARD') {
      const processedData = processData(parsedFile!.sheets[selectedSheet], newConfig);
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
      // Update existing title
      setWidgets(prev => prev.map(w => w.id === existingTitle.id ? { ...w, config } : w));
    } else {
      // Add new title to the top
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
  
  const handleDeleteWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  const handleEditWidget = (id: string) => {
    const widget = widgets.find(w => w.id === id);
    if (widget?.type === 'chart') {
      setEditingWidgetId(id);
      setIsChartModalOpen(true);
    }
    if (widget?.type === 'title') {
      setEditingWidgetId(id);
      setIsTitleModalOpen(true);
    }
  };

  const handleToggleWidgetVisibility = (id: string) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, isHidden: !w.isHidden } : w));
  };

  const handleUpdateWidgetSize = (id: string, size: WidgetSize) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, size } : w));
  };

  const handleAddWidget = (type: 'chart' | 'kpi' | 'datatable' | 'title') => {
    setAddWidgetMenuOpen(false);
    if (type === 'chart') setIsChartModalOpen(true);
    if (type === 'kpi') setIsKpiModalOpen(true);
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

  const hiddenWidgets = useMemo(() => widgets.filter(w => w.isHidden), [widgets]);
  const widgetToEdit = useMemo(() =>
    editingWidgetId ? widgets.find(w => w.id === editingWidgetId) : undefined,
    [editingWidgetId, widgets]
  );

  if (showLandingPage) {
    return <LandingPage onGetStarted={() => setShowLandingPage(false)} />;
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
          <div className="w-full min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 gap-6">
            {isPreviewMode && (
                <div className="fixed top-0 left-0 right-0 bg-gray-800 text-white p-3 flex justify-center items-center gap-4 z-50">
                    <p className="font-semibold">Print Preview Mode</p>
                    <button onClick={() => setIsPreviewMode(false)} className="px-4 py-1 text-sm font-semibold bg-gray-600 hover:bg-gray-500 rounded-lg flex items-center gap-2">
                        <CloseIcon className="w-4 h-4" /> Exit Preview
                    </button>
                </div>
            )}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 noprint bg-[var(--bg-header)] theme-corporate:text-white p-4 rounded-xl shadow-md">
              <div>
                <h1 className="text-2xl font-bold">{fileName}</h1>
                <p className="text-[var(--text-secondary)]">Your interactive dashboard is ready.</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {hiddenWidgets.length > 0 && (
                  <button onClick={() => setIsManageHiddenOpen(true)} className="px-4 py-2 text-sm font-semibold bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg flex items-center gap-2">
                    <EyeIcon /> Hidden <span className="bg-[var(--bg-accent)] text-[var(--text-on-accent)] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{hiddenWidgets.length}</span>
                  </button>
                )}
                <button onClick={handleReset} className="px-4 py-2 text-sm font-semibold bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg flex items-center gap-2">
                  <ResetIcon /> Start Over
                </button>
                 <button onClick={() => setIsLoadModalOpen(true)} className="px-4 py-2 text-sm font-semibold bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg flex items-center gap-2">
                  <FolderOpenIcon /> Load
                </button>
                <button onClick={() => setIsSaveModalOpen(true)} className="px-4 py-2 text-sm font-semibold text-[var(--text-on-accent)] bg-[var(--bg-accent)] hover:bg-[var(--bg-accent-hover)] rounded-lg flex items-center gap-2">
                  <SaveIcon /> Save
                </button>
                 <div className="relative">
                    <button onClick={() => setThemeMenuOpen(prev => !prev)} className="px-4 py-2 text-sm font-semibold bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg flex items-center gap-2">
                        <PaintBrushIcon /> Theme
                    </button>
                    {isThemeMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-xl z-20">
                            {Object.entries(themes).map(([key, value]) => (
                                <button key={key} onClick={() => { setTheme(key as ThemeName); setThemeMenuOpen(false); }} className={`w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-contrast-hover)] ${theme === key ? 'font-bold text-[var(--color-accent)]' : ''}`}>
                                    {value.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                 <div className="relative">
                    <button onClick={() => setExportMenuOpen(prev => !prev)} className="px-4 py-2 text-sm font-semibold bg-[var(--bg-contrast)] hover:bg-[var(--bg-contrast-hover)] rounded-lg flex items-center gap-2">
                        <ExportIcon /> Export
                    </button>
                    {isExportMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-xl z-20">
                            <button onClick={() => { setIsPreviewMode(true); setExportMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-contrast-hover)]">Print Preview</button>
                            <button onClick={handleExportPDF} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-contrast-hover)]">Save as PDF</button>
                        </div>
                    )}
                </div>
                <div className="relative">
                    <button onClick={() => setAddWidgetMenuOpen(prev => !prev)} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-500 rounded-lg flex items-center gap-2">
                        <PlusIcon /> Add Widget
                    </button>
                    {isAddWidgetMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-xl z-20">
                            <button onClick={() => handleAddWidget('title')} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-contrast-hover)]"><TitleIcon /> Report Title</button>
                            <button onClick={() => handleAddWidget('kpi')} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-contrast-hover)]"><KpiIcon /> KPI Card</button>
                            <button onClick={() => handleAddWidget('chart')} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-contrast-hover)]"><ChartIcon /> Chart</button>
                            <button onClick={() => handleAddWidget('datatable')} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-contrast-hover)]"><TableIcon /> Data Table</button>
                        </div>
                    )}
                </div>
              </div>
            </header>
            <main className="flex-grow overflow-auto -m-3 p-3 printable-area">
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
    ? "min-h-screen"
    : "min-h-screen flex items-center justify-center";

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
