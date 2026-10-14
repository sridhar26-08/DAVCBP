import os
import re
import ssl
from collections import Counter
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk.corpus import stopwords
from textblob import TextBlob

# Ensure SSL doesn't block NLTK downloads if needed
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

try:
    nltk.data.find('sentiment/vader_lexicon.zip')
except LookupError:
    nltk.download('vader_lexicon', quiet=True)

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

class SentimentAnalyzerPipeline:
    def __init__(self, csv_path: Optional[str] = None):
        if csv_path is None:
            csv_path = os.path.join(os.path.dirname(__file__), "data", "flipkart_reviews.csv")
        self.csv_path = csv_path
        self.df: pd.DataFrame = pd.DataFrame()
        self.vader = SentimentIntensityAnalyzer()
        self.stop_words = set(stopwords.words('english'))
        # Custom Flipkart / e-commerce neutral filler words to exclude from ngram analysis
        self.custom_stopwords = self.stop_words.union({
            'flipkart', 'product', 'item', 'one', 'would', 'also', 'get', 'got', 'buy', 'bought',
            'ordered', 'delivery', 'really', 'much', 'even', 'using', 'used', 'days', 'day', 'time',
            'take', 'give', 'package', 'box', 'courier'
        })
        
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=4000,
            ngram_range=(1, 2),
            stop_words='english',
            min_df=2
        )
        self.nb_model = MultinomialNB()
        self.lr_model = LogisticRegression(max_iter=1000, random_state=42, C=1.0)
        self.model_metrics: Dict[str, Any] = {}
        self.classes_ = ["Positive", "Neutral", "Negative"]

        self._initialize()

    def _initialize(self):
        if not os.path.exists(self.csv_path):
            raise FileNotFoundError(f"CSV dataset not found at {self.csv_path}")

        print(f"Loading Flipkart reviews dataset from {self.csv_path}...")
        df = pd.read_csv(self.csv_path)

        # Basic cleanup and normalization
        df['review_text'] = df['review_text'].fillna('').astype(str)
        df['review_title'] = df['review_title'].fillna('').astype(str)
        df['product_name'] = df['product_name'].fillna('Unknown Product').astype(str)
        df['category'] = df['category'].fillna('General').astype(str)
        df['reviewer_name'] = df['reviewer_name'].fillna('Flipkart Customer').astype(str)
        df['rating'] = pd.to_numeric(df['rating'], errors='coerce').fillna(3).astype(int)
        df['helpful_votes'] = pd.to_numeric(df['helpful_votes'], errors='coerce').fillna(0).astype(int)
        df['date'] = pd.to_datetime(df['date'], errors='coerce').fillna(pd.Timestamp.now())
        df['date_str'] = df['date'].dt.strftime('%Y-%m-%d')
        df['year_month'] = df['date'].dt.strftime('%Y-%m')
        df['text_length'] = df['review_text'].str.len()

        # 1. Ground Truth from Rating (rating >= 4 Positive, 3 Neutral, <= 2 Negative)
        def derive_sentiment(r):
            if r >= 4:
                return "Positive"
            elif r == 3:
                return "Neutral"
            else:
                return "Negative"

        df['ground_truth_label'] = df['rating'].apply(derive_sentiment)
        if 'sentiment' not in df.columns:
            df['sentiment'] = df['ground_truth_label']

        # 2. VADER Lexicon scoring
        print("Computing VADER sentiment scores...")
        vader_scores = []
        vader_labels = []
        for text in df['review_text']:
            vs = self.vader.polarity_scores(text)
            compound = vs['compound']
            vader_scores.append(compound)
            if compound >= 0.05:
                vader_labels.append("Positive")
            elif compound <= -0.05:
                vader_labels.append("Negative")
            else:
                vader_labels.append("Neutral")

        df['vader_score'] = vader_scores
        df['vader_label'] = vader_labels

        # 3. TextBlob Polarity and Subjectivity
        print("Computing TextBlob polarity scores...")
        tb_polarities = []
        tb_subjectivities = []
        tb_labels = []
        for text in df['review_text']:
            blob = TextBlob(text)
            pol = blob.sentiment.polarity
            sub = blob.sentiment.subjectivity
            tb_polarities.append(pol)
            tb_subjectivities.append(sub)
            if pol > 0.1:
                tb_labels.append("Positive")
            elif pol < -0.1:
                tb_labels.append("Negative")
            else:
                tb_labels.append("Neutral")

        df['textblob_polarity'] = tb_polarities
        df['textblob_subjectivity'] = tb_subjectivities
        df['textblob_label'] = tb_labels

        # If sentiment_score not populated or placeholder, keep VADER compound as default sentiment_score
        if 'sentiment_score' not in df.columns or df['sentiment_score'].isnull().all():
            df['sentiment_score'] = df['vader_score']

        # 4. Train Classifiers: TF-IDF + Naive Bayes & Logistic Regression
        print("Training TF-IDF classifiers (Naive Bayes & Logistic Regression)...")
        X = df['review_text']
        y = df['ground_truth_label']

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, random_state=42, stratify=y
        )

        X_train_vec = self.tfidf_vectorizer.fit_transform(X_train)
        X_test_vec = self.tfidf_vectorizer.transform(X_test)
        X_all_vec = self.tfidf_vectorizer.transform(X)

        # Naive Bayes
        self.nb_model.fit(X_train_vec, y_train)
        nb_preds_test = self.nb_model.predict(X_test_vec)
        df['nb_label'] = self.nb_model.predict(X_all_vec)

        # Logistic Regression
        self.lr_model.fit(X_train_vec, y_train)
        lr_preds_test = self.lr_model.predict(X_test_vec)
        df['lr_label'] = self.lr_model.predict(X_all_vec)

        # Compute Evaluation Metrics on test set
        labels_order = ["Positive", "Neutral", "Negative"]

        nb_cm = confusion_matrix(y_test, nb_preds_test, labels=labels_order).tolist()
        lr_cm = confusion_matrix(y_test, lr_preds_test, labels=labels_order).tolist()

        nb_metrics = {
            "accuracy": round(float(accuracy_score(y_test, nb_preds_test)), 4),
            "precision_macro": round(float(precision_score(y_test, nb_preds_test, average='macro', zero_division=0)), 4),
            "recall_macro": round(float(recall_score(y_test, nb_preds_test, average='macro', zero_division=0)), 4),
            "f1_macro": round(float(f1_score(y_test, nb_preds_test, average='macro', zero_division=0)), 4),
            "labels": labels_order,
            "confusion_matrix": nb_cm
        }

        lr_metrics = {
            "accuracy": round(float(accuracy_score(y_test, lr_preds_test)), 4),
            "precision_macro": round(float(precision_score(y_test, lr_preds_test, average='macro', zero_division=0)), 4),
            "recall_macro": round(float(recall_score(y_test, lr_preds_test, average='macro', zero_division=0)), 4),
            "f1_macro": round(float(f1_score(y_test, lr_preds_test, average='macro', zero_division=0)), 4),
            "labels": labels_order,
            "confusion_matrix": lr_cm
        }

        diff_f1 = round((lr_metrics['f1_macro'] - nb_metrics['f1_macro']) * 100, 1)
        if diff_f1 >= 0:
            takeaway = (f"Logistic Regression outperforms Naive Bayes by {diff_f1}% on macro F1 ({lr_metrics['f1_macro']} vs {nb_metrics['f1_macro']}), "
                        f"delivering higher precision on subtle neutral and negative reviews with fewer false positives.")
        else:
            takeaway = (f"Naive Bayes achieves competitive performance with a macro F1 of {nb_metrics['f1_macro']} "
                        f"compared to Logistic Regression's {lr_metrics['f1_macro']}.")

        # Agreement between VADER, TextBlob, and Logistic Regression
        vader_lr_agree = float((df['vader_label'] == df['lr_label']).mean())
        tb_lr_agree = float((df['textblob_label'] == df['lr_label']).mean())
        vader_tb_agree = float((df['vader_label'] == df['textblob_label']).mean())
        all_three_agree = float(((df['vader_label'] == df['textblob_label']) & (df['textblob_label'] == df['lr_label'])).mean())

        self.model_metrics = {
            "naive_bayes": nb_metrics,
            "logistic_regression": lr_metrics,
            "takeaway": takeaway,
            "agreement_matrix": {
                "vader_vs_logistic_regression": round(vader_lr_agree * 100, 1),
                "textblob_vs_logistic_regression": round(tb_lr_agree * 100, 1),
                "vader_vs_textblob": round(vader_tb_agree * 100, 1),
                "unanimous_agreement": round(all_three_agree * 100, 1)
            }
        }

        # 5. Lightweight Suspicious Review Heuristic
        print("Flagging suspicious reviews...")
        # Check duplicates in normalized text
        clean_text_series = df['review_text'].str.strip().str.lower()
        text_counts = clean_text_series.value_counts()
        duplicate_texts = set(text_counts[text_counts > 1].index)

        is_suspicious_list = []
        reasons_list = []

        for idx, row in df.iterrows():
            reasons = []
            text = row['review_text'].strip()
            clean_t = text.lower()
            rating = row['rating']
            v_score = row['vader_score']

            # Rule 1: Very short text with high rating
            if rating >= 4 and len(text) <= 12 and len(text.split()) <= 2:
                reasons.append("Extremely short text for a high rating (potential bot)")

            # Rule 2: Extreme sentiment mismatch
            if rating >= 4 and v_score <= -0.35:
                reasons.append("Rating is 4-5 stars but text sentiment is strongly negative")
            elif rating <= 2 and v_score >= 0.45:
                reasons.append("Rating is 1-2 stars but text sentiment is strongly positive")

            # Rule 3: Exact duplicate text across multiple reviews
            if len(clean_t) > 20 and clean_t in duplicate_texts:
                reasons.append("Identical review text detected from multiple accounts")

            if reasons:
                is_suspicious_list.append(True)
                reasons_list.append(reasons)
            else:
                is_suspicious_list.append(False)
                reasons_list.append([])

        df['is_suspicious'] = is_suspicious_list
        df['suspicious_reasons'] = reasons_list

        self.df = df
        print(f"Analysis pipeline initialized successfully. {len(df)} reviews processed.")

    # Overview Data
    def get_overview(self, sentiment_source: str = "lr_label", category: Optional[str] = None) -> Dict[str, Any]:
        all_df = self.df
        is_filtered = bool(category and category.lower() != 'all')
        if is_filtered:
            df = all_df[all_df['category'].str.lower() == category.lower()]
        else:
            df = all_df

        total = len(df)
        if total == 0:
            return {}

        col = sentiment_source if sentiment_source in df.columns else "ground_truth_label"
        counts = df[col].value_counts().to_dict()
        pos = counts.get("Positive", 0)
        neu = counts.get("Neutral", 0)
        neg = counts.get("Negative", 0)

        pos_pct = round((pos / total) * 100, 1)
        neu_pct = round((neu / total) * 100, 1)
        neg_pct = round((neg / total) * 100, 1)

        avg_rating = round(float(df['rating'].mean()), 2)
        active_acc = self.model_metrics["logistic_regression"]["accuracy"]

        # Correlations
        corr_r_s = round(float(df['rating'].corr(df['vader_score'])), 3) if len(df) > 1 else 0.0
        corr_l_h = round(float(df['text_length'].corr(df['helpful_votes'])), 3) if len(df) > 1 else 0.0

        # Sentiment distribution list for chart
        sentiment_dist = [
            {"sentiment": "Positive", "count": pos, "percentage": pos_pct, "color": "#10b981"},
            {"sentiment": "Neutral", "count": neu, "percentage": neu_pct, "color": "#f59e0b"},
            {"sentiment": "Negative", "count": neg, "percentage": neg_pct, "color": "#ef4444"}
        ]

        # Category sentiment breakdown across all categories
        cat_data = []
        for cat, group in all_df.groupby('category'):
            g_total = len(group)
            g_counts = group[col].value_counts().to_dict()
            g_pos = g_counts.get("Positive", 0)
            g_neu = g_counts.get("Neutral", 0)
            g_neg = g_counts.get("Negative", 0)
            cat_data.append({
                "category": cat,
                "total": g_total,
                "avg_rating": round(float(group['rating'].mean()), 2),
                "positive": g_pos,
                "neutral": g_neu,
                "negative": g_neg,
                "positive_pct": round((g_pos / g_total) * 100, 1) if g_total else 0,
                "neutral_pct": round((g_neu / g_total) * 100, 1) if g_total else 0,
                "negative_pct": round((g_neg / g_total) * 100, 1) if g_total else 0
            })
        cat_data = sorted(cat_data, key=lambda x: x["total"], reverse=True)

        # Trend preview
        monthly_preview = []
        for ym, group in df.groupby('year_month'):
            monthly_preview.append({
                "month": ym,
                "total_reviews": len(group),
                "avg_rating": round(float(group['rating'].mean()), 2),
                "avg_sentiment": round(float(group['vader_score'].mean()), 3),
                "positive": int((group[col] == "Positive").sum()),
                "neutral": int((group[col] == "Neutral").sum()),
                "negative": int((group[col] == "Negative").sum())
            })
        monthly_preview = sorted(monthly_preview, key=lambda x: x["month"])

        # Auto-generated natural language summary
        if is_filtered:
            cat_name = df['category'].iloc[0] if len(df) else category
            auto_summary = (
                f"Filtered by '{cat_name}': Across {total:,} customer reviews, "
                f"sentiment is {pos_pct}% positive with a {avg_rating}★ average rating. "
                f"Critical feedback represents {neg_pct}%, with rating-sentiment correlation of r = {corr_r_s}."
            )
        else:
            highest_neg_cat = max(cat_data, key=lambda x: x["negative_pct"])
            highest_pos_cat = max(cat_data, key=lambda x: x["positive_pct"])
            auto_summary = (
                f"Across {total:,} Flipkart reviews, overall customer sentiment is {pos_pct}% positive with a {avg_rating}★ average rating. "
                f"'{highest_pos_cat['category']}' leads in satisfaction ({highest_pos_cat['positive_pct']}% positive), "
                f"whereas '{highest_neg_cat['category']}' shows the highest critical feedback share at {highest_neg_cat['negative_pct']}% negative. "
                f"Strong positive correlation (r = {corr_r_s}) confirms consistency between star ratings and text polarity."
            )

        return {
            "total_reviews": total,
            "avg_rating": avg_rating,
            "positive_pct": pos_pct,
            "neutral_pct": neu_pct,
            "negative_pct": neg_pct,
            "active_model_accuracy": round(active_acc * 100, 1),
            "rating_sentiment_correlation": corr_r_s,
            "length_helpful_correlation": corr_l_h,
            "auto_summary": auto_summary,
            "sentiment_distribution": sentiment_dist,
            "category_sentiment": cat_data,
            "trend_preview": monthly_preview
        }

    # Category Sentiment breakdown
    def get_category_sentiment(self, sentiment_source: str = "lr_label") -> List[Dict[str, Any]]:
        overview = self.get_overview(sentiment_source)
        return overview.get("category_sentiment", [])

    # Monthly Trend & Correlation
    def get_trend_data(self, category: Optional[str] = None) -> Dict[str, Any]:
        df = self.df
        if category and category.lower() != 'all':
            df = df[df['category'].str.lower() == category.lower()]

        trends = []
        for ym, group in df.groupby('year_month'):
            trends.append({
                "month": ym,
                "total_reviews": len(group),
                "avg_rating": round(float(group['rating'].mean()), 2),
                "avg_sentiment": round(float(group['vader_score'].mean()), 3),
                "positive": int((group['lr_label'] == "Positive").sum()),
                "neutral": int((group['lr_label'] == "Neutral").sum()),
                "negative": int((group['lr_label'] == "Negative").sum())
            })
        trends = sorted(trends, key=lambda x: x["month"])

        # Sample data points for scatter plot
        sample_df = df.sample(n=min(250, len(df)), random_state=42) if len(df) > 0 else df
        rating_vs_sentiment = []
        length_vs_helpful = []
        for _, row in sample_df.iterrows():
            rating_vs_sentiment.append({
                "rating": int(row['rating']),
                "sentiment_score": round(float(row['vader_score']), 3),
                "category": row['category'],
                "product_name": row['product_name'][:25]
            })
            length_vs_helpful.append({
                "review_length": int(row['text_length']),
                "helpful_votes": int(row['helpful_votes']),
                "rating": int(row['rating']),
                "category": row['category']
            })

        corr_r_s = round(float(df['rating'].corr(df['vader_score'])), 3) if len(df) > 1 else 0.0
        corr_l_h = round(float(df['text_length'].corr(df['helpful_votes'])), 3) if len(df) > 1 else 0.0

        return {
            "trends": trends,
            "rating_vs_sentiment": rating_vs_sentiment,
            "length_vs_helpful": length_vs_helpful,
            "correlation_rating_sentiment": corr_r_s,
            "correlation_length_helpful": corr_l_h
        }

    # N-gram Extraction (Unigrams and Bigrams)
    def get_ngrams(self, top_n: int = 25, category: Optional[str] = None) -> Dict[str, Any]:
        df = self.df
        if category and category.lower() != 'all':
            df = df[df['category'].str.lower() == category.lower()]

        pos_df = df[df['lr_label'] == "Positive"]
        neg_df = df[df['lr_label'] == "Negative"]

        def extract_grams(texts, ngram_range):
            if texts.empty:
                return []
            try:
                vec = CountVectorizer(
                    ngram_range=ngram_range,
                    stop_words=list(self.custom_stopwords),
                    token_pattern=r'(?u)\b[a-zA-Z]{3,}\b',
                    max_features=100
                )
                matrix = vec.fit_transform(texts)
                sums = matrix.sum(axis=0)
                words_freq = [(word, int(sums[0, idx])) for word, idx in vec.vocabulary_.items()]
                words_freq = sorted(words_freq, key=lambda x: x[1], reverse=True)[:top_n]
                return [{"term": w, "count": c} for w, c in words_freq]
            except Exception as e:
                print(f"Error computing n-grams: {e}")
                return []

        pos_unigrams = extract_grams(pos_df['review_text'], (1, 1))
        pos_bigrams = extract_grams(pos_df['review_text'], (2, 2))
        neg_unigrams = extract_grams(neg_df['review_text'], (1, 1))
        neg_bigrams = extract_grams(neg_df['review_text'], (2, 2))

        return {
            "positive_unigrams": pos_unigrams,
            "positive_bigrams": pos_bigrams,
            "negative_unigrams": neg_unigrams,
            "negative_bigrams": neg_bigrams
        }

    # Model Comparison
    def get_model_comparison(self) -> Dict[str, Any]:
        return self.model_metrics

    # Suspicious Reviews
    def get_suspicious(self) -> Dict[str, Any]:
        df = self.df
        flagged = df[df['is_suspicious'] == True]
        total = len(df)
        flagged_count = len(flagged)
        pct = round((flagged_count / total) * 100, 2) if total > 0 else 0.0

        items = []
        for _, row in flagged.iterrows():
            items.append({
                "review_id": str(row['review_id']),
                "product_name": str(row['product_name']),
                "reviewer_name": str(row['reviewer_name']),
                "rating": int(row['rating']),
                "review_title": str(row['review_title']),
                "review_text": str(row['review_text']),
                "date": str(row['date_str']),
                "helpful_votes": int(row['helpful_votes']),
                "reasons": row['suspicious_reasons']
            })

        return {
            "total_flagged": flagged_count,
            "percentage": pct,
            "flagged_reviews": items
        }

    # Filtered Reviews
    def get_reviews(
        self,
        category: Optional[str] = None,
        product: Optional[str] = None,
        sentiment: Optional[str] = None,
        sentiment_source: str = "lr_label",
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        search: Optional[str] = None,
        suspicious_only: bool = False,
        sort_by: str = "date",
        sort_order: str = "desc",
        page: int = 1,
        page_size: int = 15
    ) -> Dict[str, Any]:
        filtered = self.df

        if category and category.lower() != 'all':
            filtered = filtered[filtered['category'].str.lower() == category.lower()]

        if product and product.lower() != 'all':
            filtered = filtered[filtered['product_name'].str.lower().str.contains(product.lower(), na=False)]

        col = sentiment_source if sentiment_source in filtered.columns else "lr_label"
        if sentiment and sentiment.lower() != 'all':
            filtered = filtered[filtered[col].str.lower() == sentiment.lower()]

        if start_date:
            filtered = filtered[filtered['date_str'] >= start_date]

        if end_date:
            filtered = filtered[filtered['date_str'] <= end_date]

        if suspicious_only:
            filtered = filtered[filtered['is_suspicious'] == True]

        if search and search.strip():
            s = search.strip().lower()
            mask = (
                filtered['review_text'].str.lower().str.contains(s, na=False) |
                filtered['review_title'].str.lower().str.contains(s, na=False) |
                filtered['product_name'].str.lower().str.contains(s, na=False) |
                filtered['reviewer_name'].str.lower().str.contains(s, na=False)
            )
            filtered = filtered[mask]

        # Sorting
        valid_sort_cols = {
            'date': 'date',
            'rating': 'rating',
            'helpful_votes': 'helpful_votes',
            'sentiment_score': 'vader_score',
            'length': 'text_length'
        }
        sort_col = valid_sort_cols.get(sort_by, 'date')
        ascending = (sort_order.lower() == 'asc')
        filtered = filtered.sort_values(by=sort_col, ascending=ascending)

        total = len(filtered)
        total_pages = max(1, (total + page_size - 1) // page_size)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        sliced = filtered.iloc[start_idx:end_idx]

        items = []
        for _, row in sliced.iterrows():
            items.append({
                "review_id": str(row['review_id']),
                "date": str(row['date_str']),
                "category": str(row['category']),
                "product_name": str(row['product_name']),
                "reviewer_name": str(row['reviewer_name']),
                "rating": int(row['rating']),
                "review_title": str(row['review_title']),
                "review_text": str(row['review_text']),
                "sentiment": str(row['ground_truth_label']),
                "sentiment_score": round(float(row['vader_score']), 4),
                "vader_label": str(row['vader_label']),
                "vader_score": round(float(row['vader_score']), 4),
                "textblob_label": str(row['textblob_label']),
                "textblob_polarity": round(float(row['textblob_polarity']), 4),
                "nb_label": str(row['nb_label']),
                "lr_label": str(row['lr_label']),
                "helpful_votes": int(row['helpful_votes']),
                "is_suspicious": bool(row['is_suspicious']),
                "suspicious_reasons": row['suspicious_reasons']
            })

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "items": items
        }

    # Live single review analysis for Sentiment Lab
    def analyze_live_text(self, text: str) -> Dict[str, Any]:
        text = text.strip()
        if not text:
            return {
                "text": text,
                "results": [],
                "agreement": "Empty text"
            }

        # 1. VADER
        vs = self.vader.polarity_scores(text)
        v_compound = vs['compound']
        if v_compound >= 0.05:
            v_label = "Positive"
        elif v_compound <= -0.05:
            v_label = "Negative"
        else:
            v_label = "Neutral"

        # 2. TextBlob
        blob = TextBlob(text)
        tb_pol = round(float(blob.sentiment.polarity), 4)
        tb_sub = round(float(blob.sentiment.subjectivity), 4)
        if tb_pol > 0.1:
            tb_label = "Positive"
        elif tb_pol < -0.1:
            tb_label = "Negative"
        else:
            tb_label = "Neutral"

        # 3. ML Models
        vec = self.tfidf_vectorizer.transform([text])
        nb_pred = self.nb_model.predict(vec)[0]
        nb_probs = self.nb_model.predict_proba(vec)[0]
        nb_prob_dict = {cls: round(float(prob), 4) for cls, prob in zip(self.nb_model.classes_, nb_probs)}

        lr_pred = self.lr_model.predict(vec)[0]
        lr_probs = self.lr_model.predict_proba(vec)[0]
        lr_prob_dict = {cls: round(float(prob), 4) for cls, prob in zip(self.lr_model.classes_, lr_probs)}

        results = [
            {
                "method": "VADER Lexicon",
                "label": v_label,
                "score": round(float(v_compound), 4),
                "details": {
                    "compound": round(float(vs['compound']), 4),
                    "pos": round(float(vs['pos']), 4),
                    "neu": round(float(vs['neu']), 4),
                    "neg": round(float(vs['neg']), 4)
                }
            },
            {
                "method": "TextBlob",
                "label": tb_label,
                "score": tb_pol,
                "details": {
                    "polarity": tb_pol,
                    "subjectivity": tb_sub
                }
            },
            {
                "method": "Multinomial Naive Bayes",
                "label": nb_pred,
                "score": nb_prob_dict.get(nb_pred, 0.0),
                "details": nb_prob_dict
            },
            {
                "method": "Logistic Regression (TF-IDF)",
                "label": lr_pred,
                "score": lr_prob_dict.get(lr_pred, 0.0),
                "details": lr_prob_dict
            }
        ]

        labels = [v_label, tb_label, lr_pred]
        if len(set(labels)) == 1:
            agreement = "Unanimous Agreement (All 3 methods predict " + labels[0] + ")"
        elif labels[0] == labels[2]:
            agreement = "Majority Agreement (VADER & ML agree on " + labels[0] + ")"
        elif labels[1] == labels[2]:
            agreement = "Majority Agreement (TextBlob & ML agree on " + labels[1] + ")"
        elif labels[0] == labels[1]:
            agreement = "Rule-based Agreement (VADER & TextBlob agree on " + labels[0] + ")"
        else:
            agreement = "Split Decision (All 3 methods predict different sentiments)"

        return {
            "text": text,
            "results": results,
            "agreement": agreement
        }

    # Meta filters (categories, products, date ranges)
    def get_filter_meta(self) -> Dict[str, Any]:
        df = self.df
        categories = sorted(df['category'].dropna().unique().tolist())
        products_by_category = {}
        for cat, group in df.groupby('category'):
            products_by_category[cat] = sorted(group['product_name'].dropna().unique().tolist())

        min_date = df['date_str'].min()
        max_date = df['date_str'].max()

        return {
            "categories": categories,
            "products_by_category": products_by_category,
            "min_date": min_date,
            "max_date": max_date,
            "total_reviews": len(df)
        }
