import os
import traceback
from fastapi import APIRouter, Body, HTTPException
from typing import Dict, Any, List
from utils.report_generator import (
    generate_analysis_pdf,
    generate_ranking_pdf,
    generate_evaluation_pdf,
    generate_ranking_csv,
    generate_evaluation_csv
)
from routes.evaluation import get_evaluation_metrics
from utils.logger import log_report_generation, log_error_event

router = APIRouter(prefix="/reports", tags=["reports"])

BASE_URL = "http://localhost:8000"

@router.post("/analysis-pdf")
def create_analysis_pdf(candidate_data: Dict[str, Any] = Body(...)):
    """
    POST /reports/analysis-pdf
    Generates PDF report for a Candidate Resume Analysis and saves inside reports/
    """
    try:
        filepath = generate_analysis_pdf(candidate_data)
        filename = os.path.basename(filepath)
        log_report_generation("Resume Analysis PDF", filepath)
        return {
            "status": "success",
            "message": "Resume Analysis PDF generated successfully",
            "filename": filename,
            "url": f"{BASE_URL}/reports/{filename}"
        }
    except Exception as e:
        log_error_event("ANALYSIS_PDF_GENERATION_ERROR", str(e), traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed generating analysis PDF: {str(e)}")

@router.post("/ranking-pdf")
def create_ranking_pdf(candidates: List[Dict[str, Any]] = Body(...)):
    """
    POST /reports/ranking-pdf
    Generates Candidate Ranking Matrix PDF report and saves inside reports/
    """
    try:
        filepath = generate_ranking_pdf(candidates)
        filename = os.path.basename(filepath)
        log_report_generation("Candidate Ranking PDF", filepath)
        return {
            "status": "success",
            "message": "Candidate Ranking PDF generated successfully",
            "filename": filename,
            "url": f"{BASE_URL}/reports/{filename}"
        }
    except Exception as e:
        log_error_event("RANKING_PDF_GENERATION_ERROR", str(e), traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed generating ranking PDF: {str(e)}")

@router.get("/evaluation-pdf")
def create_evaluation_pdf():
    """
    GET /reports/evaluation-pdf
    Generates ML Evaluation Dashboard PDF report and saves inside reports/
    """
    try:
        metrics = get_evaluation_metrics()
        filepath = generate_evaluation_pdf(metrics)
        filename = os.path.basename(filepath)
        log_report_generation("Evaluation PDF", filepath)
        return {
            "status": "success",
            "message": "Evaluation Report PDF generated successfully",
            "filename": filename,
            "url": f"{BASE_URL}/reports/{filename}"
        }
    except Exception as e:
        log_error_event("EVALUATION_PDF_GENERATION_ERROR", str(e), traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed generating evaluation PDF: {str(e)}")

@router.get("/evaluation-csv")
def create_evaluation_csv():
    """
    GET /reports/evaluation-csv
    Generates Evaluation Metrics CSV export and saves inside reports/
    """
    try:
        metrics = get_evaluation_metrics()
        filepath = generate_evaluation_csv(metrics)
        filename = os.path.basename(filepath)
        log_report_generation("Evaluation CSV", filepath)
        return {
            "status": "success",
            "message": "Evaluation CSV generated successfully",
            "filename": filename,
            "url": f"{BASE_URL}/reports/{filename}"
        }
    except Exception as e:
        log_error_event("EVALUATION_CSV_GENERATION_ERROR", str(e), traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed generating evaluation CSV: {str(e)}")
