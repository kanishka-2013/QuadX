import React, { useState, useEffect } from 'react';
import { useDataset } from '../context/DatasetContext';
import { SlidersHorizontal, ArrowUp, ArrowDown, Trash2, Edit3, Check, RefreshCw, Eye } from 'lucide-react';

export const RestructurePanel = () => {
  const { dataset, applyRestructure, isLoading } = useDataset();

  if (!dataset) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
        <p className="text-slate-500 text-sm">Please upload a dataset or load the sample dataset first.</p>
      </div>
    );
  }

  const [colList, setColList] = useState([]);
  const [renameMap, setRenameMap] = useState({});
  const [selectedKeep, setSelectedKeep] = useState({});

  useEffect(() => {
    if (dataset && dataset.column_names) {
      setColList(dataset.column_names);
      const initialMap = {};
      const initialKeep = {};
      dataset.column_names.forEach(c => {
        initialMap[c] = c;
        initialKeep[c] = true;
      });
      setRenameMap(initialMap);
      setSelectedKeep(initialKeep);
    }
  }, [dataset]);

  const handleMove = (index, direction) => {
    const newCols = [...colList];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= newCols.length) return;
    const temp = newCols[index];
    newCols[index] = newCols[targetIdx];
    newCols[targetIdx] = temp;
    setColList(newCols);
  };

  const handleRenameChange = (oldName, newName) => {
    setRenameMap(prev => ({ ...prev, [oldName]: newName }));
  };

  const handleToggleKeep = (colName) => {
    setSelectedKeep(prev => ({ ...prev, [colName]: !prev[colName] }));
  };

  const handleSaveRestructure = () => {
    const keepCols = colList.filter(c => selectedKeep[c]);
    const finalRenameMap = {};
    Object.entries(renameMap).forEach(([oldName, newName]) => {
      if (oldName !== newName && newName.trim()) {
        finalRenameMap[oldName] = newName.trim();
      }
    });

    const opts = {
      rename_columns: Object.keys(finalRenameMap).length > 0 ? finalRenameMap : null,
      keep_columns: keepCols.length < colList.length ? keepCols : null,
      reorder_columns: colList
    };

    applyRestructure(opts);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <SlidersHorizontal className="w-5 h-5 text-purple-600" />
            <span>Data Restructuring Studio</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Rename headers, reorder dataset columns, or exclude unwanted attributes.
          </p>
        </div>

        <button
          onClick={handleSaveRestructure}
          disabled={isLoading}
          className="flex items-center space-x-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Applying Layout...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Save & Apply Restructuring</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-3 pb-2">
          <span>Include Column</span>
          <span className="w-1/3">Original Name</span>
          <span className="w-1/3">New Display Name</span>
          <span>Reorder</span>
        </div>

        {colList.map((colName, idx) => (
          <div
            key={colName}
            className={`p-3 rounded-xl border flex items-center justify-between gap-4 transition ${
              selectedKeep[colName]
                ? 'bg-slate-50 border-slate-200'
                : 'bg-red-50/40 border-red-200 opacity-60'
            }`}
          >
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={!!selectedKeep[colName]}
                onChange={() => handleToggleKeep(colName)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
              />
              <span className="text-xs font-mono font-semibold text-slate-700 max-w-[140px] truncate">
                {colName}
              </span>
            </div>

            <div className="w-1/3">
              <input
                type="text"
                value={renameMap[colName] ?? colName}
                onChange={(e) => handleRenameChange(colName, e.target.value)}
                disabled={!selectedKeep[colName]}
                className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg p-2 focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleMove(idx, -1)}
                disabled={idx === 0}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                title="Move Column Left / Up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleMove(idx, 1)}
                disabled={idx === colList.length - 1}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                title="Move Column Right / Down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
