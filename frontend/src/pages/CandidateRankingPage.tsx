import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, RankedCandidateResult } from '../services/api';
import { CandidateStatus } from '../types';
import {
  Trophy,
  Search,
  Filter,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  Award,
  Sparkles,
  Zap,
  Users,
  CheckCircle2,
  X,
  Trash2
} from 'lucide-react';

type SortField = 'rank' | 'candidate' | 'ats' | 'similarity' | 'confidence';
type SortOrder = 'asc' | 'desc';

export const CandidateRankingPage: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<RankedCandidateResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter, Sort, Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Candidate Comparison Modal State
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const loadCandidates = () => {
    apiService.getCandidates().then((cands) => {
      const mapped: RankedCandidateResult[] = cands.map((c, idx) => ({
        rank: idx + 1,
        id: c.id,
        candidate: c.name,
        filename: c.resumeFileName,
        domain: c.analysis?.predictedDomain || 'INFORMATION-TECHNOLOGY',
        confidence: c.analysis?.domainConfidence ?? 88.5,
        ats: c.matchScore,
        similarity: c.analysis?.similarityScore ?? 78.4,
        status: c.status || (c.matchScore >= 80 ? 'Shortlisted' : c.matchScore >= 60 ? 'Under Review' : 'Rejected'),
        matched_skills: c.analysis?.matchingSkills || c.topSkills,
        missing_skills: c.analysis?.missingSkills || []
      }));

      mapped.sort((a, b) => b.ats - a.ats);
      mapped.forEach((item, index) => {
        item.rank = index + 1;
      });

      setCandidates(mapped);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const handleDeleteCandidate = async (e: React.MouseEvent, candId: string, candName: string) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete candidate "${candName}"?`)) return;

    try {
      await apiService.deleteCandidate(candId);
      loadCandidates();
    } catch (err) {
      alert("Failed to delete candidate. State restored.");
    }
  };

  // Handle Pipeline Status Change directly from Ranking Table
  const handleStatusChange = (candId: string, newStatus: CandidateStatus) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candId ? { ...c, status: newStatus } : c))
    );
  };

  // Toggle candidate selection for comparison
  const toggleCompareSelection = (candId: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(candId)) {
        return prev.filter((id) => id !== candId);
      }
      if (prev.length >= 2) {
        return [prev[1], candId];
      }
      return [...prev, candId];
    });
  };

  // Highest Scores IDs for Badge Highlights
  const highestAtsId = useMemo(() => {
    if (candidates.length === 0) return null;
    return [...candidates].sort((a, b) => b.ats - a.ats)[0]?.id;
  }, [candidates]);

  const highestSimId = useMemo(() => {
    if (candidates.length === 0) return null;
    return [...candidates].sort((a, b) => b.similarity - a.similarity)[0]?.id;
  }, [candidates]);

  // Filter & Search Logic across Name, Domain, Filename, Status & Skills
  const filteredCandidates = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return candidates.filter((item) => {
      const skillsStr = (item.matched_skills || []).join(' ').toLowerCase();
      const matchesSearch =
        !q ||
        item.candidate.toLowerCase().includes(q) ||
        item.domain.toLowerCase().includes(q) ||
        item.filename.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        skillsStr.includes(q);

      const matchesDomain =
        selectedDomain === 'ALL' || item.domain === selectedDomain;

      const matchesStatus =
        selectedStatus === 'ALL' || item.status === selectedStatus;

      return matchesSearch && matchesDomain && matchesStatus;
    });
  }, [candidates, searchQuery, selectedDomain, selectedStatus]);

  // Sort Logic
  const sortedCandidates = useMemo(() => {
    const copy = [...filteredCandidates];
    copy.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filteredCandidates, sortField, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedCandidates.length / pageSize) || 1;
  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedCandidates.slice(start, start + pageSize);
  }, [sortedCandidates, currentPage, pageSize]);

  // Available Domains for Filter Dropdown
  const uniqueDomains = useMemo(() => {
    const domains = new Set(candidates.map((c) => c.domain));
    return Array.from(domains);
  }, [candidates]);

  const compareObjects = useMemo(() => {
    return candidates.filter((c) => selectedForCompare.includes(c.id));
  }, [candidates, selectedForCompare]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'rank' ? 'asc' : 'desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-500" />;
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-brand-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-brand-400" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="p-8 rounded-3xl glass-panel border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-[11px] font-bold uppercase tracking-wider">
            <Trophy className="w-3 h-3 text-brand-400" /> Candidate Leaderboard
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Candidate Ranking Matrix
          </h1>
          <p className="text-xs text-slate-400">
            Rank applicants by ATS Compatibility Score, TF-IDF Similarity, and ML Classification.
          </p>
        </div>

        {/* Action Export & Compare Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {selectedForCompare.length >= 2 && (
            <button
              onClick={() => setCompareModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow transition-all"
            >
              <Users className="w-4 h-4" /> Compare Selected ({selectedForCompare.length})
            </button>
          )}

          <button
            disabled={sortedCandidates.length === 0}
            onClick={() => apiService.downloadRankingCsv(sortedCandidates)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 border border-slate-800 text-emerald-400 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export CSV
          </button>

          <button
            disabled={sortedCandidates.length === 0}
            onClick={() => apiService.downloadRankingPdf(sortedCandidates)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 border border-slate-800 text-brand-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-brand-400" /> Export PDF
          </button>
        </div>
      </div>

      {/* Side-by-Side Candidate Comparison Modal */}
      {compareModalOpen && compareObjects.length >= 2 && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" /> Side-by-Side Candidate Comparison
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Comparing top candidate match scores, skills, and ML domain predictions</p>
              </div>
              <button
                onClick={() => setCompareModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {compareObjects.map((c, idx) => (
                <div key={c.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-brand-400 uppercase">Candidate #{idx + 1}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                      Rank #{c.rank}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-white">{c.candidate}</h4>
                    <p className="text-xs text-slate-400">{c.filename}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">ATS Score:</span>
                      <span className="font-black text-brand-400">{c.ats}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">TF-IDF Similarity:</span>
                      <span className="font-black text-indigo-300">{c.similarity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ML Domain:</span>
                      <span className="font-bold text-emerald-400">{c.domain} ({c.confidence}%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pipeline Status:</span>
                      <span className="font-bold text-white">{c.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div className="p-5 rounded-3xl glass-panel border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate name, domain, filename, or skills..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDomain}
              onChange={(e) => {
                setSelectedDomain(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Domains</option>
              {uniqueDomains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Technical Round">Technical Round</option>
              <option value="HR Round">HR Round</option>
              <option value="Hired">Hired</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Ranking Table */}
      <div className="rounded-3xl glass-card border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-5 w-10">Compare</th>
                <th
                  onClick={() => handleSort('rank')}
                  className="py-4 px-5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Rank</span>
                    {getSortIcon('rank')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('candidate')}
                  className="py-4 px-5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Candidate Name</span>
                    {getSortIcon('candidate')}
                  </div>
                </th>

                <th className="py-4 px-5">Domain</th>

                <th
                  onClick={() => handleSort('ats')}
                  className="py-4 px-5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>ATS Score</span>
                    {getSortIcon('ats')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('similarity')}
                  className="py-4 px-5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Similarity</span>
                    {getSortIcon('similarity')}
                  </div>
                </th>

                <th className="py-4 px-5">Pipeline Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-semibold">
              {paginatedCandidates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-bold">
                    No candidates match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedCandidates.map((c) => {
                  const isBest = c.rank === 1;
                  const isHighestAts = c.id === highestAtsId;
                  const isHighestSim = c.id === highestSimId;
                  const isChecked = selectedForCompare.includes(c.id);

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-900/60 transition-colors group"
                    >
                      <td className="py-4 px-5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCompareSelection(c.id)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-brand-500 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      <td className="py-4 px-5 font-black text-slate-200">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-extrabold text-xs ${
                          c.rank === 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-glow' :
                          c.rank === 2 ? 'bg-slate-300/20 text-slate-200 border border-slate-400/40' :
                          c.rank === 3 ? 'bg-amber-700/20 text-amber-400 border border-amber-600/40' :
                          'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}>
                          #{c.rank}
                        </span>
                      </td>

                      <td className="py-4 px-5 font-bold text-white">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="group-hover:text-brand-300 transition-colors text-sm font-extrabold">
                              {c.candidate}
                            </span>
                            {isBest && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Best Candidate
                              </span>
                            )}
                            {isHighestAts && !isBest && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-brand-500/20 text-brand-300 border border-brand-500/40">
                                Highest ATS
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 block">
                            {c.filename}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold text-[11px]">
                          {c.domain}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <span className="font-extrabold text-brand-400 text-sm">{c.ats}%</span>
                      </td>

                      <td className="py-4 px-5">
                        <span className="font-bold text-indigo-300">{c.similarity}%</span>
                      </td>

                      <td className="py-4 px-5">
                        <select
                          value={c.status}
                          onChange={(e) => handleStatusChange(c.id, e.target.value as CandidateStatus)}
                          className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs font-bold text-emerald-400 focus:outline-none focus:border-brand-500 cursor-pointer"
                        >
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Technical Round">Technical Round</option>
                          <option value="HR Round">HR Round</option>
                          <option value="Selected">Selected</option>
                          <option value="Hired">Hired</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/analysis/${c.id}`)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-brand-600 border border-slate-800 text-slate-300 hover:text-white font-bold text-[11px] transition-all flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" /> Inspect
                          </button>
                          <button
                            title="Delete candidate"
                            onClick={(e) => handleDeleteCandidate(e, c.id, c.candidate)}
                            className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/10 border border-slate-800 text-slate-400 hover:text-rose-400 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold text-slate-400">
          <div>
            Showing <strong className="text-white">{sortedCandidates.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-white">{Math.min(currentPage * pageSize, sortedCandidates.length)}</strong> of{' '}
            <strong className="text-white">{sortedCandidates.length}</strong> candidates
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 text-white transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>

            <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 text-white transition-colors flex items-center gap-1"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
