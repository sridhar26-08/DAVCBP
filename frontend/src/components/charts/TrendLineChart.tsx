import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface TrendLineChartProps {
  data: Array<{
    month: string;
    total_reviews: number;
    avg_rating: number;
    avg_sentiment: number;
    positive: number;
    neutral: number;
    negative: number;
  }>;
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
          <div className="font-bold text-sm mb-1.5 text-white">Month: {label}</div>
          {payload.map((entry: any, index: number) => (
            <div key={`entry-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-semibold text-white">
                {entry.name === 'Avg Rating (★)' ? `${entry.value}★` : entry.value}
              </span>
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
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#64748b' }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11, fill: '#64748b' }}
            label={{ value: 'Review Count', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b', offset: 25 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[1, 5]}
            tick={{ fontSize: 11, fill: '#64748b' }}
            label={{ value: 'Avg Rating (1-5)', angle: 90, position: 'insideRight', fontSize: 10, fill: '#64748b', offset: 10 }}
          />
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
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="positive"
            name="Positive Reviews"
            fill="#10b981"
            fillOpacity={0.15}
            stroke="#10b981"
            strokeWidth={2}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="negative"
            name="Negative Reviews"
            fill="#ef4444"
            fillOpacity={0.15}
            stroke="#ef4444"
            strokeWidth={2}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="avg_rating"
            name="Avg Rating (★)"
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#2563eb' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
