export type CandidateStatus = 
  | 'Applied'
  | 'Screening'
  | 'Shortlisted'
  | 'Technical Round'
  | 'HR Round'
  | 'Interview Scheduled'
  | 'Selected'
  | 'Rejected'
  | 'Offer Sent'
  | 'Hired'
  | 'Withdrawn'
  | 'Archive'
  | 'Under Review';

export interface DomainPrediction {
  domain: string;
  confidence: number;
}

export interface ScoreBreakdownItem {
  score: number;
  max: number;
  reason?: string;
  evidence?: string;
}

export interface ScoreBreakdownMap {
  technical_skills: ScoreBreakdownItem;
  keyword_match: ScoreBreakdownItem;
  experience: ScoreBreakdownItem;
  education: ScoreBreakdownItem;
  projects: ScoreBreakdownItem;
  certifications: ScoreBreakdownItem;
  contact: ScoreBreakdownItem;
  sections: ScoreBreakdownItem;
}

export interface FeedbackSuggestion {
  category: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  impact?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  timeRequired?: string;
}

export interface ValidatedSuggestion {
  category: string;
  suggestion: string;
  description: string;
  evidence: string;
  confidence: number;
  status: 'Supported' | 'Grounded' | 'Unsupported';
}

export interface HallucinationReport {
  hallucination_rate: number;
  grounded_suggestions: number;
  supported_suggestions: number;
  unsupported_suggestions: number;
  total_evaluated: number;
  validated_suggestions: ValidatedSuggestion[];
}

export interface DomainClassificationResult {
  status: string;
  filename?: string;
  extracted_text?: string;
  structured_data?: {
    name?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    skills?: string[];
    education?: string[];
    experience?: string[];
    projects?: string[];
    certifications?: string[];
    languages?: string[];
  };
  word_count?: number;
  character_count?: number;
  predicted_domain: string;
  confidence: number;
  top_predictions: DomainPrediction[];
  processing_time: string;
  ats_score?: number;
  score_breakdown?: ScoreBreakdownMap;
  matched_skills?: string[];
  missing_skills?: string[];
  additional_skills?: string[];
  strengths?: string[];
  weaknesses?: string[];
  similarity_score?: number;
  similarity_matched_keywords?: string[];
  similarity_missing_keywords?: string[];
  keyword_coverage_pct?: number;
  similarity_matched_skills?: string[];
  similarity_missing_skills?: string[];
  top_matching_sentences?: string[];
  top_suggestions?: FeedbackSuggestion[];
  hallucination_report?: HallucinationReport;
}

export interface SkillMatch {
  name: string;
  matched: boolean;
  proficiency?: 'Expert' | 'Intermediate' | 'Beginner';
  yearsRequired?: number;
  importance?: 'Required' | 'Preferred' | 'Optional';
}

export interface ExtractedExperience {
  title: string;
  company: string;
  duration: string;
  description: string;
  highlights: string[];
}

export interface ResumeAnalysis {
  id: string;
  candidateId: string;
  overallScore: number;
  hardSkillsScore: number;
  softSkillsScore: number;
  experienceScore: number;
  educationScore: number;
  formatScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  suggestedKeywords: string[];
  experienceList: ExtractedExperience[];
  educationList: string[];
  summary: string;
  strengths: string[];
  redFlags: string[];
  recommendedRole: string;

  // ML, Similarity, Feedback & Hallucination Data
  predictedDomain?: string;
  domainConfidence?: number;
  processingTime?: string;
  wordCount?: number;
  characterCount?: number;
  topPredictions?: DomainPrediction[];
  atsScore?: number;
  scoreBreakdown?: ScoreBreakdownMap;
  weaknesses?: string[];
  similarityScore?: number;
  similarityMatchedKeywords?: string[];
  similarityMissingKeywords?: string[];
  keywordCoveragePct?: number;
  similarityMatchedSkills?: string[];
  similarityMissingSkills?: string[];
  topMatchingSentences?: string[];
  topSuggestions?: FeedbackSuggestion[];
  hallucinationReport?: HallucinationReport;
  structuredData?: {
    name?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    skills?: string[];
    education?: string[];
    experience?: string[];
    projects?: string[];
    certifications?: string[];
    languages?: string[];
  };
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  appliedRole: string;
  experienceYears: number;
  matchScore: number;
  status: CandidateStatus;
  appliedDate: string;
  resumeFileName: string;
  location: string;
  education: string;
  topSkills: string[];
  analysis?: ResumeAnalysis;
  evaluationNotes?: string;
  technicalRating?: number;
  cultureRating?: number;
  isFavorite?: boolean;
  notes?: string[];
  interviewQuestions?: string[];
}

export interface JobDescription {
  id: string;
  title: string;
  department: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minExperience: number;
  description: string;
  isFavorite?: boolean;
  isActive?: boolean;
}

export interface RecentActivityItem {
  id: string;
  type: 'upload' | 'score' | 'status_change' | 'evaluation';
  candidateName: string;
  role: string;
  timestamp: string;
  details: string;
  score?: number;
}

export interface ScoringWeights {
  skillsWeight: number;
  experienceWeight: number;
  educationWeight: number;
  formatWeight: number;
}

export interface DashboardMetrics {
  totalResumes: number;
  averageScore: number;
  shortlistedCount: number;
  topRole: string;
  scoreDistribution: { range: string; count: number }[];
  skillRadarData: { subject: string; match: number; fullMark: number }[];
  dailyUploads: { date: string; uploads: number; shortlisted: number }[];
}
