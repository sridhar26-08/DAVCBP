import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { getExportUrl } from '../lib/api';

interface ExportButtonProps {
  filterParams: Record<string, any>;
  label?: string;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  filterParams,
  label = "Export CSV",
  className = ""
}) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    const url = getExportUrl(filterParams);
    
    // Create hidden anchor tag to trigger native download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'flipkart_reviews_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloading(false);
    }, 1200);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      id="export-csv-btn"
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 disabled:opacity-50 ${className}`}
    >
      {downloading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
      <span>{downloading ? "Exporting..." : label}</span>
    </button>
  );
};
