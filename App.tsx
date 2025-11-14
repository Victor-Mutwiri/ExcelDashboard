import React, { useState, useCallback, useEffect } from 'react';
import { AppState, ColumnConfig, RowData, ParsedFile, SavedDashboard, AnyWidget, ChartWidgetConfig, KpiWidgetConfig, WidgetSize } from './types';
import FileUpload from './components/FileUpload';
import DataConfiguration from './components/DataConfiguration';
import DashboardCanvas from './components/DashboardCanvas';
import ChartModal from './components/ChartModal';
import CalculatedColumnModal from './components/CalculatedColumnModal';
import LoadDashboardModal from './components/LoadDashboardModal';
import SaveDashboardModal from './components/SaveDashboardModal';
import KpiModal from './components/KpiModal';
import Toast from './components/Toast';
import LandingPage from './components/LandingPage';
import { parseFile, processData } from './utils/fileParser';
import { ChartIcon, PlusIcon, ResetIcon, SaveIcon, FolderOpenIcon, KpiIcon, TableIcon } from './components/Icons';

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
  const [isAddWidgetMenuOpen, setAddWidgetMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [savedDashboards, setSavedDashboards] = useState<SavedDashboard[]>([]);

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
          isNumeric: sheetData.slice(1).every(row => !isNaN(parseFloat(row[i]))),
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
        // Check if all subsequent rows in this column are numeric
        isNumeric: rows.slice(1).every(row => row[i] === null || row[i] === '' || !isNaN(parseFloat(row[i]))),
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
      isNumeric: sheetData.slice(1).every(row => row[i] === null || !isNaN(parseFloat(row[i]))),
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
  
  const handleAddChart = (config: ChartWidgetConfig) => {
    const newChartWidget: AnyWidget = {
      id: `chart-${Date.now()}`,
      type: 'chart',
      size: '1/2',
      config
    };
    setWidgets(prev => [...prev, newChartWidget]);
    setIsChartModalOpen(false);
  };
  
  const handleAddKpi = (config: KpiWidgetConfig) => {
    const newKpiWidget: AnyWidget = {
        id: `kpi-${Date.now()}`,
        type: 'kpi',
        size: '1/3',
        config,
    };
    setWidgets(prev => [...prev, newKpiWidget]);
    setIsKpiModalOpen(false);
  };
  
  const handleDeleteWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  const handleUpdateWidgetSize = (id: string, size: WidgetSize) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, size } : w));
  };

  const handleAddWidget = (type: 'chart' | 'kpi' | 'datatable') => {
    setAddWidgetMenuOpen(false);
    if(type === 'chart') setIsChartModalOpen(true);
    if(type === 'kpi') setIsKpiModalOpen(true);
    if(type === 'datatable') {
        const newTableWidget: AnyWidget = {
            id: `datatable-${Date.now()}`,
            type: 'datatable',
            size: 'full',
            title: `Data Table (${widgets.filter(w => w.type === 'datatable').length + 1})`
        };
        setWidgets(prev => [...prev, newTableWidget]);
    }
  };

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
          <div className="w-full h-full flex flex-col p-4 sm:p-6 lg:p-8 gap-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">{fileName}</h1>
                <p className="text-gray-400">Your interactive dashboard is ready.</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={handleReset} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2">
                  <ResetIcon /> Start Over
                </button>
                 <button onClick={() => setIsLoadModalOpen(true)} className="px-4 py-2 text-sm font-semibold text-white bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2">
                  <FolderOpenIcon /> Load
                </button>
                <button onClick={() => setIsSaveModalOpen(true)} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-2">
                  <SaveIcon /> Save Dashboard
                </button>
                <div className="relative">
                    <button onClick={() => setAddWidgetMenuOpen(prev => !prev)} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-500 rounded-lg flex items-center gap-2">
                        <PlusIcon /> Add Widget
                    </button>
                    {isAddWidgetMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-20">
                            <button onClick={() => handleAddWidget('kpi')} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-gray-600"><KpiIcon /> KPI Card</button>
                            <button onClick={() => handleAddWidget('chart')} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-gray-600"><ChartIcon /> Chart</button>
                            <button onClick={() => handleAddWidget('datatable')} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-gray-600"><TableIcon /> Data Table</button>
                        </div>
                    )}
                </div>
              </div>
            </header>
            <main className="flex-grow overflow-auto -m-3 p-3">
              <DashboardCanvas 
                widgets={widgets}
                setWidgets={setWidgets}
                data={data} 
                columnConfig={columnConfig}
                onDeleteWidget={handleDeleteWidget}
                onUpdateWidgetSize={handleUpdateWidgetSize}
              />
            </main>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
      {renderContent()}
      
      <ChartModal 
        isOpen={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
        data={data}
        columnConfig={columnConfig}
        onSave={handleAddChart}
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

      {toast && (
          <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
          />
      )}
    </div>
  );
}