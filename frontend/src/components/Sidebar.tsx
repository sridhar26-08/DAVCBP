import React from 'react';
import {
  LayoutDashboard,
  FlaskConical,
  GitCompare,
  TrendingUp,
  FileText,
  TableProperties,
  Info,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

export type PageId =
  | 'overview'
  | 'sentiment-lab'
  | 'model-comparison'
  | 'trends'
  | 'word-analysis'
  | 'reviews'
  | 'about';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'overview' as PageId, label: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'sentiment-lab' as PageId, label: 'Sentiment Lab', icon: FlaskConical, badge: 'Live' },
    { id: 'model-comparison' as PageId, label: 'Model Comparison', icon: GitCompare, badge: null },
    { id: 'trends' as PageId, label: 'Trends & Seasonality', icon: TrendingUp, badge: null },
    { id: 'word-analysis' as PageId, label: 'Word Analysis', icon: FileText, badge: 'Canvas' },
    { id: 'reviews' as PageId, label: 'Reviews Explorer', icon: TableProperties, badge: null },
    { id: 'about' as PageId, label: 'About & Methodology', icon: Info, badge: null },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white/95 dark:bg-[#0d1321]/95 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800/80 p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo & Project Tag */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShoppingBag className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                <span>Flipkart</span>
                <span className="text-blue-600 dark:text-blue-400">Sentix</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                DAV College Project
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Academic Tag */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Project Details</span>
          </div>
          <p className="line-clamp-2">
            Data Analytics & Visualization • NLP & Sentiment Intelligence
          </p>
          <div className="mt-2 text-[10px] font-mono text-slate-400">
            FastAPI + Vite React + Recharts
          </div>
        </div>
      </aside>
    </>
  );
};
