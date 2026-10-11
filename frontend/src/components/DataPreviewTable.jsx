import React, { useState, useEffect } from 'react';
import { useDataset } from '../context/DatasetContext';
import { Search, ChevronLeft, ChevronRight, Table as TableIcon, Filter, ArrowUpDown } from 'lucide-react';

export const DataPreviewTable = ({ initialView = 'current' }) => {
  const { datasetId, previewData, refreshPreview, dataset } = useDataset();

  const [view, setView] = useState(initialView);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (datasetId) {
      refreshPreview(datasetId, view, page, pageSize, search);
    }
  }, [datasetId, view, page, pageSize]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    refreshPreview(datasetId, view, 1, pageSize, search);
  };

  const handleViewToggle = (newView) => {
    setView(newView);
    setPage(1);
  };

  if (!previewData) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
        <p className="text-slate-500 text-sm">No table data available to preview.</p>
      </div>
    );
  }

  const columns = previewData.columns || [];
  const rows = previewData.data || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* Header controls bar */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => handleViewToggle('current')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                view === 'current' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cleaned Dataset
            </button>
            <button
              onClick={() => handleViewToggle('original')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                view === 'original' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Original Upload
            </button>
          </div>

          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Showing {previewData.total_rows} row(s) x {columns.length} column(s)
          </span>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search table cell content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-slate-300 text-xs text-slate-800 rounded-xl pl-9 pr-3 py-1.5 w-60 focus:ring-2 focus:ring-blue-500 shadow-2xs"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Interactive Table Container */}
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-100/80 sticky top-0 z-10 border-b border-slate-200">
            <tr>
              <th className="p-3 font-bold text-slate-400 uppercase tracking-wider w-12 border-r border-slate-200/60 text-center">
                #
              </th>
              {columns.map((col) => {
                const colType = dataset?.column_types?.[col] || 'string';
                return (
                  <th key={col} className="p-3 font-bold text-slate-700 border-r border-slate-200/60 whitespace-nowrap">
                    <div className="flex items-center justify-between space-x-2">
                      <span className="font-mono text-slate-900">{col}</span>
                      <span className="text-[10px] text-slate-400 font-normal px-1.5 py-0.5 bg-white rounded border border-slate-200">
                        {colType}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-mono">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-8 text-center text-slate-400 font-sans">
                  No matching records found.
                </td>
              </tr>
            ) : (
              rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-blue-50/40 transition">
                  <td className="p-3 text-slate-400 border-r border-slate-100 text-center font-sans text-[11px]">
                    {(page - 1) * pageSize + rIdx + 1}
                  </td>
                  {columns.map((col) => {
                    const cellVal = row[col];
                    const isMissing = cellVal === '' || cellVal === null || cellVal === undefined;

                    return (
                      <td key={col} className="p-3 border-r border-slate-100 text-slate-700 whitespace-nowrap max-w-xs truncate">
                        {isMissing ? (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 rounded border border-amber-200 italic font-sans">
                            (null)
                          </span>
                        ) : (
                          String(cellVal)
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center space-x-3">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="bg-white border border-slate-300 rounded-lg text-xs p-1 focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <span>
            Page <strong className="text-slate-900">{previewData.page}</strong> of <strong className="text-slate-900">{previewData.total_pages}</strong>
          </span>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(previewData.total_pages, p + 1))}
              disabled={page >= previewData.total_pages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
