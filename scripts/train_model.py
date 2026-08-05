import os
import sys
import pandas as pd
import joblib
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay
)

def train_domain_classifier():
    """
    Modular training script for AI Resume Domain Classification.
    1. Loads and cleans dataset.csv
    2. Feature extraction via TF-IDF (max_features=5000)
    3. Trains Logistic Regression classifier
    4. Evaluates performance metrics (Accuracy, Precision, Recall, F1)
    5. Saves trained model, vectorizer, confusion matrix plot, and report text file.
    """
    # 1. Resolve File Paths
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Handle running from scripts/ or root directory
    if os.path.basename(current_dir) == "scripts":
        project_root = os.path.abspath(os.path.join(current_dir, ".."))
    else:
        project_root = current_dir

    csv_path = os.path.join(project_root, "dataset.csv")
    models_dir = os.path.join(project_root, "models")
    backend_models_dir = os.path.join(project_root, "backend", "models")
    reports_dir = os.path.join(project_root, "reports")

    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(backend_models_dir, exist_ok=True)
    os.makedirs(reports_dir, exist_ok=True)

    if not os.path.exists(csv_path):
        print(f"[Error] Dataset file not found at: {csv_path}")
        print("Please run python scripts/create_dataset.py first.")
        sys.exit(1)

    print(f"[1/6] Loading dataset from {csv_path}...")
    df = pd.read_csv(csv_path)

    # 2. Data Preprocessing & Deduplication
    initial_count = len(df)
    df = df.dropna(subset=["text"])
    df = df[df["text"].str.strip() != ""]
    df = df.drop_duplicates(subset=["text", "label"])
    cleaned_count = len(df)

    print(f" -> Raw Records: {initial_count} | Cleaned Deduplicated Records: {cleaned_count}")

    X = df["text"]
    y = df["label"]

    # 3. Train-Test Split (80/20 Stratified)
    print("[2/6] Splitting dataset into training and testing sets (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # 4. Feature Extraction via TF-IDF Vectorizer
    print("[3/6] Vectorizing text with TfidfVectorizer (max_features=5000, stop_words='english')...")
    vectorizer = TfidfVectorizer(max_features=5000, stop_words="english")
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    vocab_size = len(vectorizer.vocabulary_)

    # 5. Model Training (Logistic Regression)
    print("[4/6] Training Logistic Regression Classifier...")
    classifier = LogisticRegression(max_iter=1000, random_state=42)
    classifier.fit(X_train_vec, y_train)

    # 6. Evaluation Metrics Calculation
    print("[5/6] Evaluating model performance on test set...")
    y_pred = classifier.predict(X_test_vec)

    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    recall = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)
    
    cls_report = classification_report(y_test, y_pred, zero_division=0)
    cm = confusion_matrix(y_test, y_pred, labels=classifier.classes_)

    # 7. Print Terminal Summary Output
    print("\n==================================================")
    print("       RESUME DOMAIN CLASSIFIER RESULTS           ")
    print("==================================================")
    print(f"Dataset Size       : {cleaned_count}")
    print(f"Training Samples   : {len(X_train)}")
    print(f"Testing Samples    : {len(X_test)}")
    print(f"Vocabulary Size    : {vocab_size}")
    print("--------------------------------------------------")
    print(f"Accuracy           : {accuracy:.4f} ({accuracy*100:.2f}%)")
    print(f"Precision          : {precision:.4f}")
    print(f"Recall             : {recall:.4f}")
    print(f"F1 Score           : {f1:.4f}")
    print("==================================================\n")

    # 8. Save Trained Artifacts (.pkl)
    print("[6/6] Saving model artifacts and reports...")
    model_path = os.path.join(models_dir, "domain_classifier.pkl")
    vec_path = os.path.join(models_dir, "tfidf_vectorizer.pkl")
    
    joblib.dump(classifier, model_path)
    joblib.dump(vectorizer, vec_path)

    # Save duplicate copy to backend/models for runtime access
    joblib.dump(classifier, os.path.join(backend_models_dir, "domain_classifier.pkl"))
    joblib.dump(vectorizer, os.path.join(backend_models_dir, "tfidf_vectorizer.pkl"))

    print(f" -> Model saved to: {model_path}")
    print(f" -> Vectorizer saved to: {vec_path}")

    # 9. Save Classification Report Text
    report_file_path = os.path.join(reports_dir, "classification_report.txt")
    with open(report_file_path, "w", encoding="utf-8") as rf:
        rf.write("==================================================\n")
        rf.write("          CLASSIFICATION METRICS REPORT           \n")
        rf.write("==================================================\n\n")
        rf.write(f"Dataset Size       : {cleaned_count}\n")
        rf.write(f"Training Samples   : {len(X_train)}\n")
        rf.write(f"Testing Samples    : {len(X_test)}\n")
        rf.write(f"Vocabulary Size    : {vocab_size}\n\n")
        rf.write(f"Accuracy           : {accuracy:.4f}\n")
        rf.write(f"Precision          : {precision:.4f}\n")
        rf.write(f"Recall             : {recall:.4f}\n")
        rf.write(f"F1 Score           : {f1:.4f}\n\n")
        rf.write("--------------------------------------------------\n")
        rf.write("Detailed Classification Report:\n")
        rf.write("--------------------------------------------------\n")
        rf.write(cls_report)
    
    print(f" -> Classification report saved to: {report_file_path}")

    # 10. Save Confusion Matrix Plot
    fig, ax = plt.subplots(figsize=(16, 14))
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=classifier.classes_)
    disp.plot(ax=ax, cmap="Blues", xticks_rotation="vertical", values_format="d")
    plt.title("Resume Domain Classifier - Confusion Matrix", fontsize=14, pad=15)
    plt.tight_layout()

    cm_image_path = os.path.join(reports_dir, "confusion_matrix.png")
    plt.savefig(cm_image_path, dpi=300)
    plt.close()

    print(f" -> Confusion matrix plot saved to: {cm_image_path}")
    print("\n[Success] Model training pipeline completed successfully!")

if __name__ == "__main__":
    train_domain_classifier()
