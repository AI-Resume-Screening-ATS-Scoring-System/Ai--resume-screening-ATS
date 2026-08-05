import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import {
  Settings,
  Trash2,
  Download,
  Moon,
  Sun,
  Palette,
  Cpu,
  Database,
  Calendar,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HardDrive,
  Activity,
  Check
} from 'lucide-react';

interface SystemInfo {
  model_version: string;
  dataset_size: string;
  training_date: string;
  total_predictions: string;
  average_prediction_time: string;
}

export const SettingsPage: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<string>(() => {
    return localStorage.getItem('theme') || 'dark-modern';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved !== 'light-mode';
  });

  // Toast & Loading States
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [loadingReports, setLoadingReports] = useState<boolean>(false);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);

  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    model_version: 'Logistic Regression v1.0 (TF-IDF Vectorizer 5000 Features)',
    dataset_size: '2,481 Resumes (24 Domain Categories)',
    training_date: '2026-08-01',
    total_predictions: '0',
    average_prediction_time: '0.01 sec'
  });

  // Theme Palettes List with color badges
  const themePalettes = [
    { id: 'dark-modern', name: 'Dark Modern Slate', bg: '#090d16', accent: '#0c8ee9' },
    { id: 'cyber-neon', name: 'Cyber Neon', bg: '#030712', accent: '#38bdf8' },
    { id: 'emerald-tech', name: 'Emerald Tech', bg: '#022c22', accent: '#10b981' },
    { id: 'purple-tech', name: 'Corporate Purple', bg: '#0f0716', accent: '#a855f7' },
    { id: 'light-mode', name: 'Clean Light Mode', bg: '#f8fafc', accent: '#0284c7' }
  ];

  // Apply Theme Immediately to documentElement & Persist to localStorage
  useEffect(() => {
    localStorage.setItem('theme', selectedTheme);
    document.documentElement.setAttribute('data-theme', selectedTheme);
  }, [selectedTheme]);

  const handleThemeChange = (newTheme: string) => {
    setSelectedTheme(newTheme);
    if (newTheme === 'light-mode') {
      setDarkMode(false);
    } else {
      setDarkMode(true);
    }
    showToast(`Theme updated to ${newTheme.replace('-', ' ').toUpperCase()}.`, 'success');
  };

  const handleDarkModeToggle = () => {
    if (darkMode) {
      setDarkMode(false);
      handleThemeChange('light-mode');
    } else {
      setDarkMode(true);
      handleThemeChange('dark-modern');
    }
  };

  // Fetch System Metadata from Backend
  useEffect(() => {
    fetch('http://localhost:8000/settings/info')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setSystemInfo({
            model_version: data.model_version,
            dataset_size: data.dataset_size,
            training_date: data.training_date,
            total_predictions: data.total_predictions,
            average_prediction_time: data.average_prediction_time
          });
        }
      })
      .catch(() => {
        console.warn('Could not fetch settings info from backend');
      });
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Clear Upload History (DELETE /history & Reset Single Source of Truth Store)
  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear all upload history, candidates, analysis records, and reports?")) {
      return;
    }

    setLoadingHistory(true);
    try {
      await apiService.clearUploadHistory();
      showToast('All upload history, candidates, and reports cleared successfully.', 'success');
      setSystemInfo((prev) => ({ ...prev, total_predictions: '0' }));
    } catch (err: any) {
      showToast(err.message || 'Error clearing upload history.', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Delete Generated Reports (DELETE /reports)
  const handleDeleteReports = async () => {
    setLoadingReports(true);
    try {
      const data = await apiService.deleteReports();
      showToast(data.message || 'Report files deleted from reports/ directory.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error deleting report files.', 'error');
    } finally {
      setLoadingReports(false);
    }
  };

  // Download System Logs (GET /logs/download)
  const handleDownloadLogs = async () => {
    setLoadingLogs(true);
    try {
      await apiService.downloadSystemLogs();
      showToast('System logs downloaded successfully (ats_system.log).', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error downloading system logs.', 'error');
    } finally {
      setLoadingLogs(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-3 shadow-lg ${
            toastType === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
          }`}
        >
          {toastType === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <p className="font-bold">{toastMessage}</p>
        </div>
      )}

      {/* Page Header */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-brand-400" /> Settings & System Controls
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System preferences, theme palette selection, machine learning model status, and maintenance.
          </p>
        </div>
      </div>

      {/* 1. MODEL INFORMATION DISPLAY SECTION */}
      <div className="p-6 rounded-3xl glass-card border border-brand-500/30 space-y-4">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-brand-400" /> Machine Learning & SaaS System Specifications
          </h3>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-400" /> Online
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Frontend Version</span>
            <p className="text-xs font-extrabold text-white">v1.0.0 (React 18 + Vite)</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Backend Version</span>
            <p className="text-xs font-extrabold text-white">v1.0.0 (FastAPI + Python)</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Model Version</span>
            <p className="text-xs font-extrabold text-brand-300 truncate">{systemInfo.model_version}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <Database className="w-3 h-3 text-indigo-400" /> Dataset Size
            </span>
            <p className="text-xs font-extrabold text-indigo-300">{systemInfo.dataset_size}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-400" /> Training Date
            </span>
            <p className="text-xs font-extrabold text-emerald-300">{systemInfo.training_date}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Live Predictions
            </span>
            <p className="text-xs font-extrabold text-amber-300">{systemInfo.total_predictions}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <Cpu className="w-3 h-3 text-brand-400" /> Average Inference Time
            </span>
            <p className="text-xs font-extrabold text-brand-300">{systemInfo.average_prediction_time}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-purple-400" /> Storage Usage
            </span>
            <p className="text-xs font-extrabold text-purple-300">12.4 MB / Cache 0.8 MB</p>
          </div>
        </div>
      </div>

      {/* 2. THEME PALETTE PREVIEW & APPEARANCE CONTROLS */}
      <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-400" /> Appearance & Theme System
          </h3>
          <span className="text-xs font-bold text-slate-400">Instant Global Switch</span>
        </div>

        {/* Dark Mode Switch Banner */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300">
              {darkMode ? <Moon className="w-4 h-4 text-brand-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </div>
            <div>
              <p className="text-xs font-extrabold text-white">Dark Mode</p>
              <p className="text-[11px] text-slate-400">Toggle dark / light application theme</p>
            </div>
          </div>

          <button
            onClick={handleDarkModeToggle}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              darkMode ? 'bg-brand-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            ></div>
          </button>
        </div>

        {/* Theme Palette Cards Grid */}
        <div className="space-y-3">
          <label className="text-xs font-extrabold text-white block">Theme Palettes</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {themePalettes.map((p) => {
              const isSelected = selectedTheme === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => handleThemeChange(p.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-brand-500 shadow-glow'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl border border-slate-700 flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: p.bg, color: p.accent }}
                    >
                      Aa
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-white">{p.name}</p>
                      <span className="text-[10px] text-slate-400 font-mono" style={{ color: p.accent }}>
                        {p.accent}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="p-1 rounded-full bg-brand-500 text-white">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. SYSTEM MAINTENANCE & REPORT ACTIONS */}
      <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-5">
        <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
          <Trash2 className="w-4 h-4 text-rose-400" /> Data Maintenance & Log Actions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Clear Upload History */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-extrabold text-white">Clear Upload History</h4>
              <p className="text-[11px] text-slate-400 mt-1">Remove uploaded candidate records, clear reports, and reset predictions.</p>
            </div>
            <button
              disabled={loadingHistory}
              onClick={handleClearHistory}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              {loadingHistory ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              ) : (
                <Trash2 className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{loadingHistory ? 'Clearing...' : 'Clear History'}</span>
            </button>
          </div>

          {/* Delete Reports */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-extrabold text-white">Delete Generated Reports</h4>
              <p className="text-[11px] text-slate-400 mt-1">Delete all PDF and CSV files from reports/ folder.</p>
            </div>
            <button
              disabled={loadingReports}
              onClick={handleDeleteReports}
              className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-50 text-rose-300 border border-rose-500/30 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              {loadingReports ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
              ) : (
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span>{loadingReports ? 'Deleting...' : 'Delete Reports'}</span>
            </button>
          </div>

          {/* Download Logs */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-extrabold text-white">Download System Logs</h4>
              <p className="text-[11px] text-slate-400 mt-1">Export FastAPI server application execution logs.</p>
            </div>
            <button
              disabled={loadingLogs}
              onClick={handleDownloadLogs}
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-glow"
            >
              {loadingLogs ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{loadingLogs ? 'Downloading...' : 'Download Logs'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
