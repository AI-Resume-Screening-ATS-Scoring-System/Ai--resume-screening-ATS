import re
from typing import List, Dict, Set

# Master Technical Skill Synonym Mapping Dictionary (lowercase variant -> Canonical Normalized Name)
SYNONYM_MAP: Dict[str, str] = {
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "express": "Express.js",
    "expressjs": "Express.js",
    "tensor flow": "TensorFlow",
    "tensorflow": "TensorFlow",
    "tf": "TensorFlow",
    "pytorch": "PyTorch",
    "py torch": "PyTorch",
    "ai": "AI",
    "artificial intelligence": "AI",
    "machine learning": "ML",
    "ml": "ML",
    "fast api": "FastAPI",
    "fastapi": "FastAPI",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "postgre sql": "PostgreSQL",
    "mongo": "MongoDB",
    "mongodb": "MongoDB",
    "mongo db": "MongoDB",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "docker": "Docker",
    "aws": "AWS",
    "amazon web services": "AWS",
    "gcp": "Google Cloud Platform",
    "google cloud": "Google Cloud Platform",
    "azure": "Microsoft Azure",
    "git": "Git",
    "github": "GitHub",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "tailwind css": "Tailwind CSS",
    "nextjs": "Next.js",
    "next.js": "Next.js",
    "redux": "Redux",
    "python": "Python",
    "java": "Java",
    "spring": "Spring Boot",
    "springboot": "Spring Boot",
    "spring boot": "Spring Boot",
    "c++": "C++",
    "cpp": "C++",
    "c#": "C#",
    "sql": "SQL",
    "graphql": "GraphQL",
    "rest api": "REST APIs",
    "rest apis": "REST APIs",
    "restful": "REST APIs",
    "microservices": "Microservices",
    "linux": "Linux"
}

MASTER_SKILLS_DB: Set[str] = set(SYNONYM_MAP.values())

def normalize_skill(skill_name: str) -> str:
    """
    Normalizes a single skill string using technical synonym mapping.
    Ignores capitalization and strips whitespace.
    Examples:
    - 'ReactJS' -> 'React'
    - 'Node' -> 'Node.js'
    - 'JS' -> 'JavaScript'
    - 'Tensor Flow' -> 'TensorFlow'
    - 'Machine Learning' -> 'ML'
    - 'Artificial Intelligence' -> 'AI'
    """
    if not skill_name:
        return ""
    clean_sk = skill_name.strip().lower()
    return SYNONYM_MAP.get(clean_sk, skill_name.strip().title())

def extract_all_resume_skills(resume_text: str) -> List[str]:
    """
    Extracts all normalized skills present in resume text.
    Ignores case and removes duplicates.
    """
    text_lower = resume_text.lower()
    found_skills: Set[str] = set()

    for variant, canonical in SYNONYM_MAP.items():
        pattern = r'\b' + re.escape(variant) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.add(canonical)

    return sorted(list(found_skills))

def match_skills(
    resume_text: str,
    required_skills: List[str] = None,
    preferred_skills: List[str] = None
) -> Dict[str, List[str]]:
    """
    Normalized Technical Skill Extractor & Matcher Engine:
    - Normalizes target required & preferred skills
    - Extracts and normalizes candidate resume skills
    - Case-insensitive comparison & duplicate removal
    - Returns:
      - matched_skills
      - missing_skills
      - additional_skills
      - normalized_skills
    """
    if required_skills is None:
        required_skills = ["React", "TypeScript", "Python", "FastAPI", "PostgreSQL", "Docker"]
    if preferred_skills is None:
        preferred_skills = ["AWS", "GraphQL", "Kubernetes"]

    norm_required: List[str] = []
    seen_req = set()
    for r in required_skills:
        c = normalize_skill(r)
        if c and c not in seen_req:
            seen_req.add(c)
            norm_required.append(c)

    normalized_skills = extract_all_resume_skills(resume_text)
    candidate_skills_set = set(normalized_skills)

    matched_skills: List[str] = []
    missing_skills: List[str] = []

    for req in norm_required:
        if req in candidate_skills_set:
            matched_skills.append(req)
        else:
            missing_skills.append(req)

    additional_skills: List[str] = sorted(list(candidate_skills_set - set(norm_required)))

    return {
        "matched_skills": sorted(list(set(matched_skills))),
        "missing_skills": sorted(list(set(missing_skills))),
        "additional_skills": additional_skills,
        "normalized_skills": normalized_skills
    }
