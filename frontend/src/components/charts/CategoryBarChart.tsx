import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface CategoryBarChartProps {
  data: Array<{
    category: string;
    total: number;
    avg_rating: number;
    positive: number;
    neutral: number;
    negative: number;
    positive_pct: number;
    neutral_pct: number;
    negative_pct: number;
  }>;
  selectedCategory?: string;
}

export const CategoryBarChart: React.FC<CategoryBarChartProps> = ({ data, selectedCategory }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
          <div className="font-bold text-sm mb-1 text-white">{label}</div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-semibold text-white">{entry.value} reviews</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis
            dataKey="category"
            tick={({ x, y, payload }) => {
              const isSelected = selectedCategory && selectedCategory.toLowerCase() === payload.value.toLowerCase();
              return (
                <g transform={`translate(${x},${y})`}>
                  <text
                    x={0}
                    y={0}
                    dy={12}
                    textAnchor="end"
                    transform="rotate(-25)"
                    fontSize={isSelected ? 11.5 : 10}
                    fontWeight={isSelected ? 700 : 400}
                    fill={isSelected ? '#3b82f6' : '#64748b'}
                  >
                    {payload.value}
                  </text>
                </g>
              );
            }}
            interval={0}
            height={55}
          />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: 10 }}
            formatter={(value) => (
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {value}
              </span>
            )}
          />
          <Bar dataKey="positive" name="Positive" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
          <Bar dataKey="neutral" name="Neutral" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
          <Bar dataKey="negative" name="Negative" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
