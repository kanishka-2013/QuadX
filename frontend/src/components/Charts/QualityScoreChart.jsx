import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export const QualityScoreChart = ({ scoreBefore = 0, scoreAfter = 0 }) => {
  const data = [
    { stage: 'Before Cleaning', score: scoreBefore, color: '#f59e0b' },
    { stage: 'After Cleaning', score: scoreAfter > 0 ? scoreAfter : scoreBefore, color: '#10b981' }
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
            cursor={{ fill: '#f8fafc' }}
          />
          <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={40}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
