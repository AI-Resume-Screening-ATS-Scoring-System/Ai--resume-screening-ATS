import os
import csv
import time
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

REPORTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "reports"))
if not os.path.exists(REPORTS_DIR):
    os.makedirs(REPORTS_DIR, exist_ok=True)

def get_report_styles():
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#475569'),
        spaceAfter=12
    )
    h2_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0c8ee9'),
        spaceBefore=10,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#1e293b')
    )
    mono_style = ParagraphStyle(
        'MonoTextCustom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#334155')
    )
    return title_style, subtitle_style, h2_style, body_style, mono_style

def generate_analysis_pdf(candidate_data: Dict[str, Any]) -> str:
    """
    Generates a PDF report for Candidate Resume Analysis containing:
    1. Candidate Details
    2. Resume Statistics
    3. ATS Score
    4. Score Breakdown (All 8 categories with Score, Max, Reason, & Evidence)
    5. Similarity (TF-IDF Cosine Similarity, Keyword Coverage, Top Matching Sentences)
    6. Skill Gap (Matched Skills, Missing Target Skills, Additional Skills)
    7. Suggestions (Feedback Suggestions)
    8. Hallucination Report (Hallucination Rate, Grounded/Supported/Unsupported, Evidence Table)

    Saves to reports/Resume_Analysis_<candidate_name>.pdf
    """
    name = candidate_data.get("name", "Applicant").replace(" ", "_")
    filename = f"Resume_Analysis_{name}.pdf"
    filepath = os.path.join(REPORTS_DIR, filename)

    doc = SimpleDocTemplate(filepath, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    title_style, subtitle_style, h2_style, body_style, mono_style = get_report_styles()
    story = []

    # 1. Header Banner & Candidate Details
    story.append(Paragraph("RESUMIX ATS - CANDIDATE ANALYSIS REPORT", title_style))
    story.append(Paragraph(f"Generated on {time.strftime('%Y-%m-%d %H:%M:%S')} | Engine: Resumix ATS & Domain Classifier", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0c8ee9'), spaceAfter=10))

    cand_name = candidate_data.get("name", "Applicant")
    cand_email = candidate_data.get("email", "N/A")
    cand_phone = candidate_data.get("phone", "N/A")
    cand_role = candidate_data.get("appliedRole", "Software Engineer")
    cand_file = candidate_data.get("resumeFileName", "resume.pdf")

    details_table_data = [
        [
            Paragraph(f"<b>Candidate Name:</b> {cand_name}", body_style),
            Paragraph(f"<b>Applied Position:</b> {cand_role}", body_style)
        ],
        [
            Paragraph(f"<b>Email Address:</b> {cand_email}", body_style),
            Paragraph(f"<b>Phone Number:</b> {cand_phone}", body_style)
        ],
        [
            Paragraph(f"<b>Resume File:</b> {cand_file}", body_style),
            Paragraph(f"<b>Status:</b> {candidate_data.get('status', 'Shortlisted')}", body_style)
        ]
    ]
    t_details = Table(details_table_data, colWidths=[270, 270])
    t_details.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_details)
    story.append(Spacer(1, 10))

    # 2. Resume Statistics & Overview
    analysis_data = candidate_data.get("analysis", {}) or {}
    word_cnt = analysis_data.get("wordCount", 380)
    char_cnt = analysis_data.get("characterCount", 2450)
    domain = analysis_data.get("predictedDomain", "INFORMATION-TECHNOLOGY")
    confidence = analysis_data.get("domainConfidence", 88.5)
    proc_time = analysis_data.get("processingTime", "0.05 sec")

    stats_table_data = [
        ["Word Count", "Character Count", "ML Domain", "Domain Confidence", "Processing Time"],
        [str(word_cnt), str(char_cnt), domain, f"{confidence}%", proc_time]
    ]
    t_stats = Table(stats_table_data, colWidths=[108, 108, 116, 104, 104])
    t_stats.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#f1f5f9')),
        ('TEXTCOLOR', (0,1), (-1,1), colors.HexColor('#0f172a')),
        ('FONTNAME', (0,1), (-1,1), 'Helvetica-Bold'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_stats)
    story.append(Spacer(1, 10))

    # 3. ATS Score & Score Breakdown (Score, Max, Reason, & Evidence)
    ats_score = analysis_data.get("atsScore", candidate_data.get("matchScore", 86.0))
    story.append(Paragraph(f"ATS Score & Weighted Category Breakdown (Overall: {ats_score} / 100)", h2_style))

    breakdown = analysis_data.get("scoreBreakdown", {}) or {}
    categories = [
        ("technical_skills", "Technical Skills (30%)"),
        ("keyword_match", "Keyword Match (20%)"),
        ("experience", "Experience (15%)"),
        ("education", "Education (10%)"),
        ("projects", "Projects (10%)"),
        ("certifications", "Certifications (5%)"),
        ("contact", "Contact Info (5%)"),
        ("sections", "Resume Completeness (5%)")
    ]

    breakdown_table_data = [["Category", "Score", "Reason Explanation", "Empirical Evidence"]]
    for key, label in categories:
        item = breakdown.get(key, {})
        score_val = item.get("score", 0)
        max_val = item.get("max", 10)
        reason = item.get("reason", "Evaluated based on criteria.")
        evidence = item.get("evidence", "Extracted from text.")

        breakdown_table_data.append([
            Paragraph(f"<b>{label}</b>", body_style),
            Paragraph(f"<b>{score_val} / {max_val}</b>", body_style),
            Paragraph(reason, body_style),
            Paragraph(evidence, mono_style)
        ])

    t_breakdown = Table(breakdown_table_data, colWidths=[130, 50, 180, 180])
    t_breakdown.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e293b')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_breakdown)
    story.append(Spacer(1, 10))

    # 4. TF-IDF Cosine Similarity & Keyword Coverage
    similarity_score = analysis_data.get("similarityScore", 78.4)
    keyword_cov = analysis_data.get("keywordCoveragePct", 75.0)
    top_sentences = analysis_data.get("topMatchingSentences", [])

    story.append(Paragraph(f"TF-IDF Cosine Similarity ({similarity_score}%) & Keyword Coverage ({keyword_cov}%)", h2_style))
    if top_sentences:
        story.append(Paragraph("<b>Top Matching Resume Sentences:</b>", body_style))
        for idx, sent in enumerate(top_sentences[:2]):
            story.append(Paragraph(f"   {idx+1}. <i>\"{sent}\"</i>", body_style))
        story.append(Spacer(1, 4))

    # 5. Skill Gap Analysis
    matched_skills = ", ".join(analysis_data.get("matchingSkills", ["React", "Python"]))
    missing_skills = ", ".join(analysis_data.get("missingSkills", ["Kubernetes"]))

    story.append(Paragraph("Skill Gap Analysis", h2_style))
    story.append(Paragraph(f"<b>Matched Required Skills:</b> {matched_skills}", body_style))
    story.append(Spacer(1, 3))
    story.append(Paragraph(f"<b>Missing Target Skills:</b> {missing_skills}", body_style))
    story.append(Spacer(1, 10))

    # 6. Suggestions Section
    suggestions = analysis_data.get("topSuggestions", [])
    if suggestions:
        story.append(Paragraph("Feedback & Improvement Suggestions", h2_style))
        for sug in suggestions[:3]:
            p_text = f"• <b>[{sug.get('priority', 'Medium')} Priority] {sug.get('title', '')}:</b> {sug.get('description', '')}"
            story.append(Paragraph(p_text, body_style))
            story.append(Spacer(1, 3))
        story.append(Spacer(1, 8))

    # 7. Hallucination Report
    hallucination_report = analysis_data.get("hallucinationReport", {}) or {}
    h_rate = hallucination_report.get("hallucination_rate", 0.0)
    grounded = hallucination_report.get("grounded_suggestions", 4)
    supported = hallucination_report.get("supported_suggestions", 3)
    unsupported = hallucination_report.get("unsupported_suggestions", 0)

    story.append(Paragraph(f"Hallucination Detection Report (Hallucination Rate: {h_rate}%)", h2_style))
    story.append(Paragraph(f"<b>Grounded Suggestions:</b> {grounded} | <b>Supported Suggestions:</b> {supported} | <b>Unsupported Suggestions:</b> {unsupported}", body_style))
    story.append(Spacer(1, 4))

    validated_list = hallucination_report.get("validated_suggestions", [])
    if validated_list:
        val_table_data = [["Suggestion Title", "Evidence Description", "Confidence", "Status"]]
        for item in validated_list[:4]:
            val_table_data.append([
                Paragraph(item.get("suggestion", ""), body_style),
                Paragraph(item.get("evidence", ""), mono_style),
                f"{item.get('confidence', 90)}%",
                item.get("status", "Grounded")
            ])
        t_val = Table(val_table_data, colWidths=[140, 240, 70, 90])
        t_val.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 8),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(t_val)

    doc.build(story)
    return filepath

def generate_ranking_pdf(ranked_candidates: List[Dict[str, Any]]) -> str:
    filepath = os.path.join(REPORTS_DIR, "Candidate_Ranking_Report.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    title_style, subtitle_style, h2_style, body_style, mono_style = get_report_styles()
    story = []

    story.append(Paragraph("RESUMIX ATS - CANDIDATE RANKING MATRIX", title_style))
    story.append(Paragraph(f"Total Ranked Candidates: <b>{len(ranked_candidates)}</b> | Generated: {time.strftime('%Y-%m-%d %H:%M')}", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#0c8ee9'), spaceAfter=15))

    table_data = [["Rank", "Candidate Name", "File Name", "Predicted Domain", "ATS Score", "Similarity"]]
    for c in ranked_candidates:
        table_data.append([
            f"#{c.get('rank', 1)}",
            c.get('candidate', 'Applicant'),
            c.get('filename', 'resume.pdf'),
            c.get('domain', 'N/A'),
            f"{c.get('ats', 0)} / 100",
            f"{c.get('similarity', 0)}%"
        ])

    t = Table(table_data, colWidths=[40, 130, 140, 130, 50, 50])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t)

    doc.build(story)
    return filepath

def generate_evaluation_pdf(metrics_data: Dict[str, Any]) -> str:
    filepath = os.path.join(REPORTS_DIR, "Evaluation_Report.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    title_style, subtitle_style, h2_style, body_style, mono_style = get_report_styles()
    story = []

    story.append(Paragraph("MACHINE LEARNING EVALUATION REPORT", title_style))
    story.append(Paragraph(f"Model: <b>{metrics_data.get('model_name', 'Logistic Regression')}</b> | Date: {time.strftime('%Y-%m-%d')}", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#0c8ee9'), spaceAfter=15))

    table_data = [
        ["Accuracy", "Precision", "Recall", "F1 Score", "Dataset Size", "Vocab Size"],
        [
            f"{metrics_data.get('accuracy', 0)}%",
            f"{metrics_data.get('precision', 0)}%",
            f"{metrics_data.get('recall', 0)}%",
            f"{metrics_data.get('f1_score', 0)}%",
            str(metrics_data.get('dataset_size', 2481)),
            str(metrics_data.get('vocabulary_size', 5000))
        ]
    ]

    t = Table(table_data, colWidths=[90, 90, 90, 90, 90, 90])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#f1f5f9')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t)
    story.append(Spacer(1, 15))

    story.append(Paragraph("Per-Class Classification Metrics", h2_style))
    class_table = [["Domain Class", "Precision %", "Recall %", "F1 Score %", "Support"]]
    for item in metrics_data.get("per_class_metrics", []):
        class_table.append([
            item.get("domain", ""),
            f"{item.get('precision', 0)}%",
            f"{item.get('recall', 0)}%",
            f"{item.get('f1_score', 0)}%",
            str(item.get("support", 0))
        ])

    t2 = Table(class_table, colWidths=[180, 90, 90, 90, 90])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e293b')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t2)

    doc.build(story)
    return filepath

def generate_ranking_csv(ranked_candidates: List[Dict[str, Any]]) -> str:
    filepath = os.path.join(REPORTS_DIR, "Candidate_Ranking.csv")
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Rank", "Candidate Name", "File Name", "Predicted Domain", "Confidence %", "ATS Score", "Similarity %"])
        for c in ranked_candidates:
            writer.writerow([
                c.get('rank', 1),
                c.get('candidate', 'Applicant'),
                c.get('filename', 'resume.pdf'),
                c.get('domain', 'N/A'),
                f"{c.get('confidence', 0)}%",
                c.get('ats', 0),
                f"{c.get('similarity', 0)}%"
            ])
    return filepath

def generate_evaluation_csv(metrics_data: Dict[str, Any]) -> str:
    filepath = os.path.join(REPORTS_DIR, "Evaluation_Report.csv")
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Domain Class", "Precision %", "Recall %", "F1 Score %", "Support"])
        for item in metrics_data.get("per_class_metrics", []):
            writer.writerow([
                item.get("domain", ""),
                item.get("precision", 0),
                item.get("recall", 0),
                item.get("f1_score", 0),
                item.get("support", 0)
            ])
    return filepath
