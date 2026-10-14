import React, { useEffect, useState } from 'react';
import {
  TableProperties,
  Search,
  Filter,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { ReviewsResponse, fetchReviews, ReviewItem } from '../lib/api';
import { DataTable } from '../components/DataTable';
import { ExportButton } from '../components/ExportButton';

interface ReviewsProps {
  categories: string[];
  sentimentSource: string;
}

export const Reviews: React.FC<ReviewsProps> = ({ categories, sentimentSource }) => {
  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [category, setCategory] = useState<string>('all');
  const [sentiment, setSentiment] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [suspiciousOnly, setSuspiciousOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [page, setPage] = useState<number>(1);

  const loadData = () => {
    setLoading(true);
    fetchReviews({
      category: category !== 'all' ? category : undefined,
      sentiment: sentiment !== 'all' ? sentiment : undefined,
      sentiment_source: sentimentSource,
      search: search || undefined,
      suspicious_only: suspiciousOnly,
      sort_by: sortBy,
      sort_order: sortOrder,
      page,
      page_size: 15,
    })
      .then((res) => setReviewsData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [category, sentiment, sentimentSource, suspiciousOnly, sortBy, sortOrder, page]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      loadData();
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  const handleSortChange = (col: string) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const resetAllFilters = () => {
    setCategory('all');
    setSentiment('all');
    setSearch('');
    setSuspiciousOnly(false);
    setSortBy('date');
    setSortOrder('desc');
    setPage(1);
  };

  const exportFilterParams = {
    category: category !== 'all' ? category : undefined,
    sentiment: sentiment !== 'all' ? sentiment : undefined,
    sentiment_source: sentimentSource,
    search: search || undefined,
    suspicious_only: suspiciousOnly,
    sort_by: sortBy,
    sort_order: sortOrder,
  };

  return (
    <div className="space-y-6">
      {/* Header with Export Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TableProperties className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Raw Reviews & Anomaly Explorer
            </h2>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Search, filter, and inspect individual Flipkart consumer reviews with algorithm diagnostic flags.
          </p>
        </div>

        <ExportButton
          filterParams={exportFilterParams}
          label="Download Filtered CSV"
        />
      </div>

      {/* Filter Controls Panel */}
      <div className="glass-panel p-4 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search text input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search text, product, reviewer..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          {/* Category dropdown */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Sentiment filter */}
          <select
            value={sentiment}
            onChange={(e) => {
              setSentiment(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>

          {/* Suspicious only toggle button */}
          <button
            onClick={() => {
              setSuspiciousOnly(!suspiciousOnly);
              setPage(1);
            }}
            className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              suspiciousOnly
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${suspiciousOnly ? 'text-white' : 'text-amber-500'}`} />
            <span>Flagged Suspicious Only</span>
          </button>
        </div>

        {/* Reset filter row */}
        {(category !== 'all' || sentiment !== 'all' || search !== '' || suspiciousOnly) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500">Filters active</span>
            <button
              onClick={resetAllFilters}
              className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Reviews Table */}
      <DataTable
        reviews={reviewsData?.items || []}
        total={reviewsData?.total || 0}
        currentPage={page}
        totalPages={reviewsData?.total_pages || 1}
        onPageChange={(p) => setPage(p)}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        isLoading={loading}
      />
    </div>
  );
};
