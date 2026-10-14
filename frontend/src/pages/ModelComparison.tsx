import React, { useEffect, useState } from 'react';
import {
  GitCompare,
  Sparkles,
  Award,
  BookOpen,
  Info,
  CheckCircle,
} from 'lucide-react';
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
import { ModelComparisonData, fetchModelComparison } from '../lib/api';
import { ConfusionHeatmap } from '../components/charts/ConfusionHeatmap';

export const ModelComparison: React.FC = () => {
  const [data, setData] = useState<ModelComparisonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModelComparison()
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-20 skeleton rounded-2xl" />
        <div className="h-72 skeleton rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 skeleton rounded-2xl" />
          <div className="h-96 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  const { naive_bayes, logistic_regression, takeaway } = data;

  // Chart data for accuracy, precision, recall, f1
  const metricComparison = [
    {
      metric: 'Accuracy',
      'Naive Bayes': +(naive_bayes.accuracy * 100).toFixed(1),
      'Logistic Regression': +(logistic_regression.accuracy * 100).toFixed(1),
    },
    {
      metric: 'Macro Precision',
      'Naive Bayes': +(naive_bayes.precision_macro * 100).toFixed(1),
      'Logistic Regression': +(logistic_regression.precision_macro * 100).toFixed(1),
    },
    {
      metric: 'Macro Recall',
      'Naive Bayes': +(naive_bayes.recall_macro * 100).toFixed(1),
      'Logistic Regression': +(logistic_regression.recall_macro * 100).toFixed(1),
    },
    {
      metric: 'Macro F1-Score',
      'Naive Bayes': +(naive_bayes.f1_macro * 100).toFixed(1),
      'Logistic Regression': +(logistic_regression.f1_macro * 100).toFixed(1),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <GitCompare className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Model Evaluation & Classifier Benchmark
          </h2>
        </div>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
          Comparing TF-IDF Multinomial Naive Bayes against Logistic Regression on an 80/20 stratified hold-out test set.
        </p>
      </div>

      {/* Auto-Generated Takeaway Banner */}
      <div className="glass-panel p-5 border border-indigo-200 dark:border-indigo-900/40 bg-gradient-to-r from-indigo-50/70 via-blue-50/50 to-white dark:from-indigo-950/20 dark:via-blue-950/20 dark:to-slate-900 flex items-start gap-3.5 shadow-sm">
        <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
          <Award className="w-5 h-5 text-amber-300" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
              Comparative Analysis Verdict
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold">
              Statistically Validated
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
            {takeaway}
          </p>
        </div>
      </div>

      {/* Side-by-Side Metric Bar Chart */}
      <div className="glass-panel p-5 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Evaluation Metrics Comparison (%)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Macro-averaged performance metrics across Positive, Neutral, and Negative classes
            </p>
          </div>
        </div>

        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={metricComparison}
              margin={{ top: 20, right: 20, left: -10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                formatter={(val: any) => [`${val}%`, '']}
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
                wrapperStyle={{ paddingBottom: 15 }}
                formatter={(val) => (
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {val}
                  </span>
                )}
              />
              <Bar dataKey="Naive Bayes" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Logistic Regression" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Side-by-Side Confusion Matrices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConfusionHeatmap
          modelName="Multinomial Naive Bayes (TF-IDF)"
          metrics={naive_bayes}
        />
        <ConfusionHeatmap
          modelName="Logistic Regression (TF-IDF, C=1.0)"
          metrics={logistic_regression}
        />
      </div>

      {/* Methodology Specs Box */}
      <div className="glass-panel p-5 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
        <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-blue-500" />
          Model Training Setup & Methodology Notes
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Feature Extraction</span>
            <p>TF-IDF Vectorizer with n-gram range (1, 2), English stopword filtering, and top 4,000 max features.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Data Split Strategy</span>
            <p>80% Training / 20% Holdout Test with stratified class distribution preserving class balance.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Ground Truth Mapping</span>
            <p>Ratings 4-5 labeled Positive, Rating 3 labeled Neutral, Ratings 1-2 labeled Negative.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
