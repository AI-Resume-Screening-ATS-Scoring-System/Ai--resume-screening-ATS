import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { DomainClassificationResult } from '../types';
import {
  UploadCloud,
  FileText,
  Cpu,
  AlertCircle,
  X,
  CheckCircle2,
  Sparkles,
  Play,
  Trash2,
  Trophy,
  Check,
  Zap
} from 'lucide-react';

interface QueueFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'queued' | 'uploading' | 'analyzing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  atsScore?: number;
  predictedDomain?: string;
}

export const UploadResumePage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'single' | 'bulk'>('single');

  // Single Resume State
  const [selectedSingleFile, setSelectedSingleFile] = useState<File | null>(null);
  const [singleUploading, setSingleUploading] = useState<boolean>(false);

  // Bulk Upload Queue State
  const [queue, setQueue] = useState<QueueFileItem[]>([]);
  const [bulkUploading, setBulkUploading] = useState<boolean>(false);

  // Common State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [jobDescription, setJobDescription] = useState<string>(
    "We are seeking a Senior Full Stack Engineer experienced in React, TypeScript, Python, FastAPI, PostgreSQL, Docker, Kubernetes, AWS, and Microservices."
  );

  // Batch Result Summary State
  const [batchSummary, setBatchSummary] = useState<{
    totalUploaded: number;
    totalSuccess: number;
    totalFailed: number;
    averageAts: number;
    highestAts: number;
    lowestAts: number;
    topCandidateName: string;
    topCandidateAts: number;
  } | null>(null);

  // Single Resume File Process Handler
  const processSingleFile = (file: File) => {
    setErrorMessage(null);
    const ext = file.name ? file.name.split('.').pop()?.toLowerCase() : '';
    if (ext && !['pdf', 'docx', 'doc'].includes(ext)) {
      setErrorMessage(`Unsupported file format '.${ext}'. Only PDF and DOCX resume documents are supported.`);
      setSelectedSingleFile(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage(`File size exceeds maximum 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      setSelectedSingleFile(null);
      return;
    }
    if (file.size === 0) {
      setErrorMessage(`The uploaded file is empty (0 bytes). Please select a valid document.`);
      setSelectedSingleFile(null);
      return;
    }

    setSelectedSingleFile(file);
  };

  const handleSingleSubmit = async () => {
    if (!selectedSingleFile || singleUploading) return;

    setSingleUploading(true);
    setErrorMessage(null);

    try {
      const mlResult: DomainClassificationResult = await apiService.uploadResumeEndpoint(selectedSingleFile, jobDescription);
      const candidate = await apiService.uploadAndAnalyzeResume(selectedSingleFile, 'jd-1', mlResult);

      setSingleUploading(false);
      navigate(`/analysis/${candidate.id}`);
    } catch (err: any) {
      setSingleUploading(false);
      setErrorMessage(
        err.message || 'Unable to connect to FastAPI backend server. Please verify that the backend server is running.'
      );
    }
  };

  // Helper to validate and add files to batch queue
  const addFilesToQueue = (filesList: FileList | File[]) => {
    setErrorMessage(null);
    const newItems: QueueFileItem[] = [];
    const duplicateNames: string[] = [];

    Array.from(filesList).forEach((file) => {
      const ext = file.name ? file.name.split('.').pop()?.toLowerCase() : '';
      if (!ext || !['pdf', 'docx', 'doc'].includes(ext)) {
        return;
      }
      if (file.size > 10 * 1024 * 1024 || file.size === 0) {
        return;
      }

      const isDup = queue.some((q) => q.name === file.name);
      if (isDup) {
        duplicateNames.push(file.name);
        return;
      }

      newItems.push({
        id: `q-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        file: file,
        name: file.name,
        size: file.size,
        type: ext.toUpperCase(),
        status: 'queued',
        progress: 0
      });
    });

    if (duplicateNames.length > 0) {
      setErrorMessage(`Skipped ${duplicateNames.length} duplicate file(s): ${duplicateNames.slice(0, 2).join(', ')}`);
    }

    if (newItems.length > 0) {
      setQueue((prev) => [...prev, ...newItems]);
      setBatchSummary(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDropSingle = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSingleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDropBulk = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToQueue(e.dataTransfer.files);
    }
  };

  const handleRemoveFromQueue = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearQueue = () => {
    if (bulkUploading) return;
    setQueue([]);
    setBatchSummary(null);
  };

  // Start Batch Upload Execution
  const handleStartBatchUpload = async () => {
    if (queue.length === 0 || bulkUploading) return;

    setBulkUploading(true);
    setErrorMessage(null);

    const queuedFiles = queue.map((q) => q.file);

    setQueue((prev) =>
      prev.map((item) => ({ ...item, status: 'uploading', progress: 50 }))
    );

    try {
      const res = await apiService.uploadResumesBulkEndpoint(queuedFiles, jobDescription);

      setQueue((prev) =>
        prev.map((item) => {
          const matchResult = (res.results || []).find((r: any) => r.filename === item.name);
          if (matchResult) {
            return {
              ...item,
              status: 'completed',
              progress: 100,
              atsScore: matchResult.ats_score,
              predictedDomain: matchResult.predicted_domain
            };
          } else {
            return {
              ...item,
              status: 'failed',
              progress: 0,
              error: 'Processing failed'
            };
          }
        })
      );

      setBatchSummary({
        totalUploaded: res.total_uploaded || queuedFiles.length,
        totalSuccess: res.total_success || res.results?.length || 0,
        totalFailed: res.total_failed || 0,
        averageAts: res.average_ats_score || 0,
        highestAts: res.highest_ats_score || 0,
        lowestAts: res.lowest_ats_score || 0,
        topCandidateName: res.top_candidate_name || 'Top Applicant',
        topCandidateAts: res.top_candidate_ats || 0
      });

      setBulkUploading(false);
    } catch (err: any) {
      setBulkUploading(false);
      setErrorMessage(
        err.message || 'Bulk upload failed. Please verify that the FastAPI backend server is running.'
      );
      setQueue((prev) =>
        prev.map((item) => ({ ...item, status: 'failed', progress: 0, error: 'Connection error' }))
      );
    }
  };

  // Batch Stats
  const completedCount = useMemo(() => queue.filter((q) => q.status === 'completed').length, [queue]);
  const totalSizeMb = useMemo(() => (queue.reduce((acc, q) => acc + q.size, 0) / (1024 * 1024)).toFixed(1), [queue]);
  const overallProgress = useMemo(() => {
    if (queue.length === 0) return 0;
    return Math.round((completedCount / queue.length) * 100);
  }, [queue, completedCount]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Toast Notification Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="font-bold text-rose-200">Validation Alert</p>
              <p className="text-[11px] text-rose-300/90 mt-0.5">{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-500/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Mode Switcher */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <UploadCloud className="w-6 h-6 text-brand-400" />
            {mode === 'single' ? 'Single Resume Upload & Analysis' : 'Enterprise Batch Resume Upload'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'single'
              ? 'Upload a single PDF or DOCX resume document for instant ML classification and ATS scoring.'
              : 'Upload multiple PDF & DOCX resume files for automated batch ML classification, ATS scoring, and ranking.'}
          </p>
        </div>

        {/* Workflow Mode Tabs */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => {
              setMode('single');
              setErrorMessage(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'single'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Single Resume
          </button>
          <button
            onClick={() => {
              setMode('bulk');
              setErrorMessage(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'bulk'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Batch Upload
          </button>
        </div>
      </div>

      {/* Target Job Description Selection Box */}
      <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-2">
        <label className="text-xs font-extrabold text-slate-200 flex items-center justify-between">
          <span>Target Job Description (Matching Criteria)</span>
          <span className="text-[10px] text-brand-400 font-bold">Active Position Criteria</span>
        </label>
        <textarea
          rows={2}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste job description keywords and tech stack requirements..."
          className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-brand-500 focus:outline-none font-medium leading-relaxed resize-none"
        ></textarea>
      </div>

      {/* WORKFLOW 1: SINGLE RESUME MODE (CLEAN & ISOLATED SINGLE RESUME WORKFLOW) */}
      {mode === 'single' && (
        <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-5 animate-fade-in">
          {!selectedSingleFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDropSingle}
              className={`border-2 border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center transition-all ${
                dragActive
                  ? 'border-brand-500 bg-brand-500/10 shadow-glow'
                  : 'border-slate-800 hover:border-brand-500/40 bg-slate-900/40'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 mb-3 shadow-glow">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-white">
                {dragActive ? 'Drop Single Resume Here' : 'Drag & Drop Single Resume File'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Supports PDF or DOCX format • Maximum file size 10MB</p>

              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={(e) => e.target.files && e.target.files[0] && processSingleFile(e.target.files[0])}
                className="hidden"
                id="single-resume-input"
              />
              <label
                htmlFor="single-resume-input"
                className="mt-4 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer transition-colors border border-slate-700 shadow-sm flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-brand-400" /> Browse Computer
              </label>
            </div>
          ) : (
            /* Selected Single Resume Card */
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/30">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-white flex items-center gap-2">
                    {selectedSingleFile.name} <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {(selectedSingleFile.size / 1024).toFixed(1)} KB • Ready for automated ML analysis
                  </p>
                </div>
              </div>

              {!singleUploading && (
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => e.target.files && e.target.files[0] && processSingleFile(e.target.files[0])}
                    className="hidden"
                    id="replace-single-input"
                  />
                  <label
                    htmlFor="replace-single-input"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs cursor-pointer"
                  >
                    Replace Resume
                  </label>

                  <button
                    onClick={() => setSelectedSingleFile(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Loading Indicator for Single Resume Mode */}
          {singleUploading && (
            <div className="p-4 rounded-xl bg-slate-900 border border-brand-500/40 flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"></div>
              <div>
                <p className="text-xs font-bold text-brand-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-brand-400 animate-pulse" /> Analyzing Resume...
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Extracting text, predicting ML domain category, and calculating ATS similarity</p>
              </div>
            </div>
          )}

          {/* Single Resume Action Button */}
          <button
            disabled={!selectedSingleFile || singleUploading}
            onClick={handleSingleSubmit}
            className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              selectedSingleFile && !singleUploading
                ? 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-glow'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {singleUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing Resume...</span>
              </>
            ) : (
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-300" /> Analyze Resume
              </span>
            )}
          </button>
        </div>
      )}

      {/* WORKFLOW 2: BATCH UPLOAD MODE (ENTERPRISE BATCH PROCESSOR) */}
      {mode === 'bulk' && (
        <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4 animate-fade-in">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDropBulk}
            className={`border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center transition-all ${
              dragActive
                ? 'border-brand-500 bg-brand-500/10 shadow-glow'
                : 'border-slate-800 hover:border-brand-500/40 bg-slate-900/40'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 mb-3 shadow-glow">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-white">
              {dragActive ? 'Drop Resumes Now' : 'Drag & Drop Multiple Resume Files Here'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports PDF and DOCX files • Max 10MB per file • Batch processing up to 100 resumes
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.doc"
                onChange={(e) => e.target.files && e.target.files.length > 0 && addFilesToQueue(e.target.files)}
                className="hidden"
                id="bulk-resume-input"
              />
              <label
                htmlFor="bulk-resume-input"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer transition-colors border border-slate-700 shadow-sm flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-brand-400" /> Browse Files
              </label>
            </div>
          </div>

          {/* Upload Queue Toolbar & Stats */}
          {queue.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-300">
                  <span className="font-extrabold text-white">Upload Queue ({queue.length} files)</span>
                  <span>•</span>
                  <span>Total Size: <strong>{totalSizeMb} MB</strong></span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">{completedCount} Done</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={bulkUploading}
                    onClick={handleClearQueue}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-400 hover:text-white font-bold text-xs transition-colors flex items-center gap-1 border border-slate-800"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Clear Queue
                  </button>

                  <button
                    disabled={bulkUploading || queue.length === 0}
                    onClick={handleStartBatchUpload}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs shadow-glow disabled:opacity-40 transition-all flex items-center gap-2"
                  >
                    {bulkUploading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Analyzing Batch...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" /> Start Batch Upload ({queue.length})
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Overall Batch Upload Progress Bar */}
              {bulkUploading && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-brand-500/40 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-brand-300 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-brand-400 animate-pulse" /> Batch Processing Progress
                    </span>
                    <span className="text-brand-400 font-mono">{overallProgress}% Completed</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(5, overallProgress))}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Queue Item Cards Grid */}
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {queue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4 text-xs font-semibold"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                        <FileText className="w-4 h-4 text-brand-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-white truncate max-w-xs">{item.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {(item.size / 1024).toFixed(1)} KB • {item.type}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {item.status === 'completed' && (
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-sm font-black text-brand-400 block">{item.atsScore}%</span>
                            <span className="text-[9px] font-mono text-slate-400 uppercase">{item.predictedDomain}</span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-400" /> Analyzed
                          </span>
                        </div>
                      )}

                      {item.status === 'uploading' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-300 border border-brand-500/30 flex items-center gap-1">
                          <div className="w-3 h-3 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"></div>
                          Analyzing...
                        </span>
                      )}

                      {item.status === 'queued' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                          Queued
                        </span>
                      )}

                      {!bulkUploading && (
                        <button
                          onClick={() => handleRemoveFromQueue(item.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Post-Analysis Batch Completion Summary Card (Only rendered in Batch Upload mode) */}
      {mode === 'bulk' && batchSummary && (
        <div className="p-6 rounded-3xl glass-panel border border-emerald-500/30 space-y-6 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-glow">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400">Batch Analysis Complete</span>
                <h2 className="text-lg font-extrabold text-white mt-0.5">Resume Batch Results Summary</h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/ranking')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold text-xs shadow-glow hover:brightness-110 transition-all"
              >
                <Trophy className="w-4 h-4" /> View Candidate Rankings
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Uploaded</span>
              <div className="text-2xl font-black text-white">{batchSummary.totalUploaded} Resumes</div>
              <p className="text-[10px] text-emerald-400">{batchSummary.totalSuccess} Processed Successfully</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Batch Average ATS</span>
              <div className="text-2xl font-black text-brand-400">{batchSummary.averageAts}%</div>
              <p className="text-[10px] text-slate-400">Mean Candidate Match</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Highest ATS Score</span>
              <div className="text-2xl font-black text-emerald-400">{batchSummary.highestAts}%</div>
              <p className="text-[10px] text-slate-400">Top Candidate Match</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Top Applicant</span>
              <div className="text-base font-extrabold text-indigo-300 truncate">{batchSummary.topCandidateName}</div>
              <p className="text-[10px] text-emerald-400 font-bold">{batchSummary.topCandidateAts}% Compatibility</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
