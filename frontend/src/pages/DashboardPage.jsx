import React from 'react';
import { useDataset } from '../context/DatasetContext';
import { MetricCard } from '../components/MetricCard';
import { QualityScoreCard } from '../components/QualityScoreCard';
import { IssuesList } from '../components/IssuesList';
import { MissingValuesChart } from '../components/Charts/MissingValuesChart';
import { DuplicateChart } from '../components/Charts/DuplicateChart';
import { QualityScoreChart } from '../components/Charts/QualityScoreChart';
import {
  Table,
  Copy,
  AlertCircle,
  Wand2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

export const DashboardPage = () => {
  const { dataset, cleanedInfo, loadSampleDataset, setActiveTab, isLoading } = useDataset();

  if (!dataset) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
          <FileSpreadsheet className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Welcome to DataGenius AI Platform</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Upload messy Excel or CSV spreadsheets to automatically clean, normalize, deduplicate, and restructure datasets in seconds.
        </p>
        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            onClick={loadSampleDataset}
            disabled={isLoading}
            className="flex items-center space-x-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-md transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Load Sample Messy Dataset</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition cursor-pointer"
          >
            Upload Own File
          </button>
        </div>
      </div>
    );
  }

  const scoreBefore = cleanedInfo ? cleanedInfo.quality_score_before : dataset.quality_score;
  const scoreAfter = cleanedInfo ? cleanedInfo.quality_score_after : null;
  const cleanedCount = cleanedInfo ? cleanedInfo.cleaned_records_count : dataset.total_rows;

  const totalMissingCount = Object.values(dataset.missing_values_by_column).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Quality Score Hero Card */}
      <QualityScoreCard scoreBefore={scoreBefore} scoreAfter={scoreAfter} />

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Rows & Cols"
          value={`${dataset.total_rows} x ${dataset.total_columns}`}
          subtext={`Dataset: ${dataset.filename}`}
          icon={Table}
          color="blue"
        />

        <MetricCard
          title="Duplicate Records"
          value={dataset.duplicate_rows_count}
          subtext="Exact duplicate rows"
          icon={Copy}
          color={dataset.duplicate_rows_count > 0 ? "amber" : "emerald"}
          trend={dataset.duplicate_rows_count > 0 ? { text: `${dataset.duplicate_rows_count} rows`, label: 'need deduplication', positive: false } : { text: "0 duplicates", label: "clean dataset", positive: true }}
        />

        <MetricCard
          title="Missing Values"
          value={totalMissingCount}
          subtext={`Across ${Object.values(dataset.missing_values_by_column).filter(c => c > 0).length} columns`}
          icon={AlertCircle}
          color={totalMissingCount > 0 ? "amber" : "emerald"}
        />

        <MetricCard
          title="Cleaned Records"
          value={cleanedCount}
          subtext={cleanedInfo ? "Successfully processed" : "Ready for cleaning"}
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Visual Charts Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Missing Values by Column
            </h4>
            <span className="text-[11px] text-slate-400">Null / N/A cell distribution</span>
          </div>
          <MissingValuesChart missingData={dataset.missing_values_by_column} />
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Record Duplication
            </h4>
            <span className="text-[11px] text-slate-400">Unique vs Duplicate</span>
          </div>
          <DuplicateChart totalRows={dataset.total_rows} duplicateCount={dataset.duplicate_rows_count} />
        </div>
      </div>

      {/* Issue Detection Summary & Action Card */}
      <IssuesList />
    </div>
  );
};
