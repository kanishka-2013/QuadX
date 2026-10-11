import React, { useState } from 'react';
import { useDataset } from '../context/DatasetContext';
import { Upload, Sparkles, FileSpreadsheet, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { DataPreviewTable } from '../components/DataPreviewTable';

export const UploadPage = () => {
  const { uploadFile, loadSampleDataset, isLoading, dataset, setActiveTab } = useDataset();
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Banner */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 text-white shadow-md shadow-blue-500/20 mb-1">
            <Upload className="w-8 h-8 animate-bounce" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Upload Messy Excel or CSV Dataset</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Drag and drop your dataset to automatically detect quality issues, purge exact duplicates, normalize column schemas, and standardize text formatting.
          </p>

          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 transition-all text-center cursor-pointer ${
              dragActive ? 'border-blue-600 bg-blue-50/60 scale-[1.01]' : 'border-slate-300 hover:border-blue-500 bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleChange}
              disabled={isLoading}
              className="hidden"
              id="file-upload-input"
            />
            <label htmlFor="file-upload-input" className="cursor-pointer space-y-3 block">
              <FileSpreadsheet className="w-10 h-10 text-blue-600 mx-auto" />
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Click to select file or drag & drop here
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports CSV (.csv) and Excel (.xlsx, .xls) up to 25MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => document.getElementById('file-upload-input').click()}
                disabled={isLoading}
                className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition inline-block cursor-pointer"
              >
                Browse Local File
              </button>
            </label>
          </div>

          {/* Judge Instant Test Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-center space-x-3">
            <span className="text-xs text-slate-400">Want an instant test dataset?</span>
            <button
              onClick={loadSampleDataset}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Try Sample Messy Dataset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Preview Section if loaded */}
      {dataset && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Uploaded Dataset Overview</h3>
            <button
              onClick={() => setActiveTab('analysis')}
              className="flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              <span>View Audit Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <DataPreviewTable initialView="original" />
        </div>
      )}
    </div>
  );
};
