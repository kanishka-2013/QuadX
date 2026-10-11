import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export const MissingValuesChart = ({ missingData = {} }) => {
  const data = Object.entries(missingData)
    .map(([col, count]) => ({ column: col, missing: count }))
    .filter(item => item.missing > 0);

  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-200 text-center p-4">
        <p className="text-xs font-semibold text-emerald-600">No Missing Values Detected!</p>
        <p className="text-[11px] text-slate-400 mt-1">All columns contain 100% complete data entries.</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="column" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-25} textAnchor="end" />
          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
            cursor={{ fill: '#f8fafc' }}
          />
          <Bar dataKey="missing" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#8b5cf6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
