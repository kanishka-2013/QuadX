import pandas as pd
import numpy as np
import re
from typing import Dict, Any
from app.models import QualityScoreBreakdown

def calculate_quality_score(df: pd.DataFrame) -> QualityScoreBreakdown:
    if df is None or len(df) == 0:
        return QualityScoreBreakdown(
            total_score=0.0,
            missing_value_score=0.0,
            duplicate_score=0.0,
            formatting_score=0.0,
            naming_score=0.0,
            explanation={
                "missing": "Empty dataset",
                "duplicates": "Empty dataset",
                "formatting": "Empty dataset",
                "naming": "Empty dataset"
            }
        )

    total_rows = len(df)
    total_cols = len(df.columns)
    total_cells = total_rows * total_cols

    # 1. Missing Values Score (30%)
    # Count NaNs, empty strings, 'N/A', 'NaN', 'null', 'none'
    null_count = 0
    for col in df.columns:
        col_series = df[col].astype(str).str.strip().str.lower()
        missing_mask = df[col].isna() | col_series.isin(['', 'nan', 'n/a', 'na', 'null', 'none'])
        null_count += missing_mask.sum()

    missing_pct = (null_count / total_cells) if total_cells > 0 else 0
    missing_score = max(0.0, 100.0 * (1.0 - (missing_pct * 2.0)))  # Penalty scales

    # 2. Duplicate Rows Score (25%)
    duplicate_rows = df.duplicated().sum()
    duplicate_pct = (duplicate_rows / total_rows) if total_rows > 0 else 0
    duplicate_score = max(0.0, 100.0 * (1.0 - (duplicate_pct * 2.5)))

    # 3. Formatting & Data Consistency Score (25%)
    formatting_issues = 0
    email_regex = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    
    for col in df.columns:
        series_str = df[col].astype(str)
        # Check leading/trailing whitespace
        whitespace_count = (series_str != series_str.str.strip()).sum()
        formatting_issues += whitespace_count
        
        # Check email format if column name suggests email
        if 'email' in str(col).lower():
            for val in series_str:
                val_clean = str(val).strip()
                if val_clean and val_clean.lower() not in ['nan', 'n/a', 'na', 'null', '']:
                    if not email_regex.match(val_clean):
                        formatting_issues += 1
                        
        # Check numeric stored with currency symbols or commas
        if any(keyword in str(col).lower() for keyword in ['amount', 'price', 'sales', 'cost', 'total', 'salary']):
            non_numeric = series_str.apply(lambda v: bool(re.search(r'[\$,]', str(v))) or str(v).lower() in ['error', 'nan'])
            formatting_issues += non_numeric.sum()

    formatting_issue_pct = (formatting_issues / (total_cells * 0.5)) if total_cells > 0 else 0
    formatting_score = max(0.0, 100.0 * (1.0 - min(1.0, formatting_issue_pct)))

    # 4. Column Naming Score (20%)
    naming_issues = 0
    col_names = list(df.columns)
    
    # Check duplicate column names
    if len(col_names) != len(set(col_names)):
        naming_issues += (len(col_names) - len(set(col_names))) * 2

    for col in col_names:
        col_str = str(col)
        # Leading/trailing spaces in column name
        if col_str != col_str.strip():
            naming_issues += 1
        # Non-snakecase or spaces or special chars
        if ' ' in col_str or any(char in col_str for char in ['$', '(', ')', '#', '%', '@']):
            naming_issues += 1

    naming_issue_pct = (naming_issues / (total_cols * 2)) if total_cols > 0 else 0
    naming_score = max(0.0, 100.0 * (1.0 - min(1.0, naming_issue_pct)))

    # Overall Composite Score
    total_score = round(
        (missing_score * 0.30) +
        (duplicate_score * 0.25) +
        (formatting_score * 0.25) +
        (naming_score * 0.20),
        1
    )

    return QualityScoreBreakdown(
        total_score=total_score,
        missing_value_score=round(missing_score, 1),
        duplicate_score=round(duplicate_score, 1),
        formatting_score=round(formatting_score, 1),
        naming_score=round(naming_score, 1),
        explanation={
            "missing": f"Missing value density: {round(missing_pct * 100, 1)}% of all data cells.",
            "duplicates": f"Duplicate rows detected: {duplicate_rows} out of {total_rows} rows.",
            "formatting": f"Format anomalies detected: whitespace, email syntax, or numeric string formatting issues.",
            "naming": f"Column schema issues: non-standard casing, spaces, or duplicate column headers."
        }
    )
