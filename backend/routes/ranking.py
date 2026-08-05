import time
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Optional
from utils.parser import parse_resume_file, clean_text, parse_resume_structured
from utils.domain_classifier import predict_domain
from utils.ats_score import calculate_ats_score
from utils.similarity import compute_tfidf_similarity

router = APIRouter(tags=["ranking"])

DEFAULT_JD_TEXT = "We are seeking a Senior Full Stack Engineer experienced in React, TypeScript, Python, FastAPI, PostgreSQL, Docker, Kubernetes, AWS, and Microservices."

@router.post("/rank")
async def rank_candidates(
    files: List[UploadFile] = File(...),
    job_description: Optional[str] = Form(None)
):
    """
    POST /rank
    Accepts multiple resume files -> Extracts text -> Runs ML Classifier, ATS Scoring, and TF-IDF Similarity -> Sorts by ATS Score (desc) -> Assigns Ranks & Status
    """
    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="No resume files provided for ranking")

    jd_text = job_description if job_description else DEFAULT_JD_TEXT
    ranked_list = []

    for idx, file in enumerate(files):
        try:
            contents = await file.read()
            raw_text = parse_resume_file(contents, file.filename)
            cleaned = clean_text(raw_text)
            structured_data = parse_resume_structured(cleaned, file.filename)

            ml_pred = predict_domain(cleaned)
            ats_res = calculate_ats_score(cleaned)
            sim_res = compute_tfidf_similarity(cleaned, jd_text)

            name = structured_data.get("name") or "Unknown"
            ats_val = ats_res["ats_score"]

            if ats_val >= 80:
                status = "Shortlisted"
            elif ats_val >= 60:
                status = "Under Review"
            else:
                status = "Rejected"

            ranked_list.append({
                "id": f"cand-{int(time.time() * 1000)}-{idx}",
                "candidate": name,
                "filename": file.filename,
                "domain": ml_pred["predicted_domain"],
                "confidence": ml_pred["confidence"],
                "ats": ats_val,
                "similarity": sim_res["similarity_score"],
                "status": status,
                "matched_skills": ats_res["matched_skills"],
                "missing_skills": ats_res["missing_skills"]
            })
        except Exception as e:
            print(f"[Ranking Engine Error] Failed processing {file.filename}: {e}")

    ranked_list.sort(key=lambda c: (c["ats"], c["similarity"]), reverse=True)

    for index, cand in enumerate(ranked_list):
        cand["rank"] = index + 1

    return {
        "status": "success",
        "total_processed": len(ranked_list),
        "candidates": ranked_list
    }
