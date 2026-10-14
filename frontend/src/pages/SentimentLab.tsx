import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  HelpCircle,
  BarChart2,
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
import {
  LiveAnalysisResponse,
  analyzeLiveText,
  ModelComparisonData,
  fetchModelComparison,
} from '../lib/api';

export const SentimentLab: React.FC = () => {
  const [inputText, setInputText] = useState(
    "Delivery took 3 days longer than promised, but the battery life is unbelievable and camera quality blew me away!"
  );
  const [liveResult, setLiveResult] = useState<LiveAnalysisResponse | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [comparisonData, setComparisonData] = useState<ModelComparisonData | null>(null);
  const [loadingComparison, setLoadingComparison] = useState(true);

  // Quick preset review examples
  const presets = [
    {
      label: 'Subtle mixed review',
      text: 'Delivery took 3 days longer than promised, but the battery life is unbelievable and camera quality blew me away!',
    },
    {
      label: 'Sarcastic / Negation',
      text: 'Great job Flipkart delivering an empty box. Best waste of my hard earned money ever!',
    },
    {
      label: 'Paisa Vasool flagship',
      text: 'Outstanding purchase! Worth every single rupee, butter smooth 120Hz display and solid build quality.',
    },
    {
      label: 'Average / Neutral',
      text: 'Average product. Neither too great nor terrible. Gets daily basic browsing done, but charging is slow.',
    },
  ];

  // Run initial live prediction on mount
  useEffect(() => {
    handleAnalyze(inputText);
    fetchModelComparison()
      .then((res) => setComparisonData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoadingComparison(false));
  }, []);

  const handleAnalyze = async (textToTest: string) => {
    if (!textToTest.trim()) return;
    setAnalyzing(true);
    try {
      const res = await analyzeLiveText(textToTest);
      setLiveResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  const getMethodBadge = (label: string) => {
    switch (label?.toLowerCase()) {
      case 'positive':
        return 'bg-emerald-500 text-white';
      case 'neutral':
        return 'bg-amber-500 text-white';
      case 'negative':
        return 'bg-rose-500 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  // Prepare agreement chart data
  const agreementChartData = comparisonData
    ? [
        {
          name: 'VADER vs ML (Logistic)',
          agreement: comparisonData.agreement_matrix.vader_vs_logistic_regression,
          disagreement: 100 - comparisonData.agreement_matrix.vader_vs_logistic_regression,
        },
        {
          name: 'TextBlob vs ML (Logistic)',
          agreement: comparisonData.agreement_matrix.textblob_vs_logistic_regression,
          disagreement: 100 - comparisonData.agreement_matrix.textblob_vs_logistic_regression,
        },
        {
          name: 'VADER vs TextBlob',
          agreement: comparisonData.agreement_matrix.vader_vs_textblob,
          disagreement: 100 - comparisonData.agreement_matrix.vader_vs_textblob,
        },
        {
          name: 'Unanimous Consensus (All 3)',
          agreement: comparisonData.agreement_matrix.unanimous_agreement,
          disagreement: 100 - comparisonData.agreement_matrix.unanimous_agreement,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FlaskConical className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Sentiment Lab: Rule-Based vs Machine Learning Sandbox
          </h2>
        </div>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
          Compare how Lexicon heuristics (VADER, TextBlob) and Supervised ML Classifiers (TF-IDF + Logistic Regression, Naive Bayes) evaluate sentiment on identical texts.
        </p>
      </div>

      {/* Interactive Try-Your-Own-Review Box */}
      <div className="glass-panel p-5 border border-blue-200/80 dark:border-blue-900/60 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Live Multi-Model Inference Tester
          </span>
          <span className="text-[11px] text-slate-400">
            Real-time inference via FastAPI backend
          </span>
        </div>

        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={3}
            placeholder="Type or paste any product review here to test all algorithms simultaneously..."
            className="w-full p-3.5 text-xs md:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none"
          />
        </div>

        {/* Presets and Analyze Button */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Presets:</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(p.text);
                  handleAnalyze(p.text);
                }}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleAnalyze(inputText)}
            disabled={analyzing || !inputText.trim()}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{analyzing ? 'Evaluating...' : 'Analyze Sentiment Live'}</span>
          </button>
        </div>

        {/* Live Multi-Model Results Output */}
        {liveResult && (
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
            {/* Agreement Banner */}
            <div className="mb-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                <span>Consensus Result:</span>
                <span className="text-blue-600 dark:text-blue-400 font-extrabold">
                  {liveResult.agreement}
                </span>
              </div>
            </div>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {liveResult.results.map((res, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {res.method}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${getMethodBadge(
                          res.label
                        )}`}
                      >
                        {res.label}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      {res.method.includes('VADER') && (
                        <>
                          <div className="flex justify-between">
                            <span>Compound Score:</span>
                            <span className="font-mono font-bold">{res.score}</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>Pos: {res.details.pos}</span>
                            <span>Neu: {res.details.neu}</span>
                            <span>Neg: {res.details.neg}</span>
                          </div>
                        </>
                      )}

                      {res.method.includes('TextBlob') && (
                        <>
                          <div className="flex justify-between">
                            <span>Polarity (-1 to 1):</span>
                            <span className="font-mono font-bold">{res.details.polarity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Subjectivity (0 to 1):</span>
                            <span className="font-mono font-bold">{res.details.subjectivity}</span>
                          </div>
                        </>
                      )}

                      {(res.method.includes('Naive Bayes') || res.method.includes('Logistic')) && (
                        <>
                          <div className="flex justify-between">
                            <span>Confidence:</span>
                            <span className="font-mono font-bold">
                              {((res.score ?? 0) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>Pos: {((res.details?.Positive || 0) * 100).toFixed(0)}%</span>
                            <span>Neu: {((res.details?.Neutral || 0) * 100).toFixed(0)}%</span>
                            <span>Neg: {((res.details?.Negative || 0) * 100).toFixed(0)}%</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Model Agreement Analysis Across Entire Dataset */}
      <div className="glass-panel p-5 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              Method Agreement & Divergence Across 2,500 Reviews
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quantifying where Lexicon rules match ML statistical patterns and where they disagree on ambiguous text.
            </p>
          </div>
        </div>

        {loadingComparison ? (
          <div className="h-64 skeleton rounded-2xl" />
        ) : (
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={agreementChartData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  width={150}
                />
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
                  formatter={(val) => (
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {val === 'agreement' ? 'Agreement %' : 'Disagreement %'}
                    </span>
                  )}
                />
                <Bar dataKey="agreement" name="agreement" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="disagreement" name="disagreement" fill="#ef4444" stackId="a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-4 p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs text-slate-700 dark:text-slate-300">
          <span className="font-bold text-blue-700 dark:text-blue-400">DAV Insight: </span>
          Lexicons struggle with neutral ratings and contextual sarcasm (e.g. "great delivery of empty box"), whereas the TF-IDF Logistic Regression model excels at learning n-gram word co-occurrences.
        </div>
      </div>
    </div>
  );
};
