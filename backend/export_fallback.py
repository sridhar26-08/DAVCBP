"""
Exports computed analytics, NLP metrics, and fallback data from SentimentAnalyzerPipeline
to frontend/src/lib/fallbackData.ts.
This ensures the frontend exhibits all new categories, charts, and metrics
both in backend-connected mode and in standalone/cloud fallback mode!
"""

import os
import sys
import json

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
from analysis import SentimentAnalyzerPipeline

def export():
    csv_path = os.path.join(os.path.dirname(__file__), "data", "flipkart_reviews.csv")
    print(f"Initializing SentimentAnalyzerPipeline with {csv_path}...")
    analyzer = SentimentAnalyzerPipeline(csv_path=csv_path)

    print("Extracting metadata and overviews...")
    filters = analyzer.get_filter_meta()
    overview_lr = analyzer.get_overview("lr_label")
    overview_nb = analyzer.get_overview("nb_label")
    overview_vader = analyzer.get_overview("vader_label")
    overview_tb = analyzer.get_overview("textblob_label")
    trend = analyzer.get_trend_data()
    ngrams = analyzer.get_ngrams(25)
    model_comparison = analyzer.get_model_comparison()
    suspicious = analyzer.get_suspicious()
    # Provide 120 reviews (10 per category) for rich client-side search & filter simulation
    reviews = analyzer.get_reviews(page=1, page_size=120)

    fallback_data = {
        "filters": filters,
        "overview_lr": overview_lr,
        "overview_nb": overview_nb,
        "overview_vader": overview_vader,
        "overview_tb": overview_tb,
        "trend": trend,
        "ngrams": ngrams,
        "model_comparison": model_comparison,
        "suspicious": suspicious,
        "reviews": reviews
    }

    target_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "src", "lib", "fallbackData.ts"))
    print(f"Writing precomputed fallback data to {target_path}...")

    ts_content = "// Precomputed fallback data generated from real Flipkart review dataset\n"
    ts_content += "export const FALLBACK_DATA = "
    ts_content += json.dumps(fallback_data, indent=2, ensure_ascii=False)
    ts_content += ";\n"

    with open(target_path, "w", encoding="utf-8") as f:
        f.write(ts_content)

    print("Successfully exported fallbackData.ts!")
    print(f"Categories ({len(filters['categories'])}):", filters["categories"])
    print(f"Total reviews: {filters['total_reviews']}")

if __name__ == "__main__":
    export()
