import React from 'react';

export const MetricCard = ({ title, value, subtext, icon: Icon, color = 'blue', trend = null }) => {
  const colorStyles = {
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    purple: 'bg-purple-50 border-purple-100 text-purple-600',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    amber: 'bg-amber-50 border-amber-100 text-amber-600',
    red: 'bg-red-50 border-red-100 text-red-600',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600'
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1.5">{value}</h3>
          {subtext && <p className="text-xs text-slate-500 mt-1 font-medium">{subtext}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${colorStyles[color] || colorStyles.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center text-xs">
          <span className={`font-bold ${trend.positive ? 'text-emerald-600' : 'text-amber-600'}`}>
            {trend.text}
          </span>
          <span className="text-slate-400 ml-1.5">{trend.label}</span>
        </div>
      )}
    </div>
  );
};
