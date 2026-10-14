import io
import os
import csv
from typing import Optional
from fastapi import FastAPI, Query, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from models import (
    OverviewStats,
    TrendResponse,
    NgramsResponse,
    ModelComparisonResponse,
    SuspiciousResponse,
    ReviewsResponse,
    AnalyzeTextRequest,
    AnalyzeTextResponse
)
from analysis import SentimentAnalyzerPipeline

app = FastAPI(
    title="Flipkart Sentiment Analytics API",
    description="Data Analytics & Visualization (DAV) college project API for Flipkart review sentiment analysis.",
    version="1.0.0"
)

# Enable CORS for Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "flipkart_reviews.csv")
analyzer: SentimentAnalyzerPipeline = None

@app.on_event("startup")
def startup_event():
    global analyzer
    print(f"Starting Flipkart Sentiment Analysis Backend... Looking for data at {DATA_PATH}")
    analyzer = SentimentAnalyzerPipeline(csv_path=DATA_PATH)
    print("Startup complete. Data cached and ML models trained.")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "total_records": len(analyzer.df) if analyzer else 0
    }

@app.get("/api/filters")
def get_filters():
    """Returns available categories, products per category, and date boundaries."""
    if not analyzer:
        raise HTTPException(status_code=503, detail="Analyzer not initialized")
    return analyzer.get_filter_meta()

@app.get("/api/overview")
def get_overview(
    sentiment_source: str = Query("lr_label", description="Sentiment model: lr_label, nb_label, vader_label, textblob_label, ground_truth_label"),
    category: Optional[str] = Query(None, description="Department category filter")
):
    """Returns aggregate KPIs, sentiment donut distribution, category breakdown, and trend preview."""
    if not analyzer:
        raise HTTPException(status_code=503, detail="Analyzer not initialized")
    return analyzer.get_overview(sentiment_source=sentiment_source, category=category)

@app.get("/api/sentiment-by-category")
def get_sentiment_by_category(
    sentiment_source: str = Query("lr_label")
):
    """Returns category-level sentiment breakdown and average ratings."""
    if not analyzer:
        raise HTTPException(status_code=503, detail="Analyzer not initialized")
    return analyzer.get_category_sentiment(sentiment_source=sentiment_source)

@app.get("/api/trend", response_model=TrendResponse)
def get_trend(category: Optional[str] = Query(None, description="Department category filter")):
    """Returns monthly sentiment trends and correlation scatter data."""
    if not analyzer:
        raise HTTPException(status_code=503, detail="Analyzer not initialized")
    return analyzer.get_trend_data(category=category)

@app.get("/api/ngrams", response_model=NgramsResponse)
def get_ngrams(
    top_n: int = Query(25, ge=5, le=50),
    category: Optional[str] = Query(None, description="Department category filter")
):
    """Returns top unigrams and bigrams for positive and negative reviews."""
    if not analyzer:
        raise HTTPException(status_code=503, detail="Analyzer not initialized")
    return analyzer.get_ngrams(top_n=top_n, category=category)

@app.get("/api/model-comparison", response_model=ModelComparisonResponse)
def get_model_comparison():
    """Returns side-by-side evaluation metrics (accuracy, precision, recall, F1) and 3x3 confusion matrices."""
    if not analyzer:
        raise HTTPException(status_code=503, detail="Analyzer not initialized")
    return analyzer.get_model_comparison()

@app.get("/api/suspicious", response_model=SuspiciousResponse)
def get_suspicious():
    """Returns heuristic-flagged suspicious/fake reviews with diagnostic reasons."""
    if not analyzer:
        raise HTTPException(status_code=503, detail="Analyzer not initialized")
    return analyzer.get_suspicious()

@app.get("/api/reviews", response_model=ReviewsResponse)
def get_reviews(
    category: Optional[str] = Query(None),
    product: Optional[str] = Query(None),
    sentiment: Optional[str] = Query(None),
    sentiment_source: str = Query("lr_label"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    suspicious_only: bool = Query(False),
    sort_by: str = Query("date"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100)
):
    """Returns paginated, searchable, filterable, and sortable reviews."""
    if not analyzer:
        raise HTTPException(status_code=503, detail="Analyzer not initialized")
    return analyzer.get_reviews(
        category=category,
        product=product,
        sentiment=sentiment,
        sentiment_source=sentiment_source,
        start_date=start_date,
        end_date=end_date,
        search=search,
        suspicious_only=suspicious_only,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size
    )

@app.get("/api/export")
def export_reviews(
    category: Optional[str] = Query(None),
    product: Optional[str] = Query(None),
    sentiment: Optional[str] = Query(None),
    sentiment_source: str = Query("lr_label"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    suspicious_only: bool = Query(False),
    sort_by: str = Query("date"),
    sort_order: str = Query("desc")
):
    """Exports all filtered reviews as a downloadable CSV."""
    if not analyzer:
        raise HTTPException(status_code=503, detail="Analyzer not initialized")

    res = analyzer.get_reviews(
        category=category,
        product=product,
        sentiment=sentiment,
        sentiment_source=sentiment_source,
        start_date=start_date,
        end_date=end_date,
        search=search,
        suspicious_only=suspicious_only,
        sort_by=sort_by,
        sort_order=sort_order,
        page=1,
        page_size=50000 # Return all matches
    )

    items = res["items"]
    output = io.StringIO()
    if items:
        fieldnames = list(items[0].keys())
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        for item in items:
            writer.writerow(item)
    else:
        output.write("No reviews match the selected filter criteria.\n")

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=flipkart_reviews_export.csv"}
    )

@app.post("/api/analyze-text", response_model=AnalyzeTextResponse)
def analyze_text(request: AnalyzeTextRequest):
    """Live inference: runs VADER, TextBlob, Naive Bayes, and Logistic Regression on any input text."""
    if not analyzer:
        raise HTTPException(status_code=503, detail="Analyzer not initialized")
    return analyzer.analyze_live_text(request.text)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
