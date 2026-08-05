import { Candidate, DashboardMetrics, JobDescription, RecentActivityItem, ScoringWeights } from '../types';

export const INITIAL_WEIGHTS: ScoringWeights = {
  skillsWeight: 40,
  experienceWeight: 30,
  educationWeight: 15,
  formatWeight: 15,
};

export const MOCK_JOB_DESCRIPTIONS: JobDescription[] = [
  {
    id: 'jd-1',
    title: 'Senior Full Stack Engineer',
    department: 'Product Engineering',
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'Python', 'FastAPI', 'PostgreSQL', 'Docker'],
    preferredSkills: ['GraphQL', 'AWS', 'Redis', 'Tailwind CSS', 'Kubernetes'],
    minExperience: 4,
    description: 'We are seeking an experienced Full Stack Engineer to architect and build scalable cloud microservices, sleek React interfaces, and performant backend APIs.',
  },
  {
    id: 'jd-2',
    title: 'AI / Machine Learning Infrastructure Engineer',
    department: 'AI Operations',
    requiredSkills: ['Python', 'PyTorch', 'FastAPI', 'Docker', 'MLflow', 'CUDA', 'REST APIs'],
    preferredSkills: ['LangChain', 'LlamaIndex', 'TensorRT', 'Vector Databases (Chroma/Weaviate)'],
    minExperience: 3,
    description: 'Join our AI Infrastructure team to optimize model inference pipelines, build retrieval-augmented generation frameworks, and scale high-throughput endpoints.',
  },
  {
    id: 'jd-3',
    title: 'Senior Frontend Developer',
    department: 'UI/UX & Web Systems',
    requiredSkills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Web Vitals', 'State Management'],
    preferredSkills: ['Figma', 'Jest/RTL', 'Design Systems', 'Micro-frontends'],
    minExperience: 3,
    description: 'Design and implement high-performance, responsive Web UI applications using modern frontend tools, component libraries, and clean architectural principles.',
  },
];

export const MOCK_CANDIDATES: Candidate[] = [];

export const MOCK_ACTIVITIES: RecentActivityItem[] = [];

export const MOCK_DASHBOARD_METRICS: DashboardMetrics = {
  totalResumes: 0,
  averageScore: 0,
  shortlistedCount: 0,
  topRole: 'N/A',
  scoreDistribution: [
    { range: '< 60%', count: 0 },
    { range: '60 - 75%', count: 0 },
    { range: '75 - 90%', count: 0 },
    { range: '90% +', count: 0 },
  ],
  skillRadarData: [
    { subject: 'React / TS', match: 0, fullMark: 100 },
    { subject: 'Python / FastAPI', match: 0, fullMark: 100 },
    { subject: 'SQL & Databases', match: 0, fullMark: 100 },
    { subject: 'Cloud & Docker', match: 0, fullMark: 100 },
    { subject: 'System Architecture', match: 0, fullMark: 100 },
    { subject: 'Formatting ATS', match: 0, fullMark: 100 },
  ],
  dailyUploads: []
};
