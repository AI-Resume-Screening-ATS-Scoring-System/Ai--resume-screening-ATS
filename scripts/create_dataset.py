import os
import sys
import csv

# Add project root and backend to python path for modular utility importing
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from utils.parser import extract_text_from_pdf

def generate_dataset():
    dataset_dir = os.path.join(PROJECT_ROOT, "dataset")
    output_csv = os.path.join(PROJECT_ROOT, "dataset.csv")

    if not os.path.exists(dataset_dir):
        print(f"[Error] Dataset directory not found at: {dataset_dir}")
        return

    print(f"[Dataset Preparation] Scanning dataset directory: {dataset_dir}")

    records = []
    category_counts = {}

    # Iterate through every folder in dataset/
    for category in os.listdir(dataset_dir):
        category_path = os.path.join(dataset_dir, category)
        
        if not os.path.isdir(category_path):
            continue

        label = category.strip()
        pdf_files = [f for f in os.listdir(category_path) if f.lower().endswith(".pdf")]
        
        print(f" -> Processing '{label}': {len(pdf_files)} PDF resumes...")
        processed_count = 0

        for pdf_name in pdf_files:
            pdf_path = os.path.join(category_path, pdf_name)
            clean_text = extract_text_from_pdf(pdf_path)

            if clean_text:
                records.append({
                    "text": clean_text,
                    "label": label
                })
                processed_count += 1

        category_counts[label] = processed_count

    print(f"\n[Writing CSV] Saving {len(records)} extracted records to {output_csv}...")
    
    with open(output_csv, mode="w", newline="", encoding="utf-8") as csv_file:
        writer = csv.writer(csv_file, quoting=csv.QUOTE_ALL)
        # Write Header
        writer.writerow(["text", "label"])
        
        # Write Records
        for record in records:
            writer.writerow([record["text"], record["label"]])

    print(f"[Success] dataset.csv created successfully with {len(records)} entries!")
    print("\nSummary per category:")
    for cat, count in category_counts.items():
        print(f"  • {cat}: {count} resumes")

if __name__ == "__main__":
    generate_dataset()
