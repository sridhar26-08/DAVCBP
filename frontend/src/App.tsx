import React, { useState, useEffect } from 'react';
import { Menu, Sparkles } from 'lucide-react';
import { Sidebar, PageId } from './components/Sidebar';
import { FilterBar } from './components/FilterBar';
import { ThemeToggle } from './components/ThemeToggle';
import { fetchFilterMeta, FilterMeta } from './lib/api';

// Pages
import { Overview } from './pages/Overview';
import { SentimentLab } from './pages/SentimentLab';
import { ModelComparison } from './pages/ModelComparison';
import { Trends } from './pages/Trends';
import { WordAnalysis } from './pages/WordAnalysis';
import { Reviews } from './pages/Reviews';
import { About } from './pages/About';

export function App() {
  const [activePage, setActivePage] = useState<PageId>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global filters
  const [filterMeta, setFilterMeta] = useState<FilterMeta | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sentimentSource, setSentimentSource] = useState<string>('lr_label');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchFilterMeta()
      .then((meta) => setFilterMeta(meta))
      .catch((err) => console.error('Error fetching filter meta:', err));
  }, []);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
  };

  const pageTitles: Record<PageId, { title: string; subtitle: string }> = {
    overview: {
      title: 'Executive Sentiment Dashboard',
      subtitle: `Real-time aggregated metrics across ${filterMeta?.total_reviews ? filterMeta.total_reviews.toLocaleString() : '3,000'} Flipkart customer reviews`,
    },
    'sentiment-lab': {
      title: 'Sentiment Comparison Lab',
      subtitle: 'Interactive side-by-side sandbox: VADER vs TextBlob vs ML Classifiers',
    },
    'model-comparison': {
      title: 'Machine Learning Model Benchmark',
      subtitle: 'Multinomial Naive Bayes vs Logistic Regression evaluation & confusion matrices',
    },
    trends: {
      title: 'Longitudinal Trends & Seasonality',
      subtitle: 'Monthly sentiment volume trajectories and statistical correlations',
    },
    'word-analysis': {
      title: 'N-Gram Lexicon & Word Clouds',
      subtitle: 'Interactive HTML5 canvas word cloud and top bigrams breakdown',
    },
    reviews: {
      title: 'Consumer Reviews Explorer',
      subtitle: 'Searchable, filterable tabular dataset with fake review heuristics',
    },
    about: {
      title: 'Academic Methodology & Documentation',
      subtitle: 'Comprehensive guide to algorithms, equations, and dataset attributes',
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex">
      {/* Persistent Left Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={(p) => setActivePage(p)}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen transition-all">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {pageTitles[activePage].title}
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {pageTitles[activePage].subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {/* Universal FilterBar (visible on dashboard pages) */}
          {activePage !== 'about' && (
            <FilterBar
              categories={filterMeta?.categories || []}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              sentimentSource={sentimentSource}
              onChangeSentimentSource={setSentimentSource}
              searchQuery={searchQuery}
              onChangeSearchQuery={setSearchQuery}
              onReset={handleResetFilters}
              filterMeta={filterMeta}
            />
          )}

          {/* Active Page View */}
          {activePage === 'overview' && (
            <Overview
              sentimentSource={sentimentSource}
              selectedCategory={selectedCategory}
              onResetCategory={handleResetFilters}
            />
          )}
          {activePage === 'sentiment-lab' && <SentimentLab />}
          {activePage === 'model-comparison' && <ModelComparison />}
          {activePage === 'trends' && <Trends selectedCategory={selectedCategory} />}
          {activePage === 'word-analysis' && <WordAnalysis selectedCategory={selectedCategory} />}
          {activePage === 'reviews' && (
            <Reviews
              categories={filterMeta?.categories || []}
              sentimentSource={sentimentSource}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onChangeSearchQuery={setSearchQuery}
            />
          )}
          {activePage === 'about' && <About />}
        </main>
      </div>
    </div>
  );
}

export default App;
