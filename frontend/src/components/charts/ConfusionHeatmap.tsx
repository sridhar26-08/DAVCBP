import React from 'react';
import { ModelMetrics } from '../../lib/api';

interface ConfusionHeatmapProps {
  modelName: string;
  metrics: ModelMetrics;
}

export const ConfusionHeatmap: React.FC<ConfusionHeatmapProps> = ({ modelName, metrics }) => {
  const { labels, confusion_matrix, accuracy, precision_macro, recall_macro, f1_macro } = metrics;
  
  // Calculate max value for color intensity scaling
  const maxVal = Math.max(...confusion_matrix.flat(), 1);

  const getCellColor = (val: number, isDiagonal: boolean) => {
    const intensity = val / maxVal;
    if (isDiagonal) {
      // True positives / correct predictions in green
      if (intensity > 0.6) return 'bg-emerald-600 text-white font-bold';
      if (intensity > 0.3) return 'bg-emerald-500 text-white font-semibold';
      if (intensity > 0.1) return 'bg-emerald-200 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 font-medium';
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300';
    } else {
      // Off-diagonal errors in subtle red/rose
      if (val === 0) return 'bg-slate-50 dark:bg-slate-800/40 text-slate-400';
      if (intensity > 0.3) return 'bg-rose-500 text-white font-bold';
      if (intensity > 0.1) return 'bg-rose-200 dark:bg-rose-900/60 text-rose-900 dark:text-rose-100 font-medium';
      return 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300';
    }
  };

  return (
    <div className="glass-panel p-5 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{modelName}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">3x3 Confusion Matrix (Predicted vs Actual)</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Acc: {(accuracy * 100).toFixed(1)}%
          </span>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            F1: {(f1_macro * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
            Predicted Class →
          </div>

          <table className="w-full text-center border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-xs font-semibold text-slate-400">Actual ↓</th>
                {labels.map((lbl) => (
                  <th key={lbl} className="p-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                    {lbl}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {labels.map((rowLabel, rIdx) => (
                <tr key={rowLabel}>
                  <td className="p-2 text-xs font-bold text-slate-700 dark:text-slate-200 text-left">
                    {rowLabel}
                  </td>
                  {labels.map((_, cIdx) => {
                    const count = confusion_matrix[rIdx]?.[cIdx] ?? 0;
                    const isDiagonal = rIdx === cIdx;
                    return (
                      <td key={cIdx} className="p-1.5">
                        <div
                          className={`py-3.5 px-2 rounded-xl text-xs md:text-sm transition-all duration-200 shadow-sm flex flex-col items-center justify-center ${getCellColor(
                            count,
                            isDiagonal
                          )}`}
                          title={`Actual: ${rowLabel}, Predicted: ${labels[cIdx]} (${count})`}
                        >
                          <span className="text-base font-extrabold">{count}</span>
                          <span className="text-[10px] opacity-80">
                            {isDiagonal ? 'Correct' : 'Misclassified'}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-4 gap-2 text-center text-xs">
        <div>
          <span className="text-slate-400 block text-[10px] uppercase">Accuracy</span>
          <span className="font-bold text-slate-800 dark:text-slate-100">{(accuracy * 100).toFixed(1)}%</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase">Precision</span>
          <span className="font-bold text-slate-800 dark:text-slate-100">{(precision_macro * 100).toFixed(1)}%</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase">Recall</span>
          <span className="font-bold text-slate-800 dark:text-slate-100">{(recall_macro * 100).toFixed(1)}%</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase">F1 Macro</span>
          <span className="font-bold text-slate-800 dark:text-slate-100">{(f1_macro * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};
