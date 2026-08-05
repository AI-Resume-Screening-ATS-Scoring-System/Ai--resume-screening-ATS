import re
from typing import Dict, Any, List
from utils.parser import clean_text
from utils.ats_score import extract_contact_info

def generate_resume_feedback(resume_text: str, jd_text: str = "", ats_breakdown: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    """
    Generates practical, content-grounded resume improvement suggestions based ONLY on resume content and target job description.
    Includes impact estimate (+X ATS Points), difficulty, and timeRequired fields.
    """
    text_lower = resume_text.lower()
    suggestions = []

    # 1. Contact Information Check (GitHub / LinkedIn)
    contact = extract_contact_info(resume_text)
    if not contact["github"] and not contact["linkedin"]:
        suggestions.append({
            "category": "Contact Profile",
            "title": "Include GitHub or LinkedIn Profile Link",
            "description": "No GitHub or LinkedIn profile URL was detected in your contact section. Adding a portfolio link allows recruiters to verify your code repositories and professional background.",
            "priority": "High",
            "impact": "+4 ATS Points",
            "difficulty": "Easy",
            "timeRequired": "2 mins"
        })

    # 2. Check for Measurable / Quantifiable Achievements
    has_metrics = bool(re.search(r'\b(?:\d+%\s*|\d+x\s*|\$\d+|\d+\s*ms|\d+\s*users?|\d+\s*m+)\b', resume_text, re.IGNORECASE))
    if not has_metrics:
        suggestions.append({
            "category": "Measurable Impact",
            "title": "Mention Measurable Achievements with Metrics",
            "description": "Your project and experience descriptions lack numerical metrics. Include percentage improvements, performance gains, or scale metrics (e.g. 'Optimized database queries, reducing response latency by 35%').",
            "priority": "High",
            "impact": "+6 ATS Points",
            "difficulty": "Medium",
            "timeRequired": "10 mins"
        })

    # 3. Check for Technical Skills Gaps
    if ats_breakdown and "missing_skills" in ats_breakdown and ats_breakdown["missing_skills"]:
        missing = ats_breakdown["missing_skills"]
        suggestions.append({
            "category": "Technical Skills",
            "title": f"Add Missing Technical Skills ({', '.join(missing[:3])})",
            "description": f"The target job position requests required skills missing from your resume text: {', '.join(missing)}. If you have experience with these tools, highlight them in your skills or project descriptions.",
            "priority": "High",
            "impact": "+5 ATS Points",
            "difficulty": "Easy",
            "timeRequired": "5 mins"
        })

    # 4. Check for Action Verbs & Project Descriptions
    strong_action_verbs = ["architected", "developed", "engineered", "implemented", "scaled", "migrated", "optimized", "built"]
    has_action_verbs = sum(1 for verb in strong_action_verbs if verb in text_lower)
    if has_action_verbs < 3:
        suggestions.append({
            "category": "Project Descriptions",
            "title": "Improve Project Descriptions & Strong Action Verbs",
            "description": "Start experience bullet points with technical action verbs like 'Architected', 'Engineered', 'Scaled', or 'Optimized' to make accomplishments stand out.",
            "priority": "Medium",
            "impact": "+3 ATS Points",
            "difficulty": "Medium",
            "timeRequired": "8 mins"
        })

    # 5. Check for Certifications
    has_certifications = bool(re.search(r'\b(?:certified|certification|certificate|aws certified)\b', text_lower))
    if not has_certifications:
        suggestions.append({
            "category": "Certifications",
            "title": "Mention Relevant Technical Certifications",
            "description": "No technical certifications were detected. Adding cloud, security, or specialized framework certifications (e.g., AWS Certified Developer, Kubernetes CKA) can boost recruiter trust.",
            "priority": "Low",
            "impact": "+2 ATS Points",
            "difficulty": "Hard",
            "timeRequired": "15 mins"
        })

    # 6. Check for Generic Objectives
    if "objective:" in text_lower or "career objective" in text_lower:
        suggestions.append({
            "category": "Formatting & Structure",
            "title": "Avoid Generic Objective Statement",
            "description": "Replace generic career objective statements with a targeted Technical Executive Summary highlighting key achievements and primary tech stack expertise.",
            "priority": "Medium",
            "impact": "+3 ATS Points",
            "difficulty": "Easy",
            "timeRequired": "5 mins"
        })

    # 7. Check for Standard Section Headings / Formatting
    sections = ["skills", "experience", "education", "projects"]
    missing_sections = [s.capitalize() for s in sections if s not in text_lower]
    if missing_sections:
        suggestions.append({
            "category": "Resume Formatting",
            "title": f"Improve Section Formatting for '{', '.join(missing_sections)}'",
            "description": f"Standard ATS parsers search for explicit section headers. Ensure your resume includes clean headings for {', '.join(missing_sections)}.",
            "priority": "Medium",
            "impact": "+4 ATS Points",
            "difficulty": "Easy",
            "timeRequired": "3 mins"
        })

    # Default fallback if resume is already clean
    if not suggestions:
        suggestions.append({
            "category": "Continuous Optimization",
            "title": "Keep Tech Stack & Project Links Updated",
            "description": "Your resume meets standard ATS criteria. Ensure your latest production projects and repository links remain up to date.",
            "priority": "Low",
            "impact": "+2 ATS Points",
            "difficulty": "Easy",
            "timeRequired": "5 mins"
        })

    # Sort suggestions by Priority: High -> Medium -> Low
    priority_order = {"High": 1, "Medium": 2, "Low": 3}
    sorted_suggestions = sorted(suggestions, key=lambda x: priority_order.get(x["priority"], 4))

    return sorted_suggestions
