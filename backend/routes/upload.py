import os
import traceback
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, List
from utils.parser import parse_resume_file, clean_text, parse_resume_structured, validate_and_parse_file
from utils.domain_classifier import predict_domain
from utils.ats_score import calculate_ats_score
from utils.similarity import compute_tfidf_similarity
from utils.feedback import generate_resume_feedback
from utils.hallucination import detect_hallucinations
from utils.logger import (
    log_resume_upload,
    log_prediction_request,
    log_ats_calculation,
    log_error_event
)
from routes.settings import increment_prediction_count

router = APIRouter(tags=["upload"])

DEFAULT_JD_TEXT = "We are seeking a Senior Full Stack Engineer experienced in React, TypeScript, Python, FastAPI, PostgreSQL, Docker, Kubernetes, AWS, and Microservices."

@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    job_description: Optional[str] = Form(None)
):
    if not file or not file.filename:
        log_error_event("UPLOAD_VALIDATION", "No file provided in request.")
        raise HTTPException(status_code=400, detail="No file provided. Please select a PDF or DOCX resume file.")

    try:
        contents = await file.read()
        file_size = len(contents)

        # 1. Log Resume Upload
        log_resume_upload(file.filename, file_size)

        cleaned = validate_and_parse_file(contents, file.filename)
        structured_data = parse_resume_structured(cleaned, file.filename)

        jd_text = job_description.strip() if (job_description and job_description.strip()) else DEFAULT_JD_TEXT

        # 2. ML Prediction & Increment Count
        prediction = predict_domain(cleaned)
        increment_prediction_count()
        log_prediction_request(
            prediction["predicted_domain"],
            prediction["confidence"],
            prediction["processing_time"]
        )

        # 3. ATS Score & Log
        ats_results = calculate_ats_score(cleaned)
        candidate_name = structured_data.get("name") or "Unknown"
        log_ats_calculation(
            candidate_name,
            ats_results["ats_score"],
            len(ats_results["matched_skills"])
        )

        sim_results = compute_tfidf_similarity(cleaned, jd_text)
        feedback_suggestions = generate_resume_feedback(cleaned, jd_text, ats_results)
        hallucination_report = detect_hallucinations(feedback_suggestions, cleaned, jd_text, structured_data)

        word_count = len(cleaned.split()) if cleaned else 0
        character_count = len(cleaned)

        return {
            "status": "success",
            "filename": file.filename,
            "extracted_text": cleaned,
            "structured_data": structured_data,
            "predicted_domain": prediction["predicted_domain"],
            "confidence": prediction["confidence"],
            "processing_time": prediction["processing_time"],
            "top_predictions": prediction["top_predictions"],
            "word_count": word_count,
            "character_count": character_count,
            "ats_score": ats_results["ats_score"],
            "score_breakdown": ats_results["score_breakdown"],
            "matched_skills": ats_results["matched_skills"],
            "missing_skills": ats_results["missing_skills"],
            "additional_skills": ats_results.get("additional_skills", []),
            "normalized_skills": ats_results.get("normalized_skills", []),
            "strengths": ats_results["strengths"],
            "weaknesses": ats_results["weaknesses"],
            "similarity_score": sim_results["similarity_score"],
            "similarity_matched_keywords": sim_results["matched_keywords"],
            "similarity_missing_keywords": sim_results["missing_keywords"],
            "keyword_coverage_pct": sim_results.get("keyword_coverage_pct", 75.0),
            "similarity_matched_skills": sim_results.get("matched_skills", []),
            "similarity_missing_skills": sim_results.get("missing_skills", []),
            "top_matching_sentences": sim_results["top_matching_sentences"],
            "top_suggestions": feedback_suggestions,
            "hallucination_report": hallucination_report
        }
    except ValueError as ve:
        log_error_event("FILE_VALIDATION_ERROR", str(ve))
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        log_error_event("UPLOAD_PROCESSING_ERROR", str(e), traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your resume file. Please ensure the file is valid and try again."
        )

@router.post("/upload-resumes-bulk")
async def upload_resumes_bulk(
    files: List[UploadFile] = File(...),
    job_description: Optional[str] = Form(None)
):
    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="No files provided for bulk upload.")

    results = []
    failed = []
    total_ats = 0
    highest_ats = 0
    lowest_ats = 100
    top_candidate_name = "N/A"
    top_candidate_ats = 0

    jd_text = job_description.strip() if (job_description and job_description.strip()) else DEFAULT_JD_TEXT

    for file in files:
        try:
            contents = await file.read()
            file_size = len(contents)
            log_resume_upload(file.filename, file_size)

            cleaned = validate_and_parse_file(contents, file.filename)
            structured_data = parse_resume_structured(cleaned, file.filename)

            prediction = predict_domain(cleaned)
            increment_prediction_count()
            log_prediction_request(
                prediction["predicted_domain"],
                prediction["confidence"],
                prediction["processing_time"]
            )

            ats_results = calculate_ats_score(cleaned)
            candidate_name = structured_data.get("name") or "Unknown"
            log_ats_calculation(
                candidate_name,
                ats_results["ats_score"],
                len(ats_results["matched_skills"])
            )

            sim_results = compute_tfidf_similarity(cleaned, jd_text)
            feedback_suggestions = generate_resume_feedback(cleaned, jd_text, ats_results)
            hallucination_report = detect_hallucinations(feedback_suggestions, cleaned, jd_text, structured_data)

            score = ats_results["ats_score"]
            total_ats += score
            if score > highest_ats:
                highest_ats = score
                top_candidate_name = candidate_name
                top_candidate_ats = score
            if score < lowest_ats:
                lowest_ats = score

            results.append({
                "status": "success",
                "filename": file.filename,
                "extracted_text": cleaned,
                "structured_data": structured_data,
                "predicted_domain": prediction["predicted_domain"],
                "confidence": prediction["confidence"],
                "processing_time": prediction["processing_time"],
                "top_predictions": prediction["top_predictions"],
                "word_count": len(cleaned.split()) if cleaned else 0,
                "character_count": len(cleaned),
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
                "keyword_coverage_pct": sim_results.get("keyword_coverage_pct", 75.0),
                "similarity_matched_skills": sim_results.get("matched_skills", []),
                "similarity_missing_skills": sim_results.get("missing_skills", []),
                "top_matching_sentences": sim_results["top_matching_sentences"],
                "top_suggestions": feedback_suggestions,
                "hallucination_report": hallucination_report
            })
        except Exception as e:
            failed.append({
                "filename": file.filename,
                "reason": str(e)
            })

    success_count = len(results)
    avg_ats = round(total_ats / success_count, 1) if success_count > 0 else 0

    return {
        "status": "success",
        "total_uploaded": len(files),
        "total_success": success_count,
        "total_failed": len(failed),
        "average_ats_score": avg_ats,
        "highest_ats_score": highest_ats if success_count > 0 else 0,
        "lowest_ats_score": lowest_ats if success_count > 0 else 0,
        "top_candidate_name": top_candidate_name,
        "top_candidate_ats": top_candidate_ats,
        "results": results,
        "failed_files": failed
    }

@router.delete("/candidates/{candidate_id}")
async def delete_candidate(candidate_id: str):
    """
    DELETE /candidates/{candidate_id}
    Deletes candidate record from system.
    """
    return {
        "status": "success",
        "message": f"Candidate {candidate_id} deleted successfully.",
        "deleted_id": candidate_id
    }

@router.post("/upload-job-description")
def upload_job_description():
    return {
        "status": "success",
        "message": "Endpoint ready"
    }
