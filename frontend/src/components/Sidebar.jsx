import React from 'react';
import { useDataset } from '../context/DatasetContext';
import {
  LayoutDashboard,
  Upload,
  AlertTriangle,
  Wand2,
  SlidersHorizontal,
  Table,
  BrainCircuit,
  Download,
  FileCheck2
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab, dataset } = useDataset();

  const issueCount = dataset ? dataset.issues.length : 0;
  const duplicateCount = dataset ? dataset.duplicate_rows_count : 0;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, badge: null },
    { id: 'upload', label: 'File Upload', icon: Upload, badge: null },
    { id: 'analysis', label: 'Issue Detection Audit', icon: AlertTriangle, badge: issueCount > 0 ? `${issueCount}` : null, badgeColor: 'bg-amber-100 text-amber-700' },
    { id: 'cleaning', label: 'Data Cleaning Engine', icon: Wand2, badge: duplicateCount > 0 ? `${duplicateCount} dupes` : null, badgeColor: 'bg-blue-100 text-blue-700' },
    { id: 'restructure', label: 'Data Restructuring', icon: SlidersHorizontal, badge: null },
    { id: 'comparison', label: 'Before & After Preview', icon: Table, badge: null },
    { id: 'insights', label: 'AI Quality Insights', icon: BrainCircuit, badge: 'AI', badgeColor: 'bg-purple-100 text-purple-700 font-bold' },
    { id: 'export', label: 'Download & Export', icon: Download, badge: null }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 shadow-xs">
      <div className="space-y-6">
        <div className="px-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Navigation</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Dataset Health Status Badge at bottom of sidebar */}
      {dataset && (
        <div className="mt-8 p-3.5 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quality Score</span>
            <span className={`text-xs font-extrabold ${dataset.quality_score.total_score >= 80 ? 'text-emerald-600' : 'text-blue-600'}`}>
              {dataset.quality_score.total_score}/100
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                dataset.quality_score.total_score >= 80
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : dataset.quality_score.total_score >= 50
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  : 'bg-gradient-to-r from-amber-500 to-red-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, dataset.quality_score.total_score))}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
            <span>Issues: {dataset.issues.length} detected</span>
            <span className="font-semibold text-blue-600 cursor-pointer hover:underline" onClick={() => setActiveTab('cleaning')}>Clean now</span>
          </p>
        </div>
      )}
    </aside>
  );
};
