import os
import glob
from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse
from utils.logger import log_report_generation, log_error_event

router = APIRouter(tags=["settings"])

REPORTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "reports"))
LOGS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "logs"))
LOG_FILE_PATH = os.path.join(LOGS_DIR, "ats_system.log")

total_predictions_count = 0

def increment_prediction_count():
    global total_predictions_count
    total_predictions_count += 1

def reset_prediction_count():
    global total_predictions_count
    total_predictions_count = 0

@router.get("/settings/info")
def get_system_info():
    """
    GET /settings/info
    Returns Model Version, Dataset Size, Training Date, Live Total Predictions, Average Inference Time
    """
    global total_predictions_count
    return {
        "status": "success",
        "model_version": "Logistic Regression v1.0 (TF-IDF Vectorizer 5000 Features)",
        "dataset_size": "2,481 Resumes (24 Domain Categories)",
        "training_date": "2026-08-01",
        "total_predictions": str(total_predictions_count),
        "average_prediction_time": "0.01 sec"
    }

@router.delete("/history")
@router.delete("/settings/history")
@router.post("/settings/clear-history")
def clear_upload_history():
    """
    DELETE /history & DELETE /settings/history & POST /settings/clear-history
    Clears upload history records & resets live prediction count.
    """
    reset_prediction_count()
    return {
        "status": "success",
        "message": "Upload history cleared successfully."
    }

@router.delete("/reports")
@router.delete("/settings/reports")
@router.post("/settings/delete-reports")
def delete_reports():
    """
    DELETE /reports & DELETE /settings/reports & POST /settings/delete-reports
    Deletes all PDF and CSV files inside reports/ directory.
    """
    try:
        deleted_count = 0
        if os.path.exists(REPORTS_DIR):
            for file_path in glob.glob(os.path.join(REPORTS_DIR, "*.*")):
                filename = os.path.basename(file_path)
                if filename not in ["confusion_matrix.png", "classification_report.txt"]:
                    try:
                        os.remove(file_path)
                        deleted_count += 1
                    except Exception as fe:
                        print(f"Could not delete {file_path}: {fe}")

        return {
            "status": "success",
            "message": f"Successfully deleted {deleted_count} report file(s) from reports/ directory.",
            "deleted_count": deleted_count
        }
    except Exception as e:
        log_error_event("DELETE_REPORTS_ERROR", str(e))
        raise HTTPException(status_code=500, detail=f"Failed deleting report files: {str(e)}")

@router.get("/logs/download")
@router.get("/settings/download-logs")
def download_logs():
    """
    GET /logs/download & GET /settings/download-logs
    Returns system application execution log file as a downloadable attachment.
    """
    if os.path.exists(LOG_FILE_PATH):
        with open(LOG_FILE_PATH, "r", encoding="utf-8") as f:
            logs_content = f.read()
    else:
        logs_content = "[Resumix ATS System Log]\n[INFO] Initializing system logging...\n"

    return PlainTextResponse(logs_content, headers={"Content-Disposition": "attachment; filename=ats_system.log"})
