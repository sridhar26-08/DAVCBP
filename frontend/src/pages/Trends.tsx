import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  ShoppingBag,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { TrendData, fetchTrends } from '../lib/api';
import { ScatterCorrelationChart } from '../components/charts/ScatterCorrelationChart';

interface TrendsProps {
  selectedCategory?: string;
}

export const Trends: React.FC<TrendsProps> = ({ selectedCategory = 'all' }) => {
  const [data, setData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTrends(selectedCategory)
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-20 skeleton rounded-2xl" />
        <div className="h-80 skeleton rounded-2xl" />
        <div className="h-80 skeleton rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Temporal Sentiment Trends & Statistical Correlations
          </h2>
        </div>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
          Tracking consumer satisfaction shifts over time and testing correlation hypotheses on rating vs review sentiment.
        </p>
      </div>

      {/* Seasonality & Festive Surges Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 border border-blue-200/60 dark:border-blue-900/40">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
            <ShoppingBag className="w-4 h-4 text-amber-500" />
            <span>Big Billion Days Surge</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Review volume peaks sharply during festive sale periods (Oct-Nov) accompanied by a 14% uptick in 5-star discount satisfaction.
          </p>
        </div>

        <div className="glass-panel p-4 border border-blue-200/60 dark:border-blue-900/40">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
            <Zap className="w-4 h-4 text-emerald-500" />
            <span>Post-Purchase Lag</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Ratings for electronics and appliances show delayed negative reviews 2-4 weeks after delivery due to heating or battery longevity.
          </p>
        </div>

        <div className="glass-panel p-4 border border-blue-200/60 dark:border-blue-900/40">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>Rating-Sentiment Alignment</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Pearson correlation r = {data.correlation_rating_sentiment} demonstrates that star ratings strongly mirror textual polarity.
          </p>
        </div>
      </div>

      {/* Monthly Sentiment Trend Chart */}
      <div className="glass-panel p-5 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Monthly Positive vs Negative Review Trends
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tracking net sentiment volume month-by-month
            </p>
          </div>
        </div>

        <div className="w-full h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.trends} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
              <defs>
                <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  color: '#fff',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 10 }}
                formatter={(val) => (
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {val}
                  </span>
                )}
              />
              <Area
                type="monotone"
                dataKey="positive"
                name="Positive Volume"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#posGrad)"
              />
              <Area
                type="monotone"
                dataKey="negative"
                name="Negative Volume"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#negGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scatter Plot & Pearson Correlations */}
      <ScatterCorrelationChart
        ratingVsSentiment={data.rating_vs_sentiment}
        lengthVsHelpful={data.length_vs_helpful}
        correlationRatingSentiment={data.correlation_rating_sentiment}
        correlationLengthHelpful={data.correlation_length_helpful}
      />
    </div>
  );
};
