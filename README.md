# 📄 AI Resume Screening & ATS Scoring System

An end-to-end AI-powered Resume Screening and Applicant Tracking System (ATS) that automatically parses resumes, classifies candidate domains, calculates ATS scores, ranks applicants, generates reports, and provides recruiter-friendly analytics through a modern React dashboard.


## 📸 Project Screenshots

| Dashboard | Upload Resume |
|-----------|---------------|
| ![](screenshots/dashboard.png) | ![](screenshots/upload.png) |

| Resume Analysis | Candidate Ranking |
|----------------|-------------------|
| ![](screenshots/analysis.png) | ![](screenshots/ranking.png) |

| Evaluation Dashboard | Settings |
|----------------------|----------|
| ![](screenshots/evaluation.png) | ![](screenshots/settings.png) |

## ✨ Features

- Resume Upload (PDF & DOCX)
- Batch Resume Processing
- ATS Compatibility Scoring
- TF-IDF + Logistic Regression Domain Classification
- Resume Similarity Matching
- Candidate Ranking Matrix
- Resume Analytics Dashboard
- Recruiter Notes
- PDF Report Generation
- CSV Export
- Candidate Deletion
- System Statistics Dashboard
- Dark Theme UI
- Multiple Theme Palettes
- Responsive Dashboard

## 🛠 Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router

### Backend
- FastAPI
- Python
- SQLite
- ReportLab

### Machine Learning
- Scikit-learn
- TF-IDF Vectorizer
- Logistic Regression
- Cosine Similarity
- NumPy
- Pandas

### Visualization
- Matplotlib

## 📂 Project Structure

```text
ATS/
├── backend/
├── frontend/
├── dataset/
├── models/
├── reports/
├── screenshots/
├── scripts/
├── train_model.py
├── README.md
└── .gitignore
```

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/hnimje14/ATS.git
cd ATS
```

### 2. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## ▶️ Running the Project

### Start Backend

```bash
cd backend
uvicorn app:app --reload
```

Backend URL:

```
http://localhost:8000
```

---

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend URL:

```
http://localhost:3000
```

## 🧠 Machine Learning Pipeline

- Resume Parsing
- Text Preprocessing
- TF-IDF Feature Extraction
- Logistic Regression Domain Classification
- Cosine Similarity Matching
- Rule-Based ATS Score Calculation
- Skill Extraction
- Candidate Ranking
- PDF & CSV Report Generation

## 📊 Evaluation Metrics

- Accuracy
- Precision
- Recall
- F1 Score
- Confusion Matrix
- Classification Report

## 📁 Dataset

- Resume Dataset: 2,481 resumes
- 24 Job Domains
- TF-IDF Vocabulary Size: 5,000 Features

## 🔮 Future Improvements

- Resume Recommendation Engine
- Semantic Matching using Sentence Transformers
- Interview Question Generation using LLMs
- Recruiter Authentication
- PostgreSQL Integration
- Docker Deployment
- Cloud Deployment (AWS/Azure)

## 👨‍💻 Author

**Harshal Nimje**
**Manish Punekar**

Computer Engineering Student

AI • Machine Learning • Deep Learning

## ⭐ Support

If you found this project useful, please consider giving it a ⭐ on GitHub.