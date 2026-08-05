import time
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Body
from typing import Optional
from utils.parser import parse_resume_file, clean_text, parse_resume_structured
from utils.domain_classifier import predict_domain
from utils.ats_score import calculate_ats_score
from utils.similarity import compute_tfidf_similarity
from utils.feedback import generate_resume_feedback
from utils.hallucination import detect_hallucinations

router = APIRouter(tags=["analysis"])

DEFAULT_JD_TEXT = "We are seeking a Senior Full Stack Engineer experienced in React, TypeScript, Python, FastAPI, PostgreSQL, Docker, Kubernetes, AWS, and Microservices."

@router.post("/analyze")
async def analyze(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    job_description: Optional[str] = Form(None),
    body: Optional[dict] = Body(None)
):
    start_time = time.time()
    raw_text = ""
    jd_text = DEFAULT_JD_TEXT
    filename = "resume.pdf"

    if file:
        filename = file.filename
        contents = await file.read()
        raw_text = parse_resume_file(contents, file.filename)
    elif text:
        raw_text = text
    elif body and "text" in body:
        raw_text = body["text"]
    else:
        raw_text = "Experienced Senior Software Engineer specializing in Python, FastAPI, React, TypeScript, PostgreSQL, and Docker."

    if body and "job_description" in body:
        jd_text = body["job_description"]
    elif job_description:
        jd_text = job_description

    cleaned = clean_text(raw_text)

    structured_data = parse_resume_structured(cleaned, filename)
    ml_prediction = predict_domain(cleaned)
    ats_results = calculate_ats_score(cleaned)
    sim_results = compute_tfidf_similarity(cleaned, jd_text)
    feedback_suggestions = generate_resume_feedback(cleaned, jd_text, ats_results)

    # Pass structured_data to detect_hallucinations
    hallucination_report = detect_hallucinations(feedback_suggestions, cleaned, jd_text, structured_data)

    elapsed = time.time() - start_time
    word_count = len(cleaned.split()) if cleaned else 0
    character_count = len(cleaned)

    return {
        "status": "success",
        "extracted_text": cleaned,
        "structured_data": structured_data,
        "predicted_domain": ml_prediction["predicted_domain"],
        "confidence": ml_prediction["confidence"],
        "top_predictions": ml_prediction["top_predictions"],
        "ats_score": ats_results["ats_score"],
        "score_breakdown": ats_results["score_breakdown"],
        "matched_skills": ats_results["matched_skills"],
        "missing_skills": ats_results["missing_skills"],
        "additional_skills": ats_results.get("additional_skills", []),
        "strengths": ats_results["strengths"],
        "weaknesses": ats_results["weaknesses"],
        "similarity_score": sim_results["similarity_score"],
        "similarity_matched_keywords": sim_results["matched_keywords"],
        "similarity_missing_keywords": sim_results["missing_keywords"],
        "top_matching_sentences": sim_results["top_matching_sentences"],
        "top_suggestions": feedback_suggestions,
        "hallucination_report": hallucination_report,
        "word_count": word_count,
        "character_count": character_count,
        "processing_time": f"{elapsed:.2f} sec"
    }
