import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface SentimentDonutProps {
  data: Array<{
    sentiment: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  totalReviews?: number;
}

export const SentimentDonut: React.FC<SentimentDonutProps> = ({ data, totalReviews }) => {
  const COLOR_MAP: Record<string, string> = {
    Positive: '#10b981', // emerald-500
    Neutral: '#f59e0b',  // amber-500
    Negative: '#ef4444'  // red-500
  };

  const chartData = data.map((d) => ({
    ...d,
    fill: COLOR_MAP[d.sentiment] || d.color || '#3b82f6'
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg border border-slate-700 text-xs">
          <div className="font-semibold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
            {item.sentiment}
          </div>
          <div className="mt-1 text-slate-300">
            Reviews: <span className="font-bold text-white">{item.count.toLocaleString()}</span>
          </div>
          <div className="text-slate-300">
            Proportion: <span className="font-bold text-white">{item.percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={68}
            outerRadius={96}
            paddingAngle={4}
            dataKey="count"
            nameKey="sentiment"
            animationDuration={800}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => (
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 mx-1">
                {value} ({entry.payload.percentage}%)
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Label in Donut */}
      {totalReviews && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-8">
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {totalReviews.toLocaleString()}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Total Reviews
          </span>
        </div>
      )}
    </div>
  );
};
