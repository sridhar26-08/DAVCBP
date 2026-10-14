# Flipkart Sentiment Analytics & Visualization (DAV Project)

An interactive, full-stack Data Analytics & Visualization (DAV) web dashboard analyzing consumer sentiment across Flipkart product reviews.

## 🚀 Key Features

- **Multi-Method Sentiment Analysis**:
  - **Lexicon-Based**: NLTK VADER compound scoring and sentiment classification.
  - **Pattern Lexicon**: TextBlob polarity and subjectivity evaluation.
  - **Supervised Machine Learning**: TF-IDF Vectorization with **Multinomial Naive Bayes** and **Logistic Regression**, trained on an 80/20 stratified split.
- **Model Evaluation & Confusion Heatmaps**: Macro Precision, Recall, and F1-Scores with interactive 3x3 confusion matrix heatmaps comparing both models side-by-side.
- **Sentiment Lab**: Live interactive sandbox where you can input arbitrary reviews and observe all four algorithms evaluate sentiment with confidence scores and consensus detection.
- **Temporal Trends & Correlations**: Monthly review volume trends, festive seasonality analysis (Big Billion Days peaks), and Pearson correlation ($r = 0.751$) between ratings and text polarity.
- **HTML5 Canvas Word Cloud**: Custom canvas-based word cloud with Archimedean spiral collision detection for positive and negative lexicons, alongside bigram frequency tables.
- **Suspicious Review Heuristic Engine**: Automated detection flagging likely fake reviews based on extreme sentiment-rating mismatches, high rating with short text, and duplicate text across reviewer accounts.
- **Reviews Explorer**: Searchable, filterable, sortable, and paginated review table with CSV export.
- **Theme & UI/UX**: Dark and light modes (persisted in `localStorage`), responsive layout, skeleton loaders, and keyboard shortcuts (`/` to search).

---

## 🛠️ Tech Stack

- **Backend**: Python 3.11, FastAPI, Uvicorn, Pandas, Scikit-Learn, NLTK, TextBlob, Pydantic
- **Frontend**: React 19, TypeScript, Vite, TailwindCSS, Recharts, Framer Motion, Lucide Icons

---

## 📂 Project Structure

```
.
├── backend/
│   ├── data/
│   │   └── flipkart_reviews.csv       # Dataset with 2,500 reviews across 6 categories
│   ├── generate_dataset.py            # Dataset generator
│   ├── analysis.py                    # VADER, TextBlob, ML training & aggregations
│   ├── models.py                      # Pydantic schemas
│   ├── requirements.txt               # Backend dependencies
│   └── main.py                        # FastAPI entrypoint
└── frontend/
    ├── src/
    │   ├── components/                # KpiCard, FilterBar, DataTable, ThemeToggle, Charts
    │   ├── pages/                     # Overview, SentimentLab, ModelComparison, Trends, WordAnalysis, Reviews, About
    │   └── lib/api.ts                 # Typed API client
    ├── tailwind.config.js
    └── package.json
```

---

## ⚡ Getting Started

### 1. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 -c "import ssl, nltk; ssl._create_default_https_context = ssl._create_unverified_context; nltk.download('vader_lexicon'); nltk.download('stopwords')"
uvicorn main:app --reload --port 8000
```
Backend runs at: `http://127.0.0.1:8000` (Docs: `http://127.0.0.1:8000/docs`)

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://127.0.0.1:5173`
