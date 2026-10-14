import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface ScatterCorrelationChartProps {
  ratingVsSentiment: Array<{
    rating: number;
    sentiment_score: number;
    category: string;
    product_name: string;
  }>;
  lengthVsHelpful: Array<{
    review_length: number;
    helpful_votes: number;
    rating: number;
    category: string;
  }>;
  correlationRatingSentiment: number;
  correlationLengthHelpful: number;
}

export const ScatterCorrelationChart: React.FC<ScatterCorrelationChartProps> = ({
  ratingVsSentiment,
  lengthVsHelpful,
  correlationRatingSentiment,
  correlationLengthHelpful,
}) => {
  const [activeTab, setActiveTab] = useState<'rating_sentiment' | 'length_helpful'>('rating_sentiment');

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs max-w-xs">
          {activeTab === 'rating_sentiment' ? (
            <>
              <div className="font-bold text-white mb-1 truncate">{data.product_name}</div>
              <div className="text-slate-400 mb-1">Category: <span className="text-white">{data.category}</span></div>
              <div className="flex justify-between gap-4">
                <span>Rating: <strong className="text-amber-400">{data.rating}★</strong></span>
                <span>Sentiment Score: <strong className={data.sentiment_score >= 0 ? "text-emerald-400" : "text-rose-400"}>{data.sentiment_score}</strong></span>
              </div>
            </>
          ) : (
            <>
              <div className="font-bold text-white mb-1">Category: {data.category}</div>
              <div className="flex justify-between gap-4">
                <span>Length: <strong className="text-blue-400">{data.review_length} chars</strong></span>
                <span>Helpful Votes: <strong className="text-emerald-400">{data.helpful_votes}</strong></span>
              </div>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-5 border border-slate-200 dark:border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {activeTab === 'rating_sentiment'
              ? 'Rating vs Sentiment Score Correlation'
              : 'Review Length vs Helpful Votes Correlation'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {activeTab === 'rating_sentiment'
              ? `Pearson r = ${correlationRatingSentiment} (Strong Positive Relationship)`
              : `Pearson r = ${correlationLengthHelpful} (Weak Relationship)`}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('rating_sentiment')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'rating_sentiment'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Rating vs Sentiment
          </button>
          <button
            onClick={() => setActiveTab('length_helpful')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'length_helpful'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Length vs Helpful
          </button>
        </div>
      </div>

      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'rating_sentiment' ? (
            <ScatterChart margin={{ top: 10, right: 10, bottom: 15, left: -15 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis
                type="number"
                dataKey="rating"
                name="Rating"
                domain={[0.5, 5.5]}
                ticks={[1, 2, 3, 4, 5]}
                unit="★"
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                type="number"
                dataKey="sentiment_score"
                name="Sentiment Score"
                domain={[-1, 1]}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter
                name="Reviews"
                data={ratingVsSentiment}
                fill="#2563eb"
                fillOpacity={0.6}
              />
            </ScatterChart>
          ) : (
            <ScatterChart margin={{ top: 10, right: 10, bottom: 15, left: -15 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis
                type="number"
                dataKey="review_length"
                name="Length (chars)"
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                type="number"
                dataKey="helpful_votes"
                name="Helpful Votes"
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter
                name="Reviews"
                data={lengthVsHelpful}
                fill="#10b981"
                fillOpacity={0.6}
              />
            </ScatterChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
