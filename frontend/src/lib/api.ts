const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export interface OverviewData {
  total_reviews: number;
  avg_rating: number;
  positive_pct: number;
  neutral_pct: number;
  negative_pct: number;
  active_model_accuracy: number;
  rating_sentiment_correlation: number;
  length_helpful_correlation: number;
  auto_summary: string;
  sentiment_distribution: Array<{
    sentiment: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  category_sentiment: Array<{
    category: string;
    total: number;
    avg_rating: number;
    positive: number;
    neutral: number;
    negative: number;
    positive_pct: number;
    neutral_pct: number;
    negative_pct: number;
  }>;
  trend_preview: Array<{
    month: string;
    total_reviews: number;
    avg_rating: number;
    avg_sentiment: number;
    positive: number;
    neutral: number;
    negative: number;
  }>;
}

export interface TrendData {
  trends: Array<{
    month: string;
    total_reviews: number;
    avg_rating: number;
    avg_sentiment: number;
    positive: number;
    neutral: number;
    negative: number;
  }>;
  rating_vs_sentiment: Array<{
    rating: number;
    sentiment_score: number;
    category: string;
    product_name: string;
  }>;
  length_vs_helpful: Array<{
    review_length: number;
    helpful_votes: number;
    rating: number;
    category: string;
  }>;
  correlation_rating_sentiment: number;
  correlation_length_helpful: number;
}

export interface NgramItem {
  term: string;
  count: number;
}

export interface NgramsData {
  positive_unigrams: NgramItem[];
  positive_bigrams: NgramItem[];
  negative_unigrams: NgramItem[];
  negative_bigrams: NgramItem[];
}

export interface ModelMetrics {
  accuracy: number;
  precision_macro: number;
  recall_macro: number;
  f1_macro: number;
  labels: string[];
  confusion_matrix: number[][];
}

export interface ModelComparisonData {
  naive_bayes: ModelMetrics;
  logistic_regression: ModelMetrics;
  takeaway: string;
  agreement_matrix: {
    vader_vs_logistic_regression: number;
    textblob_vs_logistic_regression: number;
    vader_vs_textblob: number;
    unanimous_agreement: number;
  };
}

export interface SuspiciousReview {
  review_id: string;
  product_name: string;
  reviewer_name: string;
  rating: number;
  review_title: string;
  review_text: string;
  date: string;
  helpful_votes: number;
  reasons: string[];
}

export interface SuspiciousData {
  total_flagged: number;
  percentage: number;
  flagged_reviews: SuspiciousReview[];
}

export interface ReviewItem {
  review_id: string;
  date: string;
  category: string;
  product_name: string;
  reviewer_name: string;
  rating: number;
  review_title: string;
  review_text: string;
  sentiment: string;
  sentiment_score: number;
  vader_label: string;
  vader_score: number;
  textblob_label: string;
  textblob_polarity: number;
  nb_label: string;
  lr_label: string;
  helpful_votes: number;
  is_suspicious: boolean;
  suspicious_reasons: string[];
}

export interface ReviewsResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: ReviewItem[];
}

export interface LiveSentimentResult {
  method: string;
  label: string;
  score?: number;
  details: Record<string, any>;
}

export interface LiveAnalysisResponse {
  text: string;
  results: LiveSentimentResult[];
  agreement: string;
}

export interface FilterMeta {
  categories: string[];
  products_by_category: Record<string, string[]>;
  min_date: string;
  max_date: string;
  total_reviews: number;
}

export async function fetchOverview(sentimentSource = "lr_label"): Promise<OverviewData> {
  const res = await fetch(`${BASE_URL}/overview?sentiment_source=${sentimentSource}`);
  if (!res.ok) throw new Error(`Overview fetch failed: ${res.statusText}`);
  return res.json();
}

export async function fetchFilterMeta(): Promise<FilterMeta> {
  const res = await fetch(`${BASE_URL}/filters`);
  if (!res.ok) throw new Error(`Filters fetch failed: ${res.statusText}`);
  return res.json();
}

export async function fetchTrends(): Promise<TrendData> {
  const res = await fetch(`${BASE_URL}/trend`);
  if (!res.ok) throw new Error(`Trends fetch failed: ${res.statusText}`);
  return res.json();
}

export async function fetchNgrams(topN = 25): Promise<NgramsData> {
  const res = await fetch(`${BASE_URL}/ngrams?top_n=${topN}`);
  if (!res.ok) throw new Error(`N-grams fetch failed: ${res.statusText}`);
  return res.json();
}

export async function fetchModelComparison(): Promise<ModelComparisonData> {
  const res = await fetch(`${BASE_URL}/model-comparison`);
  if (!res.ok) throw new Error(`Model comparison fetch failed: ${res.statusText}`);
  return res.json();
}

export async function fetchSuspicious(): Promise<SuspiciousData> {
  const res = await fetch(`${BASE_URL}/suspicious`);
  if (!res.ok) throw new Error(`Suspicious fetch failed: ${res.statusText}`);
  return res.json();
}

export async function fetchReviews(params: {
  category?: string;
  product?: string;
  sentiment?: string;
  sentiment_source?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  suspicious_only?: boolean;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  page_size?: number;
}): Promise<ReviewsResponse> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "" && v !== "all") {
      query.append(k, String(v));
    }
  });
  const res = await fetch(`${BASE_URL}/reviews?${query.toString()}`);
  if (!res.ok) throw new Error(`Reviews fetch failed: ${res.statusText}`);
  return res.json();
}

export function getExportUrl(params: Record<string, any>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "" && v !== "all") {
      query.append(k, String(v));
    }
  });
  return `${BASE_URL}/export?${query.toString()}`;
}

export async function analyzeLiveText(text: string): Promise<LiveAnalysisResponse> {
  const res = await fetch(`${BASE_URL}/analyze-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`Live analysis failed: ${res.statusText}`);
  return res.json();
}
