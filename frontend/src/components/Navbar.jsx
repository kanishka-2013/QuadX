import React from 'react';
import { useDataset } from '../context/DatasetContext';
import { Sparkles, FileSpreadsheet, RotateCcw, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

export const Navbar = () => {
  const { dataset, loadSampleDataset, resetDataset, isLoading, activeTab, setActiveTab } = useDataset();

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-6 flex items-center justify-between shadow-xs">
      {/* Brand Logo & Title */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
              DataGenius AI
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full border border-purple-200">
              Pro SaaS
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Intelligent Data Cleaning & Restructuring Engine</p>
        </div>
      </div>

      {/* Dataset Quick Info & Action Buttons */}
      <div className="flex items-center space-x-3">
        {dataset ? (
          <div className="hidden md:flex items-center bg-slate-100/80 px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 space-x-3">
            <div className="flex items-center space-x-1.5 font-medium text-slate-900">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span className="max-w-[140px] truncate">{dataset.filename}</span>
            </div>
            <span className="text-slate-300">|</span>
            <span>{dataset.total_rows} rows</span>
            <span className="text-slate-300">|</span>
            <span>{dataset.total_columns} cols</span>
            <span className="text-slate-300">|</span>
            <span className={`font-semibold ${dataset.quality_score.total_score >= 80 ? 'text-emerald-600' : dataset.quality_score.total_score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
              Score: {dataset.quality_score.total_score}/100
            </span>
          </div>
        ) : (
          <span className="hidden md:inline-block text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            No dataset loaded
          </span>
        )}

        {/* Quick Sample Dataset Button */}
        <button
          onClick={loadSampleDataset}
          disabled={isLoading}
          className="flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition shadow-xs disabled:opacity-50 cursor-pointer"
          title="Instantly test application using dirty sample dataset"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Try Sample Dataset</span>
        </button>

        {/* Reset dataset button if dataset loaded */}
        {dataset && (
          <button
            onClick={resetDataset}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition shadow-xs disabled:opacity-50 cursor-pointer"
            title="Restore dataset to original state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('upload')}
          className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-sm shadow-blue-500/20 transition cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload File</span>
        </button>
      </div>
    </header>
  );
};
