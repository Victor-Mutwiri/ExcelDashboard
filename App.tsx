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
import { parseFile, processData } from './utils/fileParser';
import { ChartIcon, PlusIcon, ResetIcon, SaveIcon, FolderOpenIcon, KpiIcon, TableIcon } from './components/Icons';

export default function App() {
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

  const handleSheetSelected = useCallback((sheetName: string) => {
    if (!parsedFile) return;
    setSelectedSheet(sheetName);
    const sheetData = parsedFile.sheets[sheetName];
    const headers = sheetData[0] || [];
    const initialConfig: ColumnConfig[] = headers.map((h, i) => ({
      id: `col_${i}`,
      label: String(h || `Column ${i + 1}`),
      isNumeric: sheetData.slice(1).every(row => row[i] === null || row[i] === undefined || !isNaN(parseFloat(row[i]))),
    }));
    setColumnConfig(initialConfig);
  }, [parsedFile]);

  const handleConfigConfirmed = useCallback((finalConfig: ColumnConfig[]) => {
    if (!parsedFile || !selectedSheet) return;
    const rawData = parsedFile.sheets[selectedSheet];
    const processed = processData(rawData, finalConfig);
    setData(processed);
    setColumnConfig(finalConfig);

    setWidgets([
      {
        id: `datatable_${Date.now()}`,
        type: 'datatable',
        title: 'Full Data Table',
        size: 'full',
      }
    ]);
    setAppState('DASHBOARD');
  }, [parsedFile, selectedSheet]);

  const handleCreateCalculatedColumn = useCallback((name: string, formula: string) => {
    if (!parsedFile || !selectedSheet) return;
    
    const newColumn: ColumnConfig = {
      id: `calc_${Date.now()}`,
      label: name,
      isNumeric: true,
      formula,
    };

    const updatedConfig = [...columnConfig, newColumn];
    const rawData = parsedFile.sheets[selectedSheet];
    const processed = processData(rawData, updatedConfig);
    
    setData(processed);
    setColumnConfig(updatedConfig);
    setIsCalcModalOpen(false);
  }, [columnConfig, parsedFile, selectedSheet]);

  const handleAddChartWidget = (config: ChartWidgetConfig) => {
    const newWidget: AnyWidget = {
      id: `chart_${Date.now()}`,
      type: 'chart',
      size: '1/2',
      config,
    };
    setWidgets(prev => [...prev, newWidget]);
    setIsChartModalOpen(false);
  };
  
  const handleAddKpiWidget = (config: KpiWidgetConfig) => {
    const newWidget: AnyWidget = {
      id: `kpi_${Date.now()}`,
      type: 'kpi',
      size: '1/3',
      config,
    };
    setWidgets(prev => [...prev, newWidget]);
    setIsKpiModalOpen(false);
  };

  const handleDeleteWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  const handleUpdateWidgetSize = (id: string, size: WidgetSize) => {
    setWidgets(prev => prev.map(w => w.id === id ? {...w, size} : w));
  };
  
  const handleConfirmSave = (name: string) => {
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
    setToast({ message: `Dashboard "${name}" saved successfully!`, type: 'success' });
  };

  const handleLoadDashboard = (dashboard: SavedDashboard) => {
    setData(dashboard.data);
    setColumnConfig(dashboard.columnConfig);
    setFileName(dashboard.fileName);
    setWidgets(dashboard.widgets || []);
    setAppState('DASHBOARD');
    setIsLoadModalOpen(false);
    setParsedFile(null);
    setSelectedSheet('');
  };

  const handleDeleteDashboard = (name: string) => {
    const updatedDashboards = savedDashboards.filter(d => d.name !== name);
    setSavedDashboards(updatedDashboards);
    localStorage.setItem('dashboards', JSON.stringify(updatedDashboards));
  };

  const handleGoBackToConfig = () => {
    setAppState('CONFIGURE');
  };

  const handleReset = () => {
    setAppState('UPLOAD');
    setFileName('');
    setParsedFile(null);
    setSelectedSheet('');
    setColumnConfig([]);
    setData([]);
    setWidgets([]);
  };

  const renderContent = () => {
    switch (appState) {
      case 'UPLOAD':
        return <FileUpload onFileUpload={handleFileUploaded} onOpenLoadModal={() => setIsLoadModalOpen(true)} />;
      case 'CONFIGURE':
        if (!parsedFile) return null;
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
          <div className="w-full h-screen flex flex-col p-4 md:p-6 lg:p-8 gap-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-4 mb-1">
                  {parsedFile && (
                    <button 
                      onClick={handleGoBackToConfig} 
                      className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      <ResetIcon className="w-4 h-4" /> Go Back
                    </button>
                  )}
                  <button 
                    onClick={handleReset} 
                    className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                  >
                    Start Over
                  </button>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">{fileName}</h1>
                <p className="text-gray-400">{data.length} rows &bull; {columnConfig.length} columns</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                 <div className="relative">
                  <button
                    onClick={() => setAddWidgetMenuOpen(prev => !prev)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                  >
                    <PlusIcon />
                    Add Widget
                  </button>
                  {isAddWidgetMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-20">
                      <button onClick={() => {setIsChartModalOpen(true); setAddWidgetMenuOpen(false);}} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-gray-600 rounded-t-lg"><ChartIcon /> Chart</button>
                      <button onClick={() => {setIsKpiModalOpen(true); setAddWidgetMenuOpen(false);}} className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-gray-600"><KpiIcon /> KPI Card</button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsSaveModalOpen(true)}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                >
                  <SaveIcon />
                  Save
                </button>
                <button
                  onClick={() => setIsLoadModalOpen(true)}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                >
                  <FolderOpenIcon />
                  Load
                </button>
              </div>
            </header>
            <main className="flex-grow overflow-y-auto pb-8">
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
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center font-sans">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {renderContent()}
      {isChartModalOpen && (
        <ChartModal
          isOpen={isChartModalOpen}
          onClose={() => setIsChartModalOpen(false)}
          data={data}
          columnConfig={columnConfig}
          onSave={handleAddChartWidget}
        />
      )}
      {isKpiModalOpen && (
        <KpiModal
          isOpen={isKpiModalOpen}
          onClose={() => setIsKpiModalOpen(false)}
          numericColumns={columnConfig.filter(c => c.isNumeric)}
          onSubmit={handleAddKpiWidget}
        />
      )}
      {isCalcModalOpen && (
        <CalculatedColumnModal
          isOpen={isCalcModalOpen}
          onClose={() => setIsCalcModalOpen(false)}
          numericColumns={columnConfig.filter(c => c.isNumeric)}
          existingLabels={columnConfig.map(c => c.label)}
          onSubmit={handleCreateCalculatedColumn}
        />
      )}
      {isLoadModalOpen && (
        <LoadDashboardModal
          isOpen={isLoadModalOpen}
          onClose={() => setIsLoadModalOpen(false)}
          dashboards={savedDashboards}
          onLoad={handleLoadDashboard}
          onDelete={handleDeleteDashboard}
        />
      )}
       {isSaveModalOpen && (
        <SaveDashboardModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          onSave={handleConfirmSave}
          existingNames={savedDashboards.map(d => d.name)}
        />
      )}
    </div>
  );
}
