import React, { useEffect, useState } from 'react';
import {
  FileText,
  Smile,
  Frown,
  Search,
  Sparkles,
  Layers,
} from 'lucide-react';
import { NgramsData, fetchNgrams } from '../lib/api';
import { WordCloudCanvas } from '../components/charts/WordCloudCanvas';

interface WordAnalysisProps {
  selectedCategory?: string;
}

export const WordAnalysis: React.FC<WordAnalysisProps> = ({ selectedCategory = 'all' }) => {
  const [data, setData] = useState<NgramsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'positive' | 'negative'>('positive');
  const [bigramSearch, setBigramSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchNgrams(40, selectedCategory)
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-20 skeleton rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 skeleton rounded-2xl" />
          <div className="h-96 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  const currentBigrams = activeTab === 'positive' ? data.positive_bigrams : data.negative_bigrams;
  const filteredBigrams = currentBigrams.filter((b) =>
    b.term.toLowerCase().includes(bigramSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            N-Gram Lexical & Word Cloud Analysis
          </h2>
        </div>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
          Uncovering dominant keywords and 2-word collocations driving customer satisfaction and complaints.
        </p>
      </div>

      {/* Switcher: Positive vs Negative Sentiment */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
          <button
            onClick={() => setActiveTab('positive')}
            className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all ${
              activeTab === 'positive'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smile className="w-4 h-4" />
            <span>Positive Lexicon ({data.positive_unigrams.length} terms)</span>
          </button>

          <button
            onClick={() => setActiveTab('negative')}
            className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all ${
              activeTab === 'negative'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Frown className="w-4 h-4" />
            <span>Negative Lexicon ({data.negative_unigrams.length} terms)</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline">
          Stopwords & e-commerce filler terms filtered out
        </span>
      </div>

      {/* Canvas Word Cloud & Bigram Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real Canvas Word Cloud */}
        <div className="glass-panel p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                {activeTab === 'positive' ? 'Positive Sentiment Word Cloud' : 'Negative Sentiment Word Cloud'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                HTML5 Canvas 2D engine with Archimedean spiral collision detection
              </p>
            </div>
            <span
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${
                activeTab === 'positive'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
              }`}
            >
              Hover on word for stats
            </span>
          </div>

          <WordCloudCanvas
            words={activeTab === 'positive' ? data.positive_unigrams : data.negative_unigrams}
            type={activeTab}
            height={340}
          />
        </div>

        {/* Bigrams Collocation Table */}
        <div className="glass-panel p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Top Bigrams (2-Word Keyphrases)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Most recurring multi-word phrases extracted via CountVectorizer
                </p>
              </div>
            </div>

            {/* Quick search */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={bigramSearch}
                onChange={(e) => setBigramSearch(e.target.value)}
                placeholder="Filter phrases (e.g. battery, delivery, sound)..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Table */}
            <div className="overflow-y-auto max-h-[300px] border border-slate-100 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold sticky top-0">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Bigram Phrase</th>
                    <th className="py-2.5 px-3 text-right">Frequency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredBigrams.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400 text-xs">
                        No bigrams match "{bigramSearch}"
                      </td>
                    </tr>
                  ) : (
                    filteredBigrams.map((b, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200 capitalize">
                          {b.term}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                          {b.count}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
