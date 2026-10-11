import React from 'react';
import { useDataset } from '../context/DatasetContext';
import { BrainCircuit, Sparkles, CheckCircle, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';

export const AIInsightsPanel = () => {
  const { aiInsights, dataset } = useDataset();

  if (!aiInsights || !dataset) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
        <p className="text-slate-500 text-sm">Please upload a dataset or load the sample dataset to view AI insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300">
            <BrainCircuit className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-white">AI Data Diagnosis & Strategic Recommendations</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-400/20 text-purple-300 border border-purple-400/30 rounded-full">
                {aiInsights.is_llm_powered ? 'LLM Enhanced' : 'Rule-Based Engine'}
              </span>
            </div>
            <p className="text-xs text-purple-200/80 mt-0.5">
              Automated analytical evaluation of data integrity, schema consistency, and business logic.
            </p>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-slate-200 bg-white/5 p-4 rounded-xl border border-white/10 mt-4">
          {aiInsights.summary}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recommended Operations & Justifications */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Recommended Cleaning Sequence</span>
          </h4>

          <div className="space-y-3">
            {aiInsights.recommended_operations.map((rec, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>{idx + 1}. {rec.operation}</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded font-semibold ${rec.impact === 'High' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {rec.impact} Impact
                  </span>
                </div>
                <p className="text-slate-600 leading-normal">{rec.why}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Columns Requiring Manual Review */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Columns Requiring Manual Review</span>
          </h4>

          {aiInsights.columns_requiring_manual_review.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-xs border border-emerald-200 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>All columns look clear of critical domain ambiguities!</span>
            </div>
          ) : (
            <div className="space-y-3">
              {aiInsights.columns_requiring_manual_review.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-300">{item.column}</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      {item.severity} Attention
                    </span>
                  </div>
                  <p className="text-slate-700">{item.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Executive Report Box */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
        <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <span>Executive Audit Report Summary</span>
        </h4>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
          {aiInsights.executive_report}
        </div>
      </div>
    </div>
  );
};
