import React from 'react';
import { useDataset } from '../context/DatasetContext';
import { DataPreviewTable } from './DataPreviewTable';
import { RotateCcw, History, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const ComparisonView = () => {
  const { dataset, cleanedInfo, resetDataset, isLoading } = useDataset();

  if (!dataset) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
        <p className="text-slate-500 text-sm">Please upload a dataset or load the sample dataset first.</p>
      </div>
    );
  }

  const changeLog = cleanedInfo?.change_log || [];

  return (
    <div className="space-y-6">
      {/* Transformation Audit Change Log Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Transformation Change Log</h3>
          </div>

          <button
            onClick={resetDataset}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Original Dataset</span>
          </button>
        </div>

        {changeLog.length === 0 ? (
          <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
            No cleaning operations executed yet. Apply data cleaning rules in the Cleaning Engine to track changes.
          </p>
        ) : (
          <div className="space-y-2">
            {changeLog.map((entry, idx) => (
              <div key={entry.id || idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-slate-800 uppercase tracking-wide mr-2">{entry.action_type}</span>
                    <span className="text-slate-600">{entry.description}</span>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400 font-mono shrink-0">
                  {entry.timestamp}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Table Preview with View Switcher */}
      <div>
        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
          Interactive Dataset Inspector
        </h4>
        <DataPreviewTable initialView="current" />
      </div>
    </div>
  );
};
