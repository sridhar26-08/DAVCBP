import React, { useEffect, useRef } from 'react';
import { Search, Filter, RotateCcw, Sparkles } from 'lucide-react';
import { FilterMeta } from '../lib/api';

interface FilterBarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  sentimentSource: string;
  onChangeSentimentSource: (src: string) => void;
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  onReset: () => void;
  filterMeta?: FilterMeta | null;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  sentimentSource,
  onChangeSentimentSource,
  searchQuery,
  onChangeSearchQuery,
  onReset,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="glass-panel p-3.5 mb-6 flex flex-wrap items-center justify-between gap-3 border border-slate-200 dark:border-slate-800">
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
        {/* Search input with shortcut badge */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            id="global-search-input"
            value={searchQuery}
            onChange={(e) => onChangeSearchQuery(e.target.value)}
            placeholder="Search reviews, products, keywords..."
            className="w-full pl-9 pr-10 py-1.5 text-xs md:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-slate-200/70 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded border border-slate-300 dark:border-slate-600">
            /
          </kbd>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
          <select
            id="category-filter-select"
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
            className="text-xs md:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Model toggle switcher */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span className="hidden sm:inline">Engine:</span>
          </div>

          {[
            { id: 'lr_label', label: 'Logistic Reg (ML)' },
            { id: 'nb_label', label: 'Naive Bayes' },
            { id: 'vader_label', label: 'VADER (Lexicon)' },
            { id: 'textblob_label', label: 'TextBlob' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeSentimentSource(item.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                sentimentSource === item.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Reset button */}
        {(selectedCategory !== 'all' || searchQuery !== '') && (
          <button
            onClick={onReset}
            title="Reset filters"
            className="p-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
