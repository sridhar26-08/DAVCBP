import React from 'react';
import {
  BookOpen,
  Database,
  Cpu,
  Layers,
  CheckCircle2,
  ShieldAlert,
  Code,
  GraduationCap,
} from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Project Methodology & Academic Documentation
          </h2>
        </div>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
          Data Analytics & Visualization (DAV) Coursework • End-to-End Sentiment Intelligence Architecture
        </p>
      </div>

      {/* Abstract Card */}
      <div className="glass-panel p-6 border border-blue-200/60 dark:border-blue-900/40 bg-gradient-to-r from-blue-50/40 via-white to-indigo-50/40 dark:from-slate-900 dark:to-blue-950/20">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          Project Abstract & Objective
        </h3>
        <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          In contemporary e-commerce platforms like Flipkart, understanding consumer sentiment across vast streams of user reviews is pivotal for both buyers making purchase decisions and sellers optimizing inventory and product quality. This project constructs a full-stack, real-time analytics system combining <strong>rule-based lexicon heuristics</strong> (VADER, TextBlob) with <strong>supervised machine learning classifiers</strong> (TF-IDF Vectorization with Multinomial Naive Bayes and Logistic Regression) to benchmark algorithmic trade-offs, model agreement, and temporal sentiment shifts.
        </p>
      </div>

      {/* Dataset Architecture */}
      <div className="glass-panel p-6 border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600" />
          Dataset Schema & Attributes
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          The dataset comprises consumer product reviews across six primary departments: Mobiles, Electronics, Audio, Fashion, Home & Kitchen, and Appliances.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
              <tr>
                <th className="p-2.5">Field</th>
                <th className="p-2.5">Type</th>
                <th className="p-2.5">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="p-2.5 font-mono font-bold text-blue-600">review_id</td>
                <td className="p-2.5 text-slate-500">String</td>
                <td className="p-2.5">Unique identifier assigned to each product review entry.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-mono font-bold text-blue-600">date</td>
                <td className="p-2.5 text-slate-500">Date (YYYY-MM-DD)</td>
                <td className="p-2.5">Date the review was posted; used for longitudinal trend analysis.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-mono font-bold text-blue-600">category</td>
                <td className="p-2.5 text-slate-500">Categorical</td>
                <td className="p-2.5">E-commerce department (Mobiles, Audio, Electronics, etc.).</td>
              </tr>
              <tr>
                <td className="p-2.5 font-mono font-bold text-blue-600">product_name</td>
                <td className="p-2.5 text-slate-500">String</td>
                <td className="p-2.5">Specific commercial model name (e.g. Apple iPhone 15, Sony WH-1000XM4).</td>
              </tr>
              <tr>
                <td className="p-2.5 font-mono font-bold text-blue-600">rating</td>
                <td className="p-2.5 text-slate-500">Integer (1 to 5)</td>
                <td className="p-2.5">Consumer star rating serving as ground-truth benchmark.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-mono font-bold text-blue-600">review_text</td>
                <td className="p-2.5 text-slate-500">Text</td>
                <td className="p-2.5">Natural language user feedback submitted on Flipkart.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-mono font-bold text-blue-600">helpful_votes</td>
                <td className="p-2.5 text-slate-500">Integer</td>
                <td className="p-2.5">Community upvotes endorsing review helpfulness.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* The 3 Sentiment Approaches */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-600" />
          The Three Sentiment Scoring Methodologies
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* VADER */}
          <div className="glass-panel p-5 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Method A • Lexicon</span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">NLTK VADER</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Valence Aware Dictionary and sEntiment Reasoner</strong>: Specifically tuned for microblogs and reviews. Calculates a compound normalized score between -1 and +1:
            </p>
            <ul className="text-[11px] text-slate-500 space-y-1 list-disc list-inside">
              <li>Compound ≥ +0.05 → Positive</li>
              <li>-0.05 &lt; Compound &lt; +0.05 → Neutral</li>
              <li>Compound ≤ -0.05 → Negative</li>
            </ul>
          </div>

          {/* TextBlob */}
          <div className="glass-panel p-5 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Method B • Pattern Lexicon</span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">TextBlob Polarity</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Computes semantic orientation using the Pattern lexicon. Evaluates adjective-noun modifiers and returns continuous Polarity [-1.0, 1.0] and Subjectivity [0.0, 1.0]:
            </p>
            <ul className="text-[11px] text-slate-500 space-y-1 list-disc list-inside">
              <li>Polarity &gt; 0.10 → Positive</li>
              <li>-0.10 ≤ Polarity ≤ 0.10 → Neutral</li>
              <li>Polarity &lt; -0.10 → Negative</li>
            </ul>
          </div>

          {/* Supervised ML */}
          <div className="glass-panel p-5 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Method C • Supervised ML</span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">TF-IDF Classifiers</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Trained on star-rating derived ground truth with an 80/20 train/test split. Evaluates term frequency-inverse document frequency over unigrams & bigrams:
            </p>
            <ul className="text-[11px] text-slate-500 space-y-1 list-disc list-inside">
              <li>Multinomial Naive Bayes (Laplace smoothed)</li>
              <li>L2-regularized Logistic Regression</li>
              <li>Stratified k-class split</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Heuristics for Fake / Suspicious Reviews */}
      <div className="glass-panel p-6 border border-slate-200 dark:border-slate-800 space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          Lightweight Suspicious Review Heuristic Engine
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          E-commerce platforms frequently encounter astroturfing (bot-generated 5-star spam) or misrated reviews. We implement a multi-condition rule filter:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block mb-1">1. High Rating + Short Text</span>
            <p className="text-[11px] text-slate-500">Reviews with 4-5 stars but text length ≤ 12 characters (e.g. "Good", "Super") typical of paid review farms.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block mb-1">2. Extreme Polarity Mismatch</span>
            <p className="text-[11px] text-slate-500">Rating is 5 stars but sentiment score is strongly negative (&lt; -0.35), or 1 star with enthusiastic positive text.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block mb-1">3. Duplicate Review Flooding</span>
            <p className="text-[11px] text-slate-500">Identical multi-sentence review strings submitted by multiple distinct reviewer accounts across products.</p>
          </div>
        </div>
      </div>

      {/* Tech Stack Summary */}
      <div className="glass-panel p-6 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Technical Architecture</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            FastAPI Backend • Uvicorn • Scikit-Learn • NLTK • React Vite • TailwindCSS • Recharts • Framer Motion
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold border border-blue-200 dark:border-blue-800">
            DAV College Capstone v1.0
          </span>
        </div>
      </div>
    </div>
  );
};
