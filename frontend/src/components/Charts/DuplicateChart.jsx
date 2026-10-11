import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export const DuplicateChart = ({ totalRows = 0, duplicateCount = 0 }) => {
  const uniqueCount = Math.max(0, totalRows - duplicateCount);

  const data = [
    { name: 'Unique Records', value: uniqueCount, color: '#3b82f6' },
    { name: 'Duplicate Rows', value: duplicateCount, color: '#f59e0b' }
  ];

  return (
    <div className="h-64 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs text-slate-600 font-semibold">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
