import pandas as pd
import numpy as np
import re
import uuid
from typing import List, Dict, Any
from app.models import DetectedIssue, AnalysisResponse
from app.services.quality_score_service import calculate_quality_score

def analyze_dataset(df: pd.DataFrame, dataset_id: str, filename: str, file_size_bytes: int) -> AnalysisResponse:
    issues: List[DetectedIssue] = []
    total_rows = len(df)
    total_cols = len(df.columns)

    # 1. Exact Duplicate Rows
    duplicate_count = df.duplicated().sum()
    if duplicate_count > 0:
        issues.append(DetectedIssue(
            id=str(uuid.uuid4()),
            issue_type="duplicate_rows",
            column_name=None,
            affected_count=int(duplicate_count),
            severity="High",
            description=f"Found {duplicate_count} exact duplicate rows in dataset.",
            recommended_action="Deduplicate dataset by keeping unique records."
        ))

    # 2. Missing Values per Column
    missing_values_by_col = {}
    missing_percentages = {}
    
    for col in df.columns:
        col_str = df[col].astype(str).str.strip().str.lower()
        missing_mask = df[col].isna() | col_str.isin(['', 'nan', 'n/a', 'na', 'null', 'none', 'undefined'])
        missing_cnt = int(missing_mask.sum())
        missing_values_by_col[str(col)] = missing_cnt
        missing_percentages[str(col)] = round((missing_cnt / total_rows * 100.0), 1) if total_rows > 0 else 0.0

        if missing_cnt > 0:
            severity = "High" if (missing_cnt / total_rows) > 0.2 else "Medium"
            issues.append(DetectedIssue(
                id=str(uuid.uuid4()),
                issue_type="missing_values",
                column_name=str(col),
                affected_count=missing_cnt,
                severity=severity,
                description=f"Column '{col}' has {missing_cnt} missing or null values ({missing_percentages[str(col)]}%).",
                recommended_action="Impute missing values using mean/median/mode or drop affected rows."
            ))

    # 3. Duplicate Column Names
    col_names_raw = [str(c) for c in df.columns]
    duplicate_cols = [c for c in set(col_names_raw) if col_names_raw.count(c) > 1]
    if duplicate_cols:
        issues.append(DetectedIssue(
            id=str(uuid.uuid4()),
            issue_type="duplicate_columns",
            column_name=", ".join(duplicate_cols),
            affected_count=len(duplicate_cols),
            severity="High",
            description=f"Duplicate column headers found: {', '.join(duplicate_cols)}.",
            recommended_action="Normalize headers or append unique indices."
        ))

    # 4. Inconsistent Column Naming Conventions
    messy_cols = []
    for col in col_names_raw:
        if col != col.strip() or ' ' in col or any(char in col for char in ['$', '(', ')', '#', '%', '@', '-']):
            messy_cols.append(col)
    if messy_cols:
        issues.append(DetectedIssue(
            id=str(uuid.uuid4()),
            issue_type="inconsistent_column_name",
            column_name=", ".join(messy_cols[:3]) + ("..." if len(messy_cols) > 3 else ""),
            affected_count=len(messy_cols),
            severity="Medium",
            description=f"{len(messy_cols)} columns use non-standard naming format (spaces, symbols, or un-trimmed whitespace).",
            recommended_action="Normalize column headers to clean snake_case format (e.g. 'customer_name')."
        ))

    # 5. Leading/Trailing Whitespace in Text Cells
    # 6. Inconsistent Capitalization
    # 7. Numeric Values Stored as Text
    # 8. Inconsistent Date Formats
    # 9. Invalid Emails
    email_regex = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

    for col in df.columns:
        col_name = str(col)
        series_str = df[col].astype(str).str.strip()
        raw_str = df[col].astype(str)

        # Whitespace check
        whitespace_count = int((raw_str != series_str).sum())
        if whitespace_count > 0:
            issues.append(DetectedIssue(
                id=str(uuid.uuid4()),
                issue_type="whitespace",
                column_name=col_name,
                affected_count=whitespace_count,
                severity="Low",
                description=f"Column '{col_name}' contains {whitespace_count} cell values with leading or trailing whitespace.",
                recommended_action="Trim unnecessary whitespace across text cells."
            ))

        # Filter out missing values into clean string list
        non_null_strings = series_str[~series_str.str.lower().isin(['nan', 'n/a', 'na', 'null', 'none', '', 'undefined'])]

        # Capitalization check
        if len(non_null_strings) > 0 and df[col].dtype == object:
            str_list = [str(x) for x in non_null_strings]
            unique_vals = set(str_list)
            unique_lower = set([s.lower() for s in str_list])
            if len(unique_vals) > len(unique_lower):
                inconsistent_cap_count = len(unique_vals) - len(unique_lower)
                issues.append(DetectedIssue(
                    id=str(uuid.uuid4()),
                    issue_type="capitalization",
                    column_name=col_name,
                    affected_count=inconsistent_cap_count,
                    severity="Low",
                    description=f"Column '{col_name}' has inconsistent capitalization (e.g. mixed UPPER, lower, and Title Case).",
                    recommended_action="Standardize text capitalization across categorical values."
                ))

        # Invalid Emails check
        if 'email' in col_name.lower():
            invalid_email_cnt = 0
            for val in non_null_strings:
                s_val = str(val)
                if not email_regex.match(s_val):
                    invalid_email_cnt += 1
            if invalid_email_cnt > 0:
                issues.append(DetectedIssue(
                    id=str(uuid.uuid4()),
                    issue_type="invalid_email",
                    column_name=col_name,
                    affected_count=invalid_email_cnt,
                    severity="High",
                    description=f"Column '{col_name}' contains {invalid_email_cnt} invalid email addresses.",
                    recommended_action="Normalize email addresses to lowercase and fix malformed domain formats."
                ))

        # Numeric stored as Text check
        if df[col].dtype == object:
            numeric_like = non_null_strings.apply(lambda v: bool(re.match(r'^\$?\s*-?\d+(?:,\d{3})*(?:\.\d+)?%?$', str(v))))
            num_matches = int(numeric_like.sum())
            if num_matches > 0 and num_matches / max(1, len(non_null_strings)) > 0.5:
                issues.append(DetectedIssue(
                    id=str(uuid.uuid4()),
                    issue_type="numeric_as_text",
                    column_name=col_name,
                    affected_count=num_matches,
                    severity="Medium",
                    description=f"Column '{col_name}' contains numeric values formatted as text strings (e.g. currency '$' or commas).",
                    recommended_action="Convert string values into clean numeric floating point numbers."
                ))

        # Inconsistent Date Formats check
        if any(kw in col_name.lower() for kw in ['date', 'time', 'created', 'joined', 'dob', 'at']):
            date_formats_detected = set()
            for val in non_null_strings[:50]:
                val_s = str(val)
                if re.match(r'^\d{4}-\d{2}-\d{2}$', val_s):
                    date_formats_detected.add("YYYY-MM-DD")
                elif re.match(r'^\d{2}/\d{2}/\d{4}$', val_s):
                    date_formats_detected.add("DD/MM/YYYY")
                elif re.match(r'^[A-Za-z]{3}\s\d{1,2},\s\d{4}$', val_s):
                    date_formats_detected.add("MMM DD, YYYY")
                elif re.match(r'^\d{4}/\d{2}/\d{2}$', val_s):
                    date_formats_detected.add("YYYY/MM/DD")

            if len(date_formats_detected) > 1:
                issues.append(DetectedIssue(
                    id=str(uuid.uuid4()),
                    issue_type="inconsistent_dates",
                    column_name=col_name,
                    affected_count=len(non_null_strings),
                    severity="Medium",
                    description=f"Column '{col_name}' contains multiple date string formats ({', '.join(date_formats_detected)}).",
                    recommended_action="Normalize date strings into ISO standard format (YYYY-MM-DD)."
                ))

    def format_size(bytes_val: int) -> str:
        for unit in ['B', 'KB', 'MB', 'GB']:
            if bytes_val < 1024.0:
                return f"{bytes_val:.1f} {unit}"
            bytes_val /= 1024.0
        return f"{bytes_val:.1f} GB"

    quality_score = calculate_quality_score(df)
    column_types = {str(c): str(df[c].dtype) for c in df.columns}

    return AnalysisResponse(
        dataset_id=dataset_id,
        filename=filename,
        total_rows=total_rows,
        total_columns=total_cols,
        file_size_bytes=file_size_bytes,
        file_size_formatted=format_size(file_size_bytes),
        column_names=[str(c) for c in df.columns],
        column_types=column_types,
        quality_score=quality_score,
        issues=issues,
        missing_values_by_column=missing_values_by_col,
        missing_percentages=missing_percentages,
        duplicate_rows_count=int(duplicate_count)
    )
