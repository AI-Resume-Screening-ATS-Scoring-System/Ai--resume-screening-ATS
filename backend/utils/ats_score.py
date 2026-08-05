import re
from typing import List, Dict, Any, Tuple
from utils.skill_matcher import match_skills, normalize_skill

def extract_contact_info(text: str) -> Dict[str, Any]:
    email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}', text)
    github_match = re.search(r'(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+\/?', text, re.IGNORECASE)
    linkedin_match = re.search(r'(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?', text, re.IGNORECASE)

    return {
        "email": email_match.group(0) if email_match else None,
        "phone": phone_match.group(0) if phone_match else None,
        "github": github_match.group(0) if github_match else None,
        "linkedin": linkedin_match.group(0) if linkedin_match else None
    }

def extract_experience_years(text: str) -> int:
    matches = re.findall(r'(\d+)\+?\s*(?:years?|yrs?)\b', text, re.IGNORECASE)
    if matches:
        years = [int(m) for m in matches if int(m) <= 40]
        return max(years) if years else 3
    return 3

def calculate_ats_score(resume_text: str, target_jd: Dict[str, Any] = None) -> Dict[str, Any]:
    text_lower = resume_text.lower()

    if not target_jd:
        target_jd = {
            "required_skills": ["React", "TypeScript", "Python", "FastAPI", "PostgreSQL", "Docker"],
            "preferred_skills": ["AWS", "GraphQL", "Tailwind CSS", "Redis", "Kubernetes"],
            "min_experience": 4,
            "education": "B.S. Computer Science"
        }

    req_skills = target_jd.get("required_skills", ["React", "Python", "FastAPI"])
    pref_skills = target_jd.get("preferred_skills", ["Docker", "AWS"])
    min_exp = target_jd.get("min_experience", 4)

    # 1. Contact Information Evaluation (5 pts)
    contact_info = extract_contact_info(resume_text)
    contact_score = 0.0
    if contact_info["email"]: contact_score += 2.0
    if contact_info["phone"]: contact_score += 1.5
    if contact_info["linkedin"] or contact_info["github"]: contact_score += 1.5
    contact_score = min(5.0, round(contact_score, 1))

    if contact_score >= 4.5:
        contact_reason = "Complete contact details verified."
    elif contact_score >= 3.0:
        contact_reason = "Partial contact details detected."
    else:
        contact_reason = "Contact details incomplete or missing professional links."

    contact_items = []
    if contact_info["email"]: contact_items.append(f"Email ({contact_info['email']})")
    if contact_info["phone"]: contact_items.append(f"Phone ({contact_info['phone']})")
    if contact_info["linkedin"]: contact_items.append("LinkedIn Profile")
    if contact_info["github"]: contact_items.append("GitHub Profile")
    contact_evidence = "Verified: " + ", ".join(contact_items) if contact_items else "No valid email, phone, or professional links detected."

    # 2. Section Completeness Check (5 pts)
    sections_keywords = ["skills", "experience", "work", "education", "projects", "certifications"]
    found_sec_list = [kw.capitalize() for kw in sections_keywords if kw in text_lower]
    sections_found = len(found_sec_list)
    sections_score = round(min(5.0, (sections_found / len(sections_keywords)) * 5.0), 1)
    sections_reason = f"Found {sections_found} of {len(sections_keywords)} standard resume section headings."
    sections_evidence = f"Detected headings: {', '.join(found_sec_list)}." if found_sec_list else "No standard section headings detected."

    # 3. Technical Skills Matching (30 pts)
    skill_results = match_skills(resume_text, req_skills, pref_skills)
    matched_skills = skill_results["matched_skills"]
    missing_skills = skill_results["missing_skills"]
    additional_skills = skill_results["additional_skills"]
    normalized_skills = skill_results.get("normalized_skills", [])

    tech_ratio = len(matched_skills) / max(1, len(req_skills))
    tech_skills_score = round(min(30.0, tech_ratio * 30.0), 1)
    tech_skills_reason = f"Matched {len(matched_skills)} of {len(req_skills)} required technical skills."

    if matched_skills and missing_skills:
        tech_skills_evidence = f"Matched {', '.join(matched_skills)}. Missing {', '.join(missing_skills)}."
    elif matched_skills:
        tech_skills_evidence = f"Matched all required skills: {', '.join(matched_skills)}."
    else:
        tech_skills_evidence = f"Missing all required technical skills: {', '.join(req_skills)}."

    # 4. Keyword Match (20 pts)
    all_jd_keywords = req_skills + pref_skills
    matched_all_keywords = [kw for kw in all_jd_keywords if re.search(r'\b' + re.escape(kw.lower()) + r'\b', text_lower)]
    missing_all_keywords = [kw for kw in all_jd_keywords if kw not in matched_all_keywords]
    keyword_ratio = len(matched_all_keywords) / max(1, len(all_jd_keywords))
    keyword_match_score = round(min(20.0, keyword_ratio * 20.0), 1)
    keyword_match_reason = f"Matched {len(matched_all_keywords)} of {len(all_jd_keywords)} target position keywords ({int(keyword_ratio * 100)}%)."
    keyword_match_evidence = f"Matched terms: {', '.join(matched_all_keywords[:5])}. Missing terms: {', '.join(missing_all_keywords[:5])}." if matched_all_keywords else f"Missing keywords: {', '.join(all_jd_keywords[:5])}."

    # 5. Experience Evaluation (15 pts)
    exp_years = extract_experience_years(resume_text)
    if exp_years >= min_exp:
        exp_score = 15.0
        exp_reason = f"{exp_years} years experience satisfies minimum {min_exp} years requirement."
    else:
        exp_score = round(min(15.0, (exp_years / max(1, min_exp)) * 15.0), 1)
        exp_reason = f"{exp_years} years experience meets minimum {min_exp} years requirement partially."
    exp_evidence = f"Detected experience tenure: {exp_years} years (Position minimum: {min_exp} years)."

    # 6. Education Evaluation (10 pts)
    edu_keywords = ["bachelor", "master", "degree", "computer science", "b.s.", "m.s.", "b.tech", "engineering", "university", "college"]
    found_edu_words = [kw.title() for kw in edu_keywords if kw in text_lower]
    has_edu = len(found_edu_words) > 0
    education_score = 10.0 if has_edu else 5.0
    education_reason = "Education fully satisfies job requirements." if has_edu else "Degree or academic requirements not explicitly detected."
    education_evidence = f"Detected degree/academic terms: {', '.join(list(set(found_edu_words))[:4])}." if has_edu else "No academic degree terms (Bachelor, Master, B.S., B.Tech) found in text."

    # 7. Projects Evaluation (10 pts)
    proj_keywords = ["project", "built", "developed", "architected", "created", "designed", "implemented"]
    found_proj_words = [kw.capitalize() for kw in proj_keywords if kw in text_lower]
    has_projects = len(found_proj_words) > 0
    projects_score = 10.0 if has_projects else 5.0
    projects_reason = "Demonstrates relevant projects and technical achievements." if has_projects else "Projects section not detected or missing measurable details."
    projects_evidence = f"Detected project action terms: {', '.join(list(set(found_proj_words))[:4])}." if has_projects else "No project section or project action terms found in text."

    # 8. Certifications Evaluation (5 pts)
    cert_keywords = ["certified", "certification", "certificate", "aws certified", "coursera", "udemy", "scrum master", "pmp", "cka"]
    found_cert_words = [kw.title() for kw in cert_keywords if kw in text_lower]
    has_certifications = len(found_cert_words) > 0
    cert_score = 5.0 if has_certifications else 2.5
    cert_reason = "Technical certifications detected in resume text." if has_certifications else "No technical certifications detected."
    cert_evidence = f"Detected certification terms: {', '.join(list(set(found_cert_words))[:3])}." if has_certifications else "No certification terms (Certified, Certificate, AWS) found in text."

    total_ats_score = round(
        tech_skills_score +
        keyword_match_score +
        exp_score +
        education_score +
        projects_score +
        cert_score +
        contact_score +
        sections_score,
        1
    )
    total_ats_score = min(100.0, max(0.0, total_ats_score))

    strengths = []
    if matched_skills:
        strengths.append(f"Matched key required skills: {', '.join(matched_skills[:4])}")
    if contact_score >= 4.0:
        strengths.append("Complete contact details (Email, Phone, Professional Profile) detected")
    if exp_years >= min_exp:
        strengths.append(f"Experience tenure ({exp_years} yrs) satisfies position requirements ({min_exp} yrs)")
    if has_projects:
        strengths.append("Demonstrated project accomplishments and development history")

    weaknesses = []
    if missing_skills:
        weaknesses.append(f"Missing required target skills: {', '.join(missing_skills[:3])}")
    if not contact_info["linkedin"] and not contact_info["github"]:
        weaknesses.append("Missing GitHub or LinkedIn profile links in contact section")
    if keyword_match_score < 14.0:
        weaknesses.append("Keyword density could be improved for target preferred skills")
    if not has_certifications:
        weaknesses.append("No technical certifications detected in resume text")

    return {
        "ats_score": round(total_ats_score, 1),
        "score_breakdown": {
            "technical_skills": {
                "score": tech_skills_score,
                "max": 30,
                "reason": tech_skills_reason,
                "evidence": tech_skills_evidence
            },
            "keyword_match": {
                "score": keyword_match_score,
                "max": 20,
                "reason": keyword_match_reason,
                "evidence": keyword_match_evidence
            },
            "experience": {
                "score": exp_score,
                "max": 15,
                "reason": exp_reason,
                "evidence": exp_evidence
            },
            "education": {
                "score": education_score,
                "max": 10,
                "reason": education_reason,
                "evidence": education_evidence
            },
            "projects": {
                "score": projects_score,
                "max": 10,
                "reason": projects_reason,
                "evidence": projects_evidence
            },
            "certifications": {
                "score": cert_score,
                "max": 5,
                "reason": cert_reason,
                "evidence": cert_evidence
            },
            "contact": {
                "score": contact_score,
                "max": 5,
                "reason": contact_reason,
                "evidence": contact_evidence
            },
            "sections": {
                "score": sections_score,
                "max": 5,
                "reason": sections_reason,
                "evidence": sections_evidence
            }
        },
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "additional_skills": additional_skills,
        "normalized_skills": normalized_skills,
        "strengths": strengths if strengths else ["Standard resume structure"],
        "weaknesses": weaknesses if weaknesses else ["Minor keyword density optimizations possible"]
    }
