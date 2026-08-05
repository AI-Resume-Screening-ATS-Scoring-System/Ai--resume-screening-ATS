import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Candidate, ResumeAnalysis, ScoreBreakdownMap, FeedbackSuggestion, HallucinationReport } from '../types';
import {
  ArrowLeft,
  Cpu,
  Clock,
  FileText,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Star,
  Download,
  Award,
  Check,
  X,
  Target,
  Lightbulb,
  ShieldCheck,
  Zap,
  Quote,
  UploadCloud,
  Info,
  TrendingUp,
  Copy,
  Calendar,
  HardDrive,
  HelpCircle,
  MessageSquare,
  Eye,
  Search,
  Filter,
  Trophy,
  Trash2
} from 'lucide-react';

export const ResumeAnalysisPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Stores
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state for /analysis list view
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [recruiterNotes, setRecruiterNotes] = useState<string[]>([]);
  const [newNoteInput, setNewNoteInput] = useState('');

  const loadData = () => {
    if (id) {
      apiService.getCandidateById(id).then((c) => {
        setCandidate(c);
        setRecruiterNotes(c?.notes || [
          "Candidate demonstrates strong technical alignment with core React and Python requirements.",
          "Recommend scheduling technical round 1."
        ]);
        setLoading(false);
      });
    } else {
      apiService.getCandidates().then((list) => {
        setAllCandidates(list);
        setCandidate(null);
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleDeleteCandidate = async (e: React.MouseEvent, candId: string, candName: string) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete candidate "${candName}"?`)) return;

    try {
      await apiService.deleteCandidate(candId);
      if (id) {
        navigate('/analysis');
      } else {
        loadData();
      }
    } catch (err) {
      alert("Failed to delete candidate. State restored.");
    }
  };

  const handleAddNote = () => {
    if (!newNoteInput.trim()) return;
    setRecruiterNotes((prev) => [...prev, newNoteInput.trim()]);
    setNewNoteInput('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // MODE 1: ALL ANALYZED RESUMES LIST VIEW (/analysis without candidateId)
  if (!id) {
    const filteredList = allCandidates.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      const domainStr = c.analysis?.predictedDomain || '';
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.appliedRole.toLowerCase().includes(q) ||
        c.resumeFileName.toLowerCase().includes(q) ||
        domainStr.toLowerCase().includes(q)
      );
    });

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Banner */}
        <div className="p-8 rounded-3xl glass-panel border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-[11px] font-bold uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-brand-400" /> Resume Library
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Analyzed Resume Reports ({allCandidates.length})
            </h1>
            <p className="text-xs text-slate-400">
              Select any candidate resume to inspect detailed ATS score breakdown, TF-IDF similarity, and hallucination reports.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/upload')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-glow hover:brightness-110 transition-all"
            >
              <UploadCloud className="w-4 h-4" /> Upload Resume
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {allCandidates.length > 0 && (
          <div className="p-4 rounded-2xl glass-card border border-slate-800 flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400 ml-2" />
            <input
              type="text"
              placeholder="Filter analyzed resumes by candidate name, email, domain, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-semibold"
            />
          </div>
        )}

        {/* EMPTY STATE */}
        {allCandidates.length === 0 ? (
          <div className="p-12 rounded-3xl glass-panel border border-slate-800 text-center flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto my-12 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 shadow-glow">
              <FileText className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white">No resume has been analyzed yet.</h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-lg mx-auto">
                Upload a resume to generate ATS compatibility, ML prediction, skill extraction, keyword matching, similarity score, and improvement suggestions.
              </p>
            </div>
            <button
              onClick={() => navigate('/upload')}
              className="mt-3 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs shadow-glow transition-all flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" /> Upload Resume
            </button>
          </div>
        ) : (
          /* CARD GRID OF ALL ANALYZED RESUMES */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.map((cand) => {
              const score = cand.matchScore;
              const sim = cand.analysis?.similarityScore ?? 78.4;
              const domain = cand.analysis?.predictedDomain || 'INFORMATION-TECHNOLOGY';

              return (
                <div
                  key={cand.id}
                  onClick={() => navigate(`/analysis/${cand.id}`)}
                  className="p-6 rounded-3xl glass-card border border-slate-800 hover:border-brand-500/50 cursor-pointer transition-all space-y-4 group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 border border-brand-500/40 flex items-center justify-center font-black text-white text-xs shadow-glow group-hover:scale-105 transition-transform">
                        {cand.name.charAt(0)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {cand.status}
                        </span>
                        <button
                          title="Delete Candidate"
                          onClick={(e) => handleDeleteCandidate(e, cand.id, cand.name)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-white group-hover:text-brand-300 transition-colors">
                        {cand.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{cand.email}</p>
                      <p className="text-[11px] text-slate-500 font-mono mt-1 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-brand-400" /> {cand.resumeFileName}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">ATS Score</span>
                        <span className="text-sm font-black text-brand-400">{score}%</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Similarity</span>
                        <span className="text-sm font-black text-indigo-300">{sim}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="font-bold text-emerald-400">{domain}</span>
                      <span className="text-slate-500">{cand.appliedDate || '2026-08-05'}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/analysis/${cand.id}`);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-brand-600 text-slate-200 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-800 mt-4"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Detailed Analysis
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // MODE 2: SINGLE CANDIDATE DETAILED VIEW MODE (/analysis/:id)
  if (!candidate || !candidate.analysis) {
    return (
      <div className="p-12 rounded-3xl glass-panel border border-slate-800 text-center flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto my-12 shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 shadow-glow">
          <FileText className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-white">Candidate profile not found.</h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-lg mx-auto">
            The specified candidate record does not exist or has been removed.
          </p>
        </div>
        <button
          onClick={() => navigate('/analysis')}
          className="mt-3 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-glow transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Resumes Directory
        </button>
      </div>
    );
  }

  const analysis: ResumeAnalysis = candidate.analysis;

  const atsScore = analysis.atsScore ?? analysis.overallScore ?? 86;
  const predictedDomain = analysis.predictedDomain || 'INFORMATION-TECHNOLOGY';
  const confidence = analysis.domainConfidence ?? 54.71;
  const processingTime = analysis.processingTime || '0.05 sec';
  const wordCount = analysis.wordCount ?? 420;
  const characterCount = analysis.characterCount ?? 2850;

  const similarityScore = analysis.similarityScore ?? 78.4;
  const missingSkills = analysis.similarityMissingSkills || analysis.missingSkills || [];
  const suggestions: FeedbackSuggestion[] = analysis.topSuggestions || [];

  const totalPotentialGains = suggestions.reduce((acc, sug) => {
    const impactNum = parseInt(sug.impact?.replace(/[^0-9]/g, '') || '3', 10);
    return acc + impactNum;
  }, 0);
  const estimatedPotentialAts = Math.min(100, atsScore + (totalPotentialGains || 11));

  const defaultBreakdown: ScoreBreakdownMap = {
    technical_skills: { score: 0, max: 30, reason: "Evaluated based on skills.", evidence: "Skills extracted." },
    keyword_match: { score: 0, max: 20, reason: "Evaluated keywords.", evidence: "Keywords extracted." },
    experience: { score: 0, max: 15, reason: "Evaluated experience.", evidence: "Tenure extracted." },
    education: { score: 0, max: 10, reason: "Evaluated degree.", evidence: "Degree extracted." },
    projects: { score: 0, max: 10, reason: "Evaluated projects.", evidence: "Projects extracted." },
    certifications: { score: 0, max: 5, reason: "Evaluated certifications.", evidence: "Certifications extracted." },
    contact: { score: 0, max: 5, reason: "Evaluated contact details.", evidence: "Contact details extracted." },
    sections: { score: 0, max: 5, reason: "Evaluated completeness.", evidence: "Headings extracted." }
  };

  const breakdown: ScoreBreakdownMap = analysis.scoreBreakdown || defaultBreakdown;

  const radiusATS = 36;
  const circumferenceATS = 2 * Math.PI * radiusATS;
  const scoreOffsetATS = circumferenceATS - (Math.min(100, Math.max(0, atsScore)) / 100) * circumferenceATS;

  const breakdownCategories = [
    { key: 'technical_skills', label: 'Technical Skills (30%)', item: breakdown.technical_skills, color: 'bg-brand-500' },
    { key: 'keyword_match', label: 'Keyword Match (20%)', item: breakdown.keyword_match, color: 'bg-indigo-500' },
    { key: 'experience', label: 'Experience (15%)', item: breakdown.experience, color: 'bg-emerald-500' },
    { key: 'education', label: 'Education (10%)', item: breakdown.education, color: 'bg-blue-500' },
    { key: 'projects', label: 'Projects (10%)', item: breakdown.projects, color: 'bg-purple-500' },
    { key: 'certifications', label: 'Certifications (5%)', item: breakdown.certifications, color: 'bg-amber-500' },
    { key: 'contact', label: 'Contact Info (5%)', item: breakdown.contact, color: 'bg-teal-500' },
    { key: 'sections', label: 'Resume Completeness (5%)', item: breakdown.sections, color: 'bg-rose-500' },
  ];

  const handleCopySummary = () => {
    const summaryText = `Candidate: ${candidate.name}\nRole: ${candidate.appliedRole}\nATS Score: ${atsScore}/100\nSimilarity: ${similarityScore}%\nDomain: ${predictedDomain} (${confidence}%)\nStatus: ${candidate.status}`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Navigation & Quick Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/analysis')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Resumes Directory
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-xs hover:text-white transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-400" /> {copied ? 'Summary Copied!' : 'Copy Summary'}
          </button>
          <button
            onClick={() => candidate && apiService.downloadAnalysisPdf(candidate)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-xs hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-brand-400" /> Export Analysis PDF
          </button>
          <button
            onClick={(e) => handleDeleteCandidate(e, candidate.id, candidate.name)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-semibold text-xs hover:bg-rose-500/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Delete Profile
          </button>
        </div>
      </div>

      {/* Candidate Comprehensive Profile Header Banner */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-glow shrink-0">
              {candidate.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white">{candidate.name}</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {candidate.email} • {candidate.resumeFileName}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold">
              Role: {candidate.appliedRole}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              Status: {candidate.status}
            </span>
          </div>
        </div>

        {/* 8 Detailed Metadata Badges Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-1">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Target Role</span>
            <span className="text-xs font-extrabold text-white truncate block">{candidate.appliedRole}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">ML Domain</span>
            <span className="text-xs font-extrabold text-brand-300 truncate block">{predictedDomain}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">ATS Score</span>
            <span className="text-xs font-black text-brand-400 block">{atsScore}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Similarity</span>
            <span className="text-xs font-black text-indigo-300 block">{similarityScore}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Confidence</span>
            <span className="text-xs font-black text-emerald-400 block">{confidence}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Status</span>
            <span className="text-xs font-extrabold text-emerald-300 truncate block">{candidate.status}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Upload Date</span>
            <span className="text-xs font-semibold text-slate-300 truncate block">{candidate.appliedDate || '2026-08-05'}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Text Length</span>
            <span className="text-xs font-semibold text-slate-300 block">{wordCount} words</span>
          </div>
        </div>
      </div>

      {/* ATS SCORE & ESTIMATED ATS IMPROVEMENT ESTIMATOR ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 p-6 rounded-3xl glass-card border border-brand-500/30 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" /> ATS Score
            </div>
            <button
              onClick={() => setActiveTooltip(activeTooltip === 'ats' ? null : 'ats')}
              className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <Info className="w-4 h-4 text-brand-400" />
            </button>
          </div>

          <div className="relative w-36 h-36 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={radiusATS} stroke="rgba(30, 41, 59, 1)" strokeWidth="10" fill="transparent" />
              <circle
                cx="50"
                cy="50"
                r={radiusATS}
                stroke="#0c8ee9"
                strokeWidth="10"
                strokeDasharray={circumferenceATS}
                strokeDashoffset={scoreOffsetATS}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{atsScore}</span>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">/ 100</span>
            </div>
          </div>

          <div className="w-full p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 text-left space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold">
              <span className="text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Estimated ATS Potential
              </span>
              <span className="text-emerald-400">+{estimatedPotentialAts - atsScore} Points</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Current Score</span>
                <span className="text-sm font-black text-white">{atsScore}</span>
              </div>
              <span className="text-slate-500 font-extrabold text-lg">→</span>
              <div className="text-center">
                <span className="text-[10px] font-bold text-emerald-400 uppercase block">Estimated ATS</span>
                <span className="text-sm font-black text-emerald-400">{estimatedPotentialAts}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-400" /> Weighted Score Breakdown
            </h3>
            <span className="text-xs font-bold text-brand-400">Total: {atsScore} / 100 Points</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {breakdownCategories.map((cat) => {
              const scoreVal = cat.item.score;
              const maxVal = cat.item.max;
              const pct = maxVal > 0 ? (scoreVal / maxVal) * 100 : 0;

              return (
                <div key={cat.key} className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{cat.label}</span>
                    <span className="font-extrabold text-white">
                      {scoreVal} <span className="text-slate-500 font-medium">/ {maxVal}</span>
                    </span>
                  </div>

                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
                    <div
                      className={`h-full rounded-full ${cat.color} transition-all duration-500`}
                      style={{ width: `${Math.min(100, Math.max(3, pct))}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI TECHNICAL INTERVIEW QUESTIONS & RECRUITER NOTES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl glass-panel border border-brand-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-brand-400" /> AI Technical Interview Questions
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Skill Gaps</span>
          </div>
          <div className="space-y-2.5 text-xs">
            {missingSkills.length > 0 ? (
              missingSkills.slice(0, 3).map((sk, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <span className="text-brand-300 font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3 text-brand-400" /> {sk} Assessment:
                  </span>
                  <p className="text-slate-200 text-[11px] leading-relaxed">
                    "How would you implement and scale {sk} in a high-throughput microservices environment?"
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-xs">Candidate covers all required skills.</p>
            )}
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" /> Recruiter Notes ({recruiterNotes.length})
            </h2>
          </div>
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1 text-xs">
            {recruiterNotes.map((note, nidx) => (
              <div key={nidx} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200">
                {note}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="Add interview note..."
              value={newNoteInput}
              onChange={(e) => setNewNoteInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={handleAddNote}
              className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs"
            >
              Add Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
