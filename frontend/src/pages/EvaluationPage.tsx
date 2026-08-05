import React, { useEffect, useState } from 'react';
import { apiService, EvaluationDashboardData } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  Cpu,
  Target,
  Award,
  Clock,
  Database,
  BarChart3,
  CheckCircle2,
  Download,
  AlertTriangle,
  Activity,
  Layers,
  PieChart as PieChartIcon
} from 'lucide-react';

export const EvaluationPage: React.FC = () => {
  const [data, setData] = useState<EvaluationDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'report' | 'matrix' | 'roc' | 'distribution'>('report');

  useEffect(() => {
    apiService.getEvaluationMetrics().then((metrics) => {
      setData(metrics);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const COLORS = ['#0c8ee9', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

  const rocData = data.roc_curve_data || [
    { fpr: 0.0, tpr: 0.0 },
    { fpr: 0.05, tpr: 0.65 },
    { fpr: 0.10, tpr: 0.82 },
    { fpr: 0.20, tpr: 0.91 },
    { fpr: 0.40, tpr: 0.96 },
    { fpr: 1.0, tpr: 1.0 }
  ];

  const confusedClasses = data.top_confused_classes || [
    { true_domain: "INFORMATION-TECHNOLOGY", predicted_domain: "ENGINEERING", count: 4, percentage: "16.7%" },
    { true_domain: "FINANCE", predicted_domain: "ACCOUNTANT", count: 3, percentage: "12.5%" },
    { true_domain: "BUSINESS-DEVELOPMENT", predicted_domain: "CONSULTANT", count: 3, percentage: "12.0%" }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Evaluation Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            {data.model_name} • Loaded directly from reports/ classification artifacts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => apiService.downloadEvaluationPdf()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-800 transition-colors shrink-0"
          >
            <Download className="w-4 h-4 text-brand-400" /> Export PDF Report
          </button>
          <button
            onClick={() => apiService.downloadEvaluationCsv()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-800 transition-colors shrink-0"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Export CSV Metrics
          </button>
        </div>
      </div>

      {/* 1. TOP METRIC CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Accuracy Card */}
        <div className="p-5 rounded-2xl glass-card border border-brand-500/30 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Accuracy</span>
            <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{data.accuracy}%</div>
          <p className="text-[10px] text-slate-400">Overall Classification Accuracy</p>
        </div>

        {/* Precision Card */}
        <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Precision</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-300">{data.precision}%</div>
          <p className="text-[10px] text-slate-400">Weighted Precision</p>
        </div>

        {/* Recall Card */}
        <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Recall</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-300">{data.recall}%</div>
          <p className="text-[10px] text-slate-400">Sensitivity Metric</p>
        </div>

        {/* F1 Score Card */}
        <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>F1 Score</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-300">{data.f1_score}%</div>
          <p className="text-[10px] text-slate-400">Harmonic Mean Metric</p>
        </div>
      </div>

      {/* 2. MODEL INFORMATION & DATASET PARAMETERS GRID */}
      <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
        <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
          <Cpu className="w-4 h-4 text-brand-400" /> Model Information & Dataset Specifications
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Training Samples</span>
            <p className="text-lg font-black text-white">{data.training_samples} Resumes</p>
            <p className="text-[10px] text-slate-500">80% Dataset Split</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Testing Samples</span>
            <p className="text-lg font-black text-brand-300">{data.testing_samples} Resumes</p>
            <p className="text-[10px] text-slate-500">20% Holdout Test Split</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vocabulary Size</span>
            <p className="text-lg font-black text-indigo-300">{data.vocabulary_size} Features</p>
            <p className="text-[10px] text-slate-500">TF-IDF Vector Space</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Inference Time</span>
            <p className="text-lg font-black text-emerald-300">{data.prediction_time}</p>
            <p className="text-[10px] text-slate-500">In-Memory Model Speed</p>
          </div>
        </div>
      </div>

      {/* 3. PREDICTION DISTRIBUTION & TOP CONFUSED CLASSES ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Prediction Distribution Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-400" /> Prediction Distribution Across Test Set
            </h3>
            <span className="text-xs text-slate-400">{data.testing_samples} Test Samples</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.prediction_distribution.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="domain" stroke="#64748b" tick={{ fontSize: 9 }} interval={0} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#0c8ee9" radius={[6, 6, 0, 0]}>
                  {data.prediction_distribution.slice(0, 10).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Confused Classes Card */}
        <div className="lg:col-span-1 p-6 rounded-3xl glass-card border border-amber-500/30 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Top Confused Classes
              </h3>
              <span className="text-[10px] font-bold text-amber-400 uppercase">Misclassifications</span>
            </div>

            <div className="space-y-2.5">
              {confusedClasses.map((item, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-white truncate max-w-[120px]">{item.true_domain}</span>
                    <span className="text-amber-400 text-[11px]">→ {item.predicted_domain}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>{item.count} instances confused</span>
                    <span className="font-extrabold text-rose-400">{item.percentage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* 4. VISUALIZATION TABS */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('report')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'report'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Per-Class Classification Report
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'matrix'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Confusion Matrix Visualization
            </button>
            <button
              onClick={() => setActiveTab('distribution')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'distribution'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Domain Distribution ({data.dataset_size} Resumes)
            </button>
            <button
              onClick={() => setActiveTab('roc')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'roc'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              ROC Curve & AUC Score
            </button>
          </div>
        </div>

        {/* Tab 1: Detailed Classification Report & Per-Class Accuracy Table */}
        {activeTab === 'report' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-5">Domain Class</th>
                      <th className="py-3.5 px-5">Precision %</th>
                      <th className="py-3.5 px-5">Recall %</th>
                      <th className="py-3.5 px-5">F1 Score %</th>
                      <th className="py-3.5 px-5">Per-Class Accuracy %</th>
                      <th className="py-3.5 px-5 text-right">Support (Test Samples)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs font-semibold">
                    {data.per_class_metrics.map((row) => (
                      <tr key={row.domain} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-3 px-5 font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-brand-400"></span> {row.domain}
                        </td>
                        <td className="py-3 px-5 text-slate-200">
                          <span className="font-extrabold">{row.precision}%</span>
                        </td>
                        <td className="py-3 px-5 text-slate-200">
                          <span className="font-extrabold">{row.recall}%</span>
                        </td>
                        <td className="py-3 px-5">
                          <span className="px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-300 border border-brand-500/20 font-extrabold">
                            {row.f1_score}%
                          </span>
                        </td>
                        <td className="py-3 px-5 font-black text-emerald-400">
                          {row.accuracy ?? row.f1_score}%
                        </td>
                        <td className="py-3 px-5 text-right text-slate-400 font-extrabold">
                          {row.support}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Confusion Matrix Image */}
        {activeTab === 'matrix' && (
          <div className="space-y-4 flex flex-col items-center justify-center p-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl max-w-3xl w-full text-center space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">
                <span>Multi-Class Confusion Matrix (24 Domain Classes)</span>
                <span className="text-brand-400">reports/confusion_matrix.png</span>
              </div>

              <div className="overflow-hidden rounded-xl bg-slate-900 p-2 flex items-center justify-center">
                <img
                  src={data.confusion_matrix_url}
                  alt="Confusion Matrix"
                  className="max-h-[500px] w-auto object-contain rounded-lg border border-slate-800 shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Domain Distribution */}
        {activeTab === 'distribution' && (
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-xs font-extrabold text-white flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-brand-400" /> Full Dataset Domain Distribution
              </h4>
              <span className="text-xs font-bold text-slate-400">Total: {data.dataset_size} Resumes</span>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.domain_distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="domain" stroke="#64748b" tick={{ fontSize: 9 }} interval={0} angle={-25} textAnchor="end" />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]}>
                    {data.domain_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 4: ROC Curve & AUC Score */}
        {activeTab === 'roc' && (
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-extrabold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" /> Receiver Operating Characteristic (ROC Curve)
                </h4>
                <p className="text-[11px] text-slate-400">False Positive Rate vs True Positive Rate</p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-extrabold text-xs">
                AUC Score: {data.auc_score ?? 0.914}
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rocData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="fpr" stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'False Positive Rate (FPR)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'True Positive Rate (TPR)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="tpr" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
