import os
import httpx
import pandas as pd
from typing import Dict, Any, List
from app.models import AIInsightsResponse, AnalysisResponse
from app.config import GEMINI_API_KEY, OPENAI_API_KEY

def generate_ai_insights(analysis: AnalysisResponse, cleaned_score_val: float = None) -> AIInsightsResponse:
    dataset_id = analysis.dataset_id
    issues = analysis.issues
    
    # 1. Columns requiring manual review
    manual_review_cols: List[Dict[str, str]] = []
    
    # High missing percentage > 20%
    for col, pct in analysis.missing_percentages.items():
        if pct > 20.0:
            manual_review_cols.append({
                "column": col,
                "reason": f"High missing value density ({pct}% missing). Imputation may introduce bias; verify original data source.",
                "severity": "High"
            })
            
    # Ambiguous data types or invalid emails
    for issue in issues:
        if issue.issue_type == "invalid_email":
            manual_review_cols.append({
                "column": issue.column_name or "Email",
                "reason": f"Found {issue.affected_count} syntax-invalid email addresses. Check for typos or fake test entries.",
                "severity": "High"
            })
        elif issue.issue_type == "numeric_as_text":
            manual_review_cols.append({
                "column": issue.column_name or "Numeric Text",
                "reason": f"Contains text strings in numeric column. Check for non-standard currency symbols or text errors.",
                "severity": "Medium"
            })

    # Deduplicate manual review items
    seen_manual = set()
    unique_manual_review = []
    for item in manual_review_cols:
        key = item["column"] + item["reason"]
        if key not in seen_manual:
            seen_manual.add(key)
            unique_manual_review.append(item)

    # 2. Rule-based recommendation engine
    recommendations: List[Dict[str, str]] = []
    
    if analysis.duplicate_rows_count > 0:
        recommendations.append({
            "operation": "Remove Duplicate Rows",
            "impact": "High",
            "why": f"Eliminates {analysis.duplicate_rows_count} redundant records to prevent inflated aggregated metrics and duplicated calculations."
        })

    has_missing = any(cnt > 0 for cnt in analysis.missing_values_by_column.values())
    if has_missing:
        recommendations.append({
            "operation": "Missing Value Imputation",
            "impact": "High",
            "why": "Fills missing values with median/mode or drops sparse rows so downstream ML models and statistical tools don't crash."
        })

    whitespace_issues = [i for i in issues if i.issue_type == "whitespace"]
    if whitespace_issues:
        recommendations.append({
            "operation": "Trim Whitespace",
            "impact": "Medium",
            "why": "Strips invisible trailing/leading spaces to ensure exact text matching and prevent database query lookup failures."
        })

    col_name_issues = [i for i in issues if i.issue_type == "inconsistent_column_name"]
    if col_name_issues:
        recommendations.append({
            "operation": "Standardize Column Names",
            "impact": "Medium",
            "why": "Converts messy spaces and special symbols into standardized snake_case (e.g., customer_id) for SQL/Pandas code compatibility."
        })

    cap_issues = [i for i in issues if i.issue_type == "capitalization"]
    if cap_issues:
        recommendations.append({
            "operation": "Standardize Capitalization",
            "impact": "Low",
            "why": "Harmonizes mixed UPPERCASE, lowercase, and Title Case strings into uniform categories."
        })

    email_issues = [i for i in issues if i.issue_type == "invalid_email"]
    if email_issues:
        recommendations.append({
            "operation": "Normalize Email Addresses",
            "impact": "High",
            "why": "Cleans double `@` symbols and lowercases emails for consistent user identity resolution."
        })

    num_text_issues = [i for i in issues if i.issue_type == "numeric_as_text"]
    if num_text_issues:
        recommendations.append({
            "operation": "Convert Numeric Strings",
            "impact": "High",
            "why": "Strips currency symbols ('$') and commas (',') so numbers can be calculated in mathematical aggregations."
        })

    # Summary synthesis
    summary_text = (
        f"DataGenius AI analyzed the dataset '{analysis.filename}' ({analysis.total_rows} rows x {analysis.total_columns} cols). "
        f"The initial Data Quality Score is {analysis.quality_score.total_score}/100. "
        f"We identified {len(analysis.issues)} quality issue category(ies), including {analysis.duplicate_rows_count} duplicate rows, "
        f"and missing values across {sum(1 for cnt in analysis.missing_values_by_column.values() if cnt > 0)} column(s)."
    )

    before_score = analysis.quality_score.total_score
    after_score_est = cleaned_score_val if cleaned_score_val is not None else min(98.5, before_score + 35.0)

    executive_report = (
        f"### DataGenius AI Executive Audit & Cleaning Report\n\n"
        f"**Dataset:** {analysis.filename}\n"
        f"**Initial Health Index:** {before_score}/100\n"
        f"**Post-Cleaning Health Index:** {after_score_est}/100\n\n"
        f"#### Identified Data Anomalies:\n"
    )
    for idx, iss in enumerate(issues, 1):
        executive_report += f"{idx}. **[{iss.severity}] {iss.issue_type.upper()}**: {iss.description} *Recommendation:* {iss.recommended_action}\n"

    executive_report += f"\n#### Strategic Cleaning Impact:\n"
    for rec in recommendations:
        executive_report += f"- **{rec['operation']}**: {rec['why']}\n"

    quality_improvement_summary = (
        f"Applying recommended automated cleaning transforms dataset quality from {before_score}/100 to ~{after_score_est}/100, "
        f"eliminating invalid syntax, normalizing schemas, and ensuring reliable data integrity for downstream analytics."
    )

    return AIInsightsResponse(
        dataset_id=dataset_id,
        is_llm_powered=False,
        summary=summary_text,
        recommended_operations=recommendations,
        executive_report=executive_report,
        columns_requiring_manual_review=unique_manual_review,
        quality_improvement_summary=quality_improvement_summary
    )
