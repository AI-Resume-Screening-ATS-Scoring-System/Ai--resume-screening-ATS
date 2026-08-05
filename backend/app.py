import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routes import upload, analysis, ranking, evaluation, settings, reports
from utils.domain_classifier import load_classifier_model
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load ML Model & Vectorizer once into memory
    print("[FastAPI Startup] Initializing Machine Learning Models...")
    load_classifier_model()
    yield
    print("[FastAPI Shutdown] Shutting down application...")

app = FastAPI(
    title="AI Resume Screening & ATS Analysis Engine API",
    description="""
    ## Computer Engineering AI Resume Screening & ATS System
    
    ### API Capabilities:
    * **Resume Upload & Validation**: Accepts PDF and DOCX documents with size, format, corruption, and text validation.
    * **Structured Text Parser**: Extracts candidate personal details (Name, Email, Phone, LinkedIn, GitHub) and professional sections (Skills, Education, Experience, Projects, Certifications, Languages).
    * **ML Domain Classifier**: Predicts top 3 candidate domains using in-memory TF-IDF + Logistic Regression.
    * **Rule-Based ATS Engine**: Evaluates 8 weighted categories with explicit Score, Max Points, Reason, and Empirical Evidence.
    * **TF-IDF Cosine Similarity**: Computes similarity %, keyword coverage %, matched/missing keywords, and top matching sentences.
    * **Hallucination Detection**: Validates AI suggestions against text and missing structured data evidence.
    * **Report Generator & Storage**: Generates PDF and CSV reports stored in `reports/`.
    * **Structured Logging**: Logs system events to `logs/ats_system.log` with 5MB file rotation.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount reports folder as static files so PDF/CSV reports and confusion_matrix.png can be downloaded from /reports/
reports_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "reports"))
if not os.path.exists(reports_dir):
    os.makedirs(reports_dir, exist_ok=True)
app.mount("/reports", StaticFiles(directory=reports_dir), name="reports")

# Include Application Routers
app.include_router(upload.router)
app.include_router(analysis.router)
app.include_router(ranking.router)
app.include_router(evaluation.router)
app.include_router(settings.router)
app.include_router(reports.router)

@app.get("/", summary="System Root Health Endpoint")
def read_root():
    return {
        "status": "success",
        "message": "AI Resume Screening & ATS Analysis Engine API is active."
    }
