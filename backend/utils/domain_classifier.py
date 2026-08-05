import os
import time
import joblib
import numpy as np
from utils.parser import clean_text

MODEL = None
VECTORIZER = None

def load_classifier_model():
    """
    Loads the trained LogisticRegression classifier and TfidfVectorizer into memory.
    Ensures artifacts are loaded ONCE during FastAPI startup.
    """
    global MODEL, VECTORIZER
    if MODEL is not None and VECTORIZER is not None:
        return

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path = os.path.join(base_dir, "models", "domain_classifier.pkl")
    vec_path = os.path.join(base_dir, "models", "tfidf_vectorizer.pkl")

    # Fallback check to root project models directory
    if not os.path.exists(model_path):
        root_dir = os.path.abspath(os.path.join(base_dir, ".."))
        model_path = os.path.join(root_dir, "models", "domain_classifier.pkl")
        vec_path = os.path.join(root_dir, "models", "tfidf_vectorizer.pkl")

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}. Please train the model first.")

    print(f"[ML Engine] Preloading classifier model from: {model_path}")
    MODEL = joblib.load(model_path)
    VECTORIZER = joblib.load(vec_path)
    print("[ML Engine] Domain Classifier and TF-IDF Vectorizer loaded successfully.")

def predict_domain(text: str) -> dict:
    """
    Pipeline:
    Resume Text -> Clean Text -> TF-IDF Vector -> predict_proba() -> Top 3 Domains & Confidence %
    """
    start_time = time.time()

    if MODEL is None or VECTORIZER is None:
        load_classifier_model()

    cleaned = clean_text(text)
    if not cleaned:
        elapsed = time.time() - start_time
        return {
            "predicted_domain": "UNKNOWN",
            "confidence": 0.0,
            "top_predictions": [],
            "processing_time": f"{elapsed:.2f} sec"
        }

    # TF-IDF Vectorization
    text_vec = VECTORIZER.transform([cleaned])
    classes = MODEL.classes_

    # Get class probabilities using predict_proba()
    if hasattr(MODEL, "predict_proba"):
        probs = MODEL.predict_proba(text_vec)[0]
    else:
        probs = np.zeros(len(classes))
        pred_label = MODEL.predict(text_vec)[0]
        pred_idx = np.where(classes == pred_label)[0][0]
        probs[pred_idx] = 1.0

    # Map class labels to confidence percentages
    predictions = [
        {
            "domain": str(cls),
            "confidence": round(float(prob) * 100.0, 2)
        }
        for cls, prob in zip(classes, probs)
    ]

    # Sort descending by confidence score
    sorted_predictions = sorted(predictions, key=lambda x: x["confidence"], reverse=True)
    top_3 = sorted_predictions[:3]

    top_domain = top_3[0]["domain"] if top_3 else "UNKNOWN"
    top_confidence = top_3[0]["confidence"] if top_3 else 0.0

    elapsed = time.time() - start_time

    return {
        "predicted_domain": top_domain,
        "confidence": top_confidence,
        "top_predictions": top_3,
        "processing_time": f"{elapsed:.2f} sec"
    }
