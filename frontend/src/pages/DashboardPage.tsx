import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Candidate, DashboardMetrics } from '../types';
import { UploadCloud, Trophy, Eye, FileText, CheckCircle2, User, Activity, Inbox, Filter, Sparkles, Layers, Trash2 } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    Promise.all([
      apiService.getDashboardMetrics(),
      apiService.getCandidates(),
    ]).then(([m, c]) => {
      setMetrics(m);
      setCandidates(c);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteCandidate = async (e: React.MouseEvent, candId: string, candName: string) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete candidate "${candName}"?`)) return;

    try {
      await apiService.deleteCandidate(candId);
      loadData();
    } catch (err) {
      alert("Failed to delete candidate. State restored.");
    }
  };

  const getInitials = (name: string) => {
    if (!name || name === 'Unknown') return 'UN';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading || !metrics) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        {/* Banner Skeleton */}
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 h-32"></div>
        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 h-36"></div>
          ))}
        </div>
        {/* List Skeleton */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 h-64"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="p-8 rounded-3xl glass-panel border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-[11px] font-bold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-brand-400" /> System Active
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            AI Resume Screening Dashboard
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Automated resume parsing, ML domain classification, and candidate management system.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            disabled={candidates.length === 0}
            onClick={() => navigate('/ranking')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
              candidates.length === 0
                ? 'bg-slate-900/60 border border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 text-brand-400" /> View Rankings
          </button>

          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-glow hover:brightness-110 transition-all"
          >
            <UploadCloud className="w-4 h-4" /> Upload Resume
          </button>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 md:p-8 rounded-3xl glass-card border border-slate-800 space-y-2 flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Processed</p>
          <h3 className="text-3xl md:text-4xl font-black text-white">{metrics.totalResumes}</h3>
          <p className="text-[11px] text-slate-500 font-medium pt-1">Uploaded & analyzed resumes</p>
        </div>

        <div className="p-6 md:p-8 rounded-3xl glass-card border border-brand-500/40 space-y-2 flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average ATS Score</p>
          <h3 className="text-3xl md:text-4xl font-black text-brand-400">{metrics.averageScore}%</h3>
          <p className="text-[11px] text-slate-500 font-medium pt-1">Mean candidate alignment</p>
        </div>

        <div className="p-6 md:p-8 rounded-3xl glass-card border border-emerald-500/30 space-y-2 flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shortlisted Candidates</p>
          <h3 className="text-3xl md:text-4xl font-black text-emerald-400">{metrics.shortlistedCount}</h3>
          <p className="text-[11px] text-slate-500 font-medium pt-1">High compatibility candidates</p>
        </div>

        <div className="p-6 md:p-8 rounded-3xl glass-card border border-slate-800 space-y-2 flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Target Role</p>
          <h3 className="text-xl md:text-2xl font-black text-indigo-300 truncate">{metrics.topRole}</h3>
          <p className="text-[11px] text-slate-500 font-medium pt-1">Primary job description</p>
        </div>
      </div>

      {/* Recruiter Hiring Pipeline Funnel */}
      {candidates.length > 0 && (
        <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-brand-400" /> Recruiter Hiring Pipeline Funnel
            </h3>
            <span className="text-xs font-semibold text-slate-400">5 Active Stages</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">1. Applied</span>
              <div className="text-xl font-black text-white">{candidates.length}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">2. Screening</span>
              <div className="text-xl font-black text-brand-300">{candidates.filter(c => c.matchScore >= 50).length}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">3. Shortlisted</span>
              <div className="text-xl font-black text-emerald-400">{metrics.shortlistedCount}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">4. Tech Round</span>
              <div className="text-xl font-black text-indigo-300">{candidates.filter(c => c.status === 'Technical Round').length}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">5. Hired</span>
              <div className="text-xl font-black text-amber-300">{candidates.filter(c => c.status === 'Hired' || c.status === 'Selected').length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Evaluated Candidates Section */}
      <div className="p-6 md:p-8 rounded-3xl glass-card border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-white">Evaluated Applicants ({candidates.length})</h3>
            <p className="text-xs text-slate-400 mt-0.5">Click any candidate to inspect detailed ATS analysis and extracted skills</p>
          </div>
          {candidates.length > 0 && (
            <button
              onClick={() => navigate('/ranking')}
              className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
            >
              View Rankings →
            </button>
          )}
        </div>

        {candidates.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/50 border border-slate-800/80 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 shadow-lg">
              <Inbox className="w-8 h-8 text-brand-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white">No candidates uploaded yet.</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Upload a PDF or DOCX resume to start analyzing ATS compatibility, ML domain predictions, and skill gaps.
              </p>
            </div>
            <button
              onClick={() => navigate('/upload')}
              className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold text-xs shadow-glow hover:brightness-110 transition-all flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" /> Upload Resume
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {candidates.map((c) => {
              const initials = getInitials(c.name);

              return (
                <div
                  key={c.id}
                  onClick={() => navigate(`/analysis/${c.id}`)}
                  className="p-4 md:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between hover:bg-slate-800/80 hover:border-slate-700 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 border border-brand-500/40 flex items-center justify-center font-black text-white text-xs shadow-glow shrink-0 group-hover:scale-105 transition-transform">
                      {initials}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-extrabold text-white group-hover:text-brand-300 transition-colors truncate">
                        {c.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-300">{c.appliedRole}</span>
                        <span>•</span>
                        <span className="text-slate-400">{c.email}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400 font-mono text-[10px]">
                          <FileText className="w-3 h-3 text-brand-400" /> {c.resumeFileName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-sm md:text-base font-black text-brand-400 block">{c.matchScore}%</span>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">ATS Score</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-brand-600 transition-colors">
                      <Eye className="w-4 h-4" />
                    </div>

                    <button
                      title="Delete candidate"
                      onClick={(e) => handleDeleteCandidate(e, c.id, c.name)}
                      className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
