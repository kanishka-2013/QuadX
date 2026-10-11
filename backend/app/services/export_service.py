import pandas as pd
import io
from typing import List, Optional
from app.models import CleanResponse, ChangeLogEntry

def generate_csv_bytes(df: pd.DataFrame, columns: Optional[List[str]] = None) -> bytes:
    export_df = df.copy()
    if columns:
        valid_cols = [c for c in columns if c in export_df.columns]
        if valid_cols:
            export_df = export_df[valid_cols]
            
    buffer = io.StringIO()
    export_df.to_csv(buffer, index=False)
    return buffer.getvalue().encode('utf-8')

def generate_excel_bytes(df: pd.DataFrame, columns: Optional[List[str]] = None) -> bytes:
    export_df = df.copy()
    if columns:
        valid_cols = [c for c in columns if c in export_df.columns]
        if valid_cols:
            export_df = export_df[valid_cols]

    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        export_df.to_excel(writer, index=False, sheet_name='Cleaned Data')
    buffer.seek(0)
    return buffer.getvalue()

def generate_summary_report_text(filename: str, original_shape: tuple, cleaned_shape: tuple, score_before: float, score_after: float, change_log: List[ChangeLogEntry]) -> str:
    report = f"=========================================================\n"
    report += f"          DATAGENIUS AI - DATA CLEANING AUDIT REPORT      \n"
    report += f"=========================================================\n\n"
    report += f"Original File Name: {filename}\n"
    report += f"Original Dimensions: {original_shape[0]} rows x {original_shape[1]} columns\n"
    report += f"Cleaned Dimensions:  {cleaned_shape[0]} rows x {cleaned_shape[1]} columns\n\n"
    report += f"Data Quality Score (Before): {score_before} / 100\n"
    report += f"Data Quality Score (After):  {score_after} / 100\n"
    report += f"Score Improvement:           +{round(score_after - score_before, 1)} points\n\n"
    report += f"---------------------------------------------------------\n"
    report += f"EXECUTED CLEANING OPERATIONS AUDIT TRAIL:\n"
    report += f"---------------------------------------------------------\n"
    
    if not change_log:
        report += "No cleaning operations were executed on this dataset.\n"
    else:
        for idx, entry in enumerate(change_log, 1):
            if isinstance(entry, dict):
                act_type = entry.get('action_type', 'Action')
                desc = entry.get('description', '')
                ts = entry.get('timestamp', '')
                rows = entry.get('affected_rows', 0)
            else:
                act_type = entry.action_type
                desc = entry.description
                ts = entry.timestamp
                rows = entry.affected_rows
            report += f"{idx}. [{ts}] {act_type.upper()}: {desc} (Affected Rows: {rows})\n"

    report += f"\n=========================================================\n"
    report += f"Generated automatically by DataGenius AI Platform\n"
    report += f"=========================================================\n"
    return report
