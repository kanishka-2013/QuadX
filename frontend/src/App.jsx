import React from 'react';
import { DatasetProvider, useDataset } from './context/DatasetContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { IssuesList } from './components/IssuesList';
import { CleaningPanel } from './components/CleaningPanel';
import { RestructurePanel } from './components/RestructurePanel';
import { ComparisonView } from './components/ComparisonView';
import { AIInsightsPanel } from './components/AIInsightsPanel';
import { ExportModal } from './components/ExportModal';
import { AlertCircle, CheckCircle, X, RefreshCw } from 'lucide-react';

const MainContent = () => {
  const { activeTab, error, setError, successMessage, setSuccessMessage, isLoading } = useDataset();

  return (
    <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Toast Notification Banners */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center space-x-2.5 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center space-x-2.5 text-xs font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Loading Overlay Banner */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2.5 rounded-2xl flex items-center space-x-3 text-xs font-medium shadow-2xs">
          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
          <span>Processing dataset request on FastAPI backend engine...</span>
        </div>
      )}

      {/* Tab Page Router */}
      {activeTab === 'dashboard' && <DashboardPage />}
      {activeTab === 'upload' && <UploadPage />}
      {activeTab === 'analysis' && <IssuesList />}
      {activeTab === 'cleaning' && <CleaningPanel />}
      {activeTab === 'restructure' && <RestructurePanel />}
      {activeTab === 'comparison' && <ComparisonView />}
      {activeTab === 'insights' && <AIInsightsPanel />}
      {activeTab === 'export' && <ExportModal />}
    </main>
  );
};

export default function App() {
  return (
    <DatasetProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <MainContent />
        </div>
      </div>
    </DatasetProvider>
  );
}
