import os
import logging
from logging.handlers import RotatingFileHandler

LOGS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "logs"))
if not os.path.exists(LOGS_DIR):
    os.makedirs(LOGS_DIR, exist_ok=True)

LOG_FILE_PATH = os.path.join(LOGS_DIR, "ats_system.log")

# Setup Rotating File Handler (5MB max size per log file, 5 backup rotation files)
handler = RotatingFileHandler(
    LOG_FILE_PATH,
    maxBytes=5 * 1024 * 1024,
    backupCount=5,
    encoding="utf-8"
)

formatter = logging.Formatter(
    fmt="[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
handler.setFormatter(formatter)

logger = logging.getLogger("ResumixATS")
logger.setLevel(logging.INFO)

if not logger.handlers:
    logger.addHandler(handler)

def log_resume_upload(filename: str, file_size_bytes: int):
    """Logs Resume Upload Event"""
    logger.info(f"RESUME UPLOAD | Filename: '{filename}' | Size: {file_size_bytes} bytes ({(file_size_bytes/1024):.1f} KB)")

def log_prediction_request(domain: str, confidence: float, processing_time: str):
    """Logs ML Prediction Event"""
    logger.info(f"ML PREDICTION | Domain: '{domain}' | Confidence: {confidence}% | Time: {processing_time}")

def log_ats_calculation(candidate_name: str, ats_score: float, matched_count: int):
    """Logs ATS Score Calculation Event"""
    logger.info(f"ATS CALCULATION | Candidate: '{candidate_name}' | Score: {ats_score}/100 | Matched Skills Count: {matched_count}")

def log_error_event(event_type: str, message: str, traceback_str: str = ""):
    """Logs Backend Error Event"""
    err_msg = f"ERROR EVENT | Type: '{event_type}' | Details: {message}"
    if traceback_str:
        err_msg += f"\nTraceback:\n{traceback_str}"
    logger.error(err_msg)

def log_report_generation(report_type: str, filepath: str):
    """Logs Report Generation Event"""
    logger.info(f"REPORT GENERATION | Type: '{report_type}' | Saved to: '{filepath}'")
