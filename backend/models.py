from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class OverviewStats(BaseModel):
    total_reviews: int
    avg_rating: float
    positive_pct: float
    neutral_pct: float
    negative_pct: float
    active_model_accuracy: float
    rating_sentiment_correlation: float
    length_helpful_correlation: float
    auto_summary: str
    sentiment_distribution: List[Dict[str, Any]]
    category_sentiment: List[Dict[str, Any]]
    trend_preview: List[Dict[str, Any]]

class CategorySentiment(BaseModel):
    category: str
    total: int
    avg_rating: float
    positive: int
    neutral: int
    negative: int
    positive_pct: float
    neutral_pct: float
    negative_pct: float

class TrendItem(BaseModel):
    month: str
    total_reviews: int
    avg_rating: float
    avg_sentiment: float
    positive: int
    neutral: int
    negative: int

class TrendResponse(BaseModel):
    trends: List[TrendItem]
    rating_vs_sentiment: List[Dict[str, Any]]
    length_vs_helpful: List[Dict[str, Any]]
    correlation_rating_sentiment: float
    correlation_length_helpful: float

class NgramItem(BaseModel):
    term: str
    count: int

class NgramsResponse(BaseModel):
    positive_unigrams: List[NgramItem]
    positive_bigrams: List[NgramItem]
    negative_unigrams: List[NgramItem]
    negative_bigrams: List[NgramItem]

class ModelMetrics(BaseModel):
    accuracy: float
    precision_macro: float
    recall_macro: float
    f1_macro: float
    labels: List[str]
    confusion_matrix: List[List[int]]

class ModelComparisonResponse(BaseModel):
    naive_bayes: ModelMetrics
    logistic_regression: ModelMetrics
    takeaway: str
    agreement_matrix: Dict[str, Any]

class SuspiciousReview(BaseModel):
    review_id: str
    product_name: str
    reviewer_name: str
    rating: int
    review_title: str
    review_text: str
    date: str
    helpful_votes: int
    reasons: List[str]

class SuspiciousResponse(BaseModel):
    total_flagged: int
    percentage: float
    flagged_reviews: List[SuspiciousReview]

class ReviewItem(BaseModel):
    review_id: str
    date: str
    category: str
    product_name: str
    reviewer_name: str
    rating: int
    review_title: str
    review_text: str
    sentiment: str
    sentiment_score: float
    vader_label: str
    vader_score: float
    textblob_label: str
    textblob_polarity: float
    nb_label: str
    lr_label: str
    helpful_votes: int
    is_suspicious: bool
    suspicious_reasons: List[str]

class ReviewsResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    items: List[ReviewItem]

class AnalyzeTextRequest(BaseModel):
    text: str

class LiveSentimentResult(BaseModel):
    method: str
    label: str
    score: Optional[float] = None
    details: Dict[str, Any]

class AnalyzeTextResponse(BaseModel):
    text: str
    results: List[LiveSentimentResult]
    agreement: str
