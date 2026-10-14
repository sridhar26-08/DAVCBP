import React from 'react';
import { Star, AlertTriangle, ThumbsUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { ReviewItem } from '../lib/api';

interface DataTableProps {
  reviews: ReviewItem[];
  total: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  sortBy: string;
  sortOrder: string;
  onSortChange: (column: string) => void;
  isLoading?: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  reviews,
  total,
  currentPage,
  totalPages,
  onPageChange,
  sortBy,
  sortOrder,
  onSortChange,
  isLoading = false,
}) => {
  const getSentimentBadge = (label: string) => {
    switch (label?.toLowerCase()) {
      case 'positive':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            Positive
          </span>
        );
      case 'neutral':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            Neutral
          </span>
        );
      case 'negative':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            Negative
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {label || 'Unknown'}
          </span>
        );
    }
  };

  return (
    <div className="glass-panel overflow-hidden border border-slate-200 dark:border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs md:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
              <th className="py-3 px-3.5">Review Info</th>
              <th className="py-3 px-3.5 cursor-pointer hover:text-blue-600" onClick={() => onSortChange('rating')}>
                <div className="flex items-center gap-1">
                  Rating
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3.5">Product & Category</th>
              <th className="py-3 px-3.5">Review Content</th>
              <th className="py-3 px-3.5">Sentiment (ML / Lexicon)</th>
              <th className="py-3 px-3.5 cursor-pointer hover:text-blue-600" onClick={() => onSortChange('helpful_votes')}>
                <div className="flex items-center gap-1">
                  Helpful
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`}>
                  <td colSpan={6} className="py-4 px-3.5">
                    <div className="h-6 w-full skeleton rounded-lg" />
                  </td>
                </tr>
              ))
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <div className="max-w-xs mx-auto">
                    <p className="text-sm font-semibold">No reviews match your filters</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting search keywords or category filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              reviews.map((rev) => (
                <tr
                  key={rev.review_id}
                  className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                    rev.is_suspicious ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                  }`}
                >
                  {/* Review ID & Date */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <div className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                      {rev.review_id}
                    </div>
                    <div className="text-[11px] text-slate-400">{rev.date}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{rev.reviewer_name}</div>
                  </td>

                  {/* Rating */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1 font-bold">
                      <span className="text-slate-900 dark:text-white">{rev.rating}</span>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </div>
                  </td>

                  {/* Product & Category */}
                  <td className="py-3 px-3.5 max-w-[200px]">
                    <div className="font-semibold text-slate-800 dark:text-slate-100 truncate" title={rev.product_name}>
                      {rev.product_name}
                    </div>
                    <span className="inline-block mt-0.5 text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {rev.category}
                    </span>
                  </td>

                  {/* Review Content */}
                  <td className="py-3 px-3.5 max-w-sm">
                    {rev.review_title && (
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-100 mb-0.5">
                        {rev.review_title}
                      </div>
                    )}
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {rev.review_text}
                    </p>

                    {/* Suspicious Warning Flag */}
                    {rev.is_suspicious && rev.suspicious_reasons.length > 0 && (
                      <div className="mt-1 flex items-start gap-1 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                        <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                        <span>Flagged: {rev.suspicious_reasons.join(' • ')}</span>
                      </div>
                    )}
                  </td>

                  {/* Sentiment Comparison */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <div className="flex flex-col gap-1 items-start">
                      <div className="flex items-center gap-1.5">
                        {getSentimentBadge(rev.lr_label)}
                        <span className="text-[10px] font-mono text-slate-400">ML</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {getSentimentBadge(rev.vader_label)}
                        <span className="text-[10px] font-mono text-slate-400">VADER</span>
                      </div>
                    </div>
                  </td>

                  {/* Helpful votes */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <ThumbsUp className="w-3 h-3 text-slate-400" />
                      <span>{rev.helpful_votes}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="py-3 px-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
        <div>
          Showing page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of{' '}
          <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span> ({total.toLocaleString()} total reviews)
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="px-2 font-mono font-semibold text-slate-700 dark:text-slate-200">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
