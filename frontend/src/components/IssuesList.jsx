import React from 'react';
import { useDataset } from '../context/DatasetContext';
import { AlertTriangle, CheckCircle, Wand2, ArrowRight } from 'lucide-react';

export const IssuesList = () => {
  const { dataset, applyCleaning, setActiveTab, isLoading } = useDataset();

  if (!dataset || !dataset.issues || dataset.issues.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-xs">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Critical Data Issues Found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Your dataset looks exceptionally clean! All headers, rows, and cell formats pass standard quality checks.
        </p>
      </div>
    );
  }

  const severityBadge = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Detected Data Issues ({dataset.issues.length})</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated quality audit results with affected row counts and recommended actions.
          </p>
        </div>

        <button
          onClick={() => applyCleaning()}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
        >
          <Wand2 className="w-4 h-4" />
          <span>Auto-Clean All Issues</span>
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {dataset.issues.map((issue) => (
          <div key={issue.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full border ${severityBadge(issue.severity)}`}>
                  {issue.severity.toUpperCase()}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {issue.issue_type.replace('_', ' ').toUpperCase()}
                </span>
                {issue.column_name && (
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono border border-slate-200">
                    {issue.column_name}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600">{issue.description}</p>
              <div className="text-[11px] text-blue-700 font-medium flex items-center space-x-1 pt-1">
                <span>Recommendation:</span>
                <span>{issue.recommended_action}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <div className="text-right">
                <span className="text-sm font-bold text-slate-900">{issue.affected_count}</span>
                <span className="text-xs text-slate-400 block">affected</span>
              </div>

              <button
                onClick={() => setActiveTab('cleaning')}
                className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition flex items-center space-x-1 cursor-pointer"
              >
                <span>Fix in Engine</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
