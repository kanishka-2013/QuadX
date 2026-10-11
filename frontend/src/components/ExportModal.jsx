import React, { useState } from 'react';
import { useDataset } from '../context/DatasetContext';
import { api } from '../services/api';
import { Download, FileSpreadsheet, FileText, Check, CheckSquare, Square, X } from 'lucide-react';

export const ExportModal = () => {
  const { datasetId, dataset } = useDataset();

  if (!dataset) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
        <p className="text-slate-500 text-sm">Please upload a dataset or load the sample dataset to export files.</p>
      </div>
    );
  }

  const allColumns = dataset.column_names || [];
  const [selectedColumns, setSelectedColumns] = useState(
    allColumns.reduce((acc, col) => ({ ...acc, [col]: true }), {})
  );

  const toggleSelectAll = () => {
    const allSelected = Object.values(selectedColumns).every(v => v);
    const updated = {};
    allColumns.forEach(c => { updated[c] = !allSelected; });
    setSelectedColumns(updated);
  };

  const handleToggleCol = (col) => {
    setSelectedColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const getExportColList = () => {
    const active = allColumns.filter(c => selectedColumns[c]);
    return active.length < allColumns.length ? active : [];
  };

  const handleDownloadCsv = () => {
    const cols = getExportColList();
    const url = api.getDownloadCsvUrl(datasetId, cols);
    window.open(url, '_blank');
  };

  const handleDownloadExcel = () => {
    const cols = getExportColList();
    const url = api.getDownloadExcelUrl(datasetId, cols);
    window.open(url, '_blank');
  };

  const handleDownloadReport = () => {
    const url = api.getDownloadReportUrl(datasetId);
    window.open(url, '_blank');
  };

  const selectedCount = allColumns.filter(c => selectedColumns[c]).length;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
      <div className="pb-4 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <Download className="w-5 h-5 text-blue-600" />
          <span>Export Cleaned Dataset & Audit Report</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Select target attributes to export and choose your preferred file format.
        </p>
      </div>

      {/* Column Selection Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Select Columns to Export ({selectedCount} of {allColumns.length})
          </span>

          <button
            onClick={toggleSelectAll}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
          >
            {selectedCount === allColumns.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80 max-h-48 overflow-y-auto">
          {allColumns.map(col => (
            <label key={col} className="flex items-center space-x-2 text-xs font-mono text-slate-700 cursor-pointer hover:bg-white p-1.5 rounded transition">
              <input
                type="checkbox"
                checked={!!selectedColumns[col]}
                onChange={() => handleToggleCol(col)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="truncate">{col}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Download Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        {/* CSV Download Button */}
        <button
          onClick={handleDownloadCsv}
          className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 hover:border-blue-400 transition text-left group shadow-xs cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-blue-600 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full uppercase">
              CSV Format
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">Download Cleaned CSV</h4>
          <p className="text-xs text-slate-500 mt-1">Standard UTF-8 plain text CSV file.</p>
        </button>

        {/* Excel Download Button */}
        <button
          onClick={handleDownloadExcel}
          className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 hover:border-emerald-400 transition text-left group shadow-xs cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
              Excel .XLSX
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">Download Excel Spreadsheet</h4>
          <p className="text-xs text-slate-500 mt-1">Native Microsoft Excel workbook.</p>
        </button>

        {/* Report Download Button */}
        <button
          onClick={handleDownloadReport}
          className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-slate-50 border border-purple-200/80 hover:border-purple-400 transition text-left group shadow-xs cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-purple-600 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full uppercase">
              Audit Report
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">Download Summary Report</h4>
          <p className="text-xs text-slate-500 mt-1">Audit log & improvement metrics document.</p>
        </button>
      </div>
    </div>
  );
};
