from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class DetectedIssue(BaseModel):
    id: str
    issue_type: str  # duplicate_rows, missing_values, inconsistent_column_name, duplicate_columns, whitespace, capitalization, inconsistent_dates, numeric_as_text, invalid_email, mixed_types
    column_name: Optional[str] = None
    affected_count: int
    severity: str  # High, Medium, Low
    description: str
    recommended_action: str

class QualityScoreBreakdown(BaseModel):
    total_score: float
    missing_value_score: float
    duplicate_score: float
    formatting_score: float
    naming_score: float
    explanation: Dict[str, str]

class AnalysisResponse(BaseModel):
    dataset_id: str
    filename: str
    total_rows: int
    total_columns: int
    file_size_bytes: int
    file_size_formatted: str
    column_names: List[str]
    column_types: Dict[str, str]
    quality_score: QualityScoreBreakdown
    issues: List[DetectedIssue]
    missing_values_by_column: Dict[str, int]
    missing_percentages: Dict[str, float]
    duplicate_rows_count: int

class MissingValueAction(BaseModel):
    column: str
    strategy: str  # keep, remove_rows, fill_mean, fill_median, fill_mode, fill_custom
    custom_value: Optional[str] = None

class CleaningOptions(BaseModel):
    remove_duplicates: bool = False
    normalize_column_names: bool = False
    trim_whitespace: bool = False
    standardize_capitalization: Optional[str] = None  # None, "title", "lower", "upper"
    normalize_emails: bool = False
    normalize_dates: bool = False
    date_columns: Optional[List[str]] = None
    convert_numeric_text: bool = False
    numeric_columns: Optional[List[str]] = None
    missing_value_actions: Optional[List[MissingValueAction]] = []

class RestructureOptions(BaseModel):
    rename_columns: Optional[Dict[str, str]] = None
    reorder_columns: Optional[List[str]] = None
    keep_columns: Optional[List[str]] = None
    remove_columns: Optional[List[str]] = None

class ChangeLogEntry(BaseModel):
    id: str
    timestamp: str
    action_type: str
    description: str
    affected_rows: int
    affected_columns: List[str]

class CleanResponse(BaseModel):
    dataset_id: str
    original_total_rows: int
    cleaned_total_rows: int
    original_total_cols: int
    cleaned_total_cols: int
    cleaned_records_count: int
    quality_score_before: QualityScoreBreakdown
    quality_score_after: QualityScoreBreakdown
    change_log: List[ChangeLogEntry]
    column_names: List[str]
    column_types: Dict[str, str]

class AIInsightsResponse(BaseModel):
    dataset_id: str
    is_llm_powered: bool
    summary: str
    recommended_operations: List[Dict[str, str]]
    executive_report: str
    columns_requiring_manual_review: List[Dict[str, str]]
    quality_improvement_summary: str

class PaginationParams(BaseModel):
    page: int = 1
    page_size: int = 50
    search: Optional[str] = None
    sort_by: Optional[str] = None
    sort_desc: bool = False

class PreviewResponse(BaseModel):
    dataset_id: str
    total_rows: int
    total_columns: int
    page: int
    page_size: int
    total_pages: int
    columns: List[str]
    data: List[Dict[str, Any]]
