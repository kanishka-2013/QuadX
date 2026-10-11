import React, { useState } from 'react';
import { ShieldCheck, Info, X, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';

export const QualityScoreCard = ({ scoreBefore, scoreAfter = null }) => {
  const [showModal, setShowModal] = useState(false);

  const currentScore = scoreAfter ? scoreAfter.total_score : scoreBefore.total_score;
  const isImproved = scoreAfter && scoreAfter.total_score > scoreBefore.total_score;
  const scoreDiff = scoreAfter ? (scoreAfter.total_score - scoreBefore.total_score).toFixed(1) : null;

  return (
    <div className="bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 rounded-2xl p-6 border border-slate-200/80 shadow-xs relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Data Quality Score</h3>
            <button
              onClick={() => setShowModal(true)}
              className="text-slate-400 hover:text-blue-600 transition cursor-pointer p-0.5"
              title="Click to view transparent scoring formula breakdown"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-baseline space-x-3 mt-3">
            <span className="text-4xl font-extrabold bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
              {currentScore}
            </span>
            <span className="text-sm font-semibold text-slate-400">/ 100</span>

            {isImproved && (
              <span className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-100 rounded-full border border-emerald-200">
                +{scoreDiff} pts improved
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 mt-2 max-w-md">
            Calculated across 4 key dimensions: Missing values (30%), Duplicates (25%), Formatting (25%), and Naming (20%).
          </p>
        </div>

        {/* Before vs After comparison pills */}
        {scoreAfter ? (
          <div className="flex items-center space-x-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-center px-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Before</span>
              <p className="text-lg font-bold text-slate-600">{scoreBefore.total_score}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <div className="text-center px-3">
              <span className="text-[10px] font-bold text-emerald-600 uppercase">After</span>
              <p className="text-lg font-extrabold text-emerald-600">{scoreAfter.total_score}</p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition cursor-pointer"
          >
            View Score Breakdown Formula
          </button>
        )}
      </div>

      {/* Scoring Formula Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Data Quality Score Formula</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-600">
              <p className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-blue-800">
                DataGenius AI scores dataset integrity on a transparent 0-100 scale using empirical matrix metrics:
              </p>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex justify-between font-bold text-slate-800 mb-1">
                    <span>1. Missing Value Density (30% Weight)</span>
                    <span className="text-blue-600">{scoreBefore.missing_value_score}/100</span>
                  </div>
                  <p className="text-slate-500">{scoreBefore.explanation.missing}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex justify-between font-bold text-slate-800 mb-1">
                    <span>2. Duplicate Record Density (25% Weight)</span>
                    <span className="text-blue-600">{scoreBefore.duplicate_score}/100</span>
                  </div>
                  <p className="text-slate-500">{scoreBefore.explanation.duplicates}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex justify-between font-bold text-slate-800 mb-1">
                    <span>3. Formatting & Data Consistency (25% Weight)</span>
                    <span className="text-blue-600">{scoreBefore.formatting_score}/100</span>
                  </div>
                  <p className="text-slate-500">{scoreBefore.explanation.formatting}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex justify-between font-bold text-slate-800 mb-1">
                    <span>4. Header Naming Standard (20% Weight)</span>
                    <span className="text-blue-600">{scoreBefore.naming_score}/100</span>
                  </div>
                  <p className="text-slate-500">{scoreBefore.explanation.naming}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 italic">
                Note: A score of 100 indicates absence of detectable structural anomalies, but domain validation should still be reviewed manually.
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
