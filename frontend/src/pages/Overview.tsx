import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  Star,
  Smile,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Printer,
  AlertCircle,
} from 'lucide-react';
import { OverviewData, fetchOverview } from '../lib/api';
import { KpiCard } from '../components/KpiCard';
import { SentimentDonut } from '../components/charts/SentimentDonut';
import { CategoryBarChart } from '../components/charts/CategoryBarChart';
import { TrendLineChart } from '../components/charts/TrendLineChart';

interface OverviewProps {
  sentimentSource: string;
}

export const Overview: React.FC<OverviewProps> = ({ sentimentSource }) => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchOverview(sentimentSource)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load overview data');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [sentimentSource]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 w-full skeleton rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 skeleton rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 skeleton rounded-2xl" />
          <div className="lg:col-span-2 h-80 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center glass-panel border border-rose-200 dark:border-rose-900/40">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800 dark:text-slate-100">Unable to load Overview</h3>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with Natural-Language Auto-Summary & Export PDF */}
      <div className="glass-panel p-5 border border-blue-200/60 dark:border-blue-900/40 bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-white dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5 shadow-sm">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Executive Sentiment Insight
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold">
                AI Auto-Generated
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {data.auto_summary}
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          id="print-report-btn"
          className="shrink-0 flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 shadow-sm transition-all"
        >
          <Printer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Export Report PDF</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Reviews Analyzed"
          value={data.total_reviews.toLocaleString()}
          subtitle="Processed across 6 categories"
          badge="100% Ingested"
          badgeColor="blue"
          icon={<MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          delay={0.05}
        />

        <KpiCard
          title="Average Product Rating"
          value={`${data.avg_rating}★`}
          subtitle="Overall consumer score"
          badge={data.avg_rating >= 4 ? 'High' : 'Moderate'}
          badgeColor="amber"
          icon={<Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
          delay={0.1}
        />

        <KpiCard
          title="Positive Sentiment Share"
          value={`${data.positive_pct}%`}
          subtitle={`${data.neutral_pct}% Neutral • ${data.negative_pct}% Negative`}
          badge="Predominant"
          badgeColor="green"
          icon={<Smile className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          delay={0.15}
        />

        <KpiCard
          title="Active Model Accuracy"
          value={`${data.active_model_accuracy}%`}
          subtitle={`Pearson r: ${data.rating_sentiment_correlation}`}
          badge="Logistic Reg"
          badgeColor="blue"
          icon={<ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          delay={0.2}
        />
      </div>

      {/* Charts Row: Sentiment Donut & Category Stacked Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Donut */}
        <div className="glass-panel p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Sentiment Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Overall ratio of Positive, Neutral & Negative reviews
              </p>
            </div>
          </div>
          <SentimentDonut data={data.sentiment_distribution} totalReviews={data.total_reviews} />
        </div>

        {/* Category Sentiment Stacked Bar */}
        <div className="lg:col-span-2 glass-panel p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Sentiment Breakdown by Category
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparison of positive, neutral and critical sentiment volumes across departments
              </p>
            </div>
          </div>
          <CategoryBarChart data={data.category_sentiment} />
        </div>
      </div>

      {/* Trend Preview Line Chart */}
      <div className="glass-panel p-5 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Review Volume & Sentiment Trajectory
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monthly trend tracking volume surges and rating stability
              </p>
            </div>
          </div>
        </div>
        <TrendLineChart data={data.trend_preview} />
      </div>
    </div>
  );
};
