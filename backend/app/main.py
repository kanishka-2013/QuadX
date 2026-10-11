import io
import os
import pandas as pd
from typing import Optional, List
from fastapi import FastAPI, File, UploadFile, HTTPException, Query, Response, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse, Response

from app.config import MAX_FILE_SIZE_BYTES
from app.utils.file_storage import storage
from app.utils.sample_data import create_sample_messy_csv
from app.models import (
    AnalysisResponse, CleaningOptions, RestructureOptions,
    CleanResponse, PreviewResponse, AIInsightsResponse
)
from app.services.analysis_service import analyze_dataset
from app.services.cleaning_service import clean_dataset
from app.services.restructuring_service import restructure_dataset
from app.services.quality_score_service import calculate_quality_score
from app.services.ai_insight_service import generate_ai_insights
from app.services.export_service import (
    generate_csv_bytes, generate_excel_bytes, generate_summary_report_text
)

app = FastAPI(
    title="DataGenius AI API",
    description="Backend API for automated data cleaning, normalization, deduplication, and restructuring.",
    version="1.0.0"
)

# CORS Middleware allowing local React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "DataGenius AI API",
        "version": "1.0.0",
        "docs": "/docs"
    }

# 1. FILE UPLOAD
@app.post("/upload", response_model=AnalysisResponse)
async def upload_dataset(file: UploadFile = File(...)):
    filename = file.filename or "uploaded_dataset.csv"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in ['.csv', '.xlsx', '.xls']:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Please upload a valid CSV (.csv) or Excel (.xlsx) file."
        )

    contents = await file.read()
    file_size = len(contents)

    if file_size == 0:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty (0 bytes). Please upload a dataset with valid data rows."
        )

    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum limit of {MAX_FILE_SIZE_BYTES / (1024*1024):.0f}MB."
        )

    try:
        if ext == '.csv':
            # Try reading UTF-8, fallback to latin-1
            try:
                df = pd.read_csv(io.BytesIO(contents))
            except UnicodeDecodeError:
                df = pd.read_csv(io.BytesIO(contents), encoding='latin-1')
        else:
            df = pd.read_excel(io.BytesIO(contents), engine='openpyxl')
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to parse dataset file. Error: {str(e)}"
        )

    if df.empty or len(df) == 0:
        raise HTTPException(
            status_code=400,
            detail="Parsed dataset contains no data rows. Please check file contents."
        )

    dataset_id = storage.save_dataset(df, filename, file_size)
    analysis = analyze_dataset(df, dataset_id, filename, file_size)
    return analysis

# 2. SAMPLE DATASET
@app.post("/dataset/sample", response_model=AnalysisResponse)
def load_sample_dataset():
    sample_path = create_sample_messy_csv()
    filename = "sample_messy_data.csv"
    file_size = os.path.getsize(sample_path)
    
    df = pd.read_csv(sample_path)
    dataset_id = storage.save_dataset(df, filename, file_size)
    analysis = analyze_dataset(df, dataset_id, filename, file_size)
    return analysis

# 3. GET ANALYSIS
@app.get("/dataset/{dataset_id}/analysis", response_model=AnalysisResponse)
def get_analysis(dataset_id: str):
    session = storage.get_dataset(dataset_id)
    if not session:
        raise HTTPException(status_code=404, detail="Dataset not found or session expired.")
    
    current_df = session["current_df"]
    return analyze_dataset(current_df, dataset_id, session["filename"], session["file_size_bytes"])

# 4. CLEAN DATASET
@app.post("/dataset/{dataset_id}/clean", response_model=CleanResponse)
def clean_dataset_endpoint(dataset_id: str, options: CleaningOptions = Body(...)):
    session = storage.get_dataset(dataset_id)
    if not session:
        raise HTTPException(status_code=404, detail="Dataset not found or session expired.")

    orig_df = session["original_df"]
    current_df = session["current_df"]
    
    score_before = calculate_quality_score(current_df)

    new_df, change_entries = clean_dataset(current_df, options)
    storage.update_current_df(dataset_id, new_df, change_entries)

    score_after = calculate_quality_score(new_df)

    col_types = {str(c): str(new_df[c].dtype) for c in new_df.columns}

    return CleanResponse(
        dataset_id=dataset_id,
        original_total_rows=len(orig_df),
        cleaned_total_rows=len(new_df),
        original_total_cols=len(orig_df.columns),
        cleaned_total_cols=len(new_df.columns),
        cleaned_records_count=len(new_df),
        quality_score_before=score_before,
        quality_score_after=score_after,
        change_log=session["change_log"],
        column_names=[str(c) for c in new_df.columns],
        column_types=col_types
    )

# 5. RESTRUCTURE DATASET
@app.post("/dataset/{dataset_id}/restructure", response_model=CleanResponse)
def restructure_dataset_endpoint(dataset_id: str, options: RestructureOptions = Body(...)):
    session = storage.get_dataset(dataset_id)
    if not session:
        raise HTTPException(status_code=404, detail="Dataset not found or session expired.")

    orig_df = session["original_df"]
    current_df = session["current_df"]
    
    score_before = calculate_quality_score(current_df)

    new_df, change_entries = restructure_dataset(current_df, options)
    storage.update_current_df(dataset_id, new_df, change_entries)

    score_after = calculate_quality_score(new_df)

    col_types = {str(c): str(new_df[c].dtype) for c in new_df.columns}

    return CleanResponse(
        dataset_id=dataset_id,
        original_total_rows=len(orig_df),
        cleaned_total_rows=len(new_df),
        original_total_cols=len(orig_df.columns),
        cleaned_total_cols=len(new_df.columns),
        cleaned_records_count=len(new_df),
        quality_score_before=score_before,
        quality_score_after=score_after,
        change_log=session["change_log"],
        column_names=[str(c) for c in new_df.columns],
        column_types=col_types
    )

# 6. GET PREVIEW DATA
@app.get("/dataset/{dataset_id}/preview", response_model=PreviewResponse)
def get_preview(
    dataset_id: str,
    view: str = Query("current", description="'original' or 'current'"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=500),
    search: Optional[str] = None
):
    session = storage.get_dataset(dataset_id)
    if not session:
        raise HTTPException(status_code=404, detail="Dataset not found or session expired.")

    df = session["original_df"] if view == "original" else session["current_df"]

    # Filter by search string if provided
    filtered_df = df
    if search and search.strip():
        q = search.strip().lower()
        mask = df.astype(str).apply(lambda row: row.str.lower().str.contains(q).any(), axis=1)
        filtered_df = df[mask]

    total_rows = len(filtered_df)
    total_cols = len(filtered_df.columns)
    total_pages = max(1, (total_rows + page_size - 1) // page_size)

    start_idx = (page - 1) * page_size
    end_idx = min(start_idx + page_size, total_rows)
    page_df = filtered_df.iloc[start_idx:end_idx].fillna("")

    # Replace NaNs/Infs for clean JSON serialization
    records = page_df.to_dict(orient="records")

    return PreviewResponse(
        dataset_id=dataset_id,
        total_rows=total_rows,
        total_columns=total_cols,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        columns=[str(c) for c in df.columns],
        data=records
    )

# 7. AI INSIGHTS
@app.get("/dataset/{dataset_id}/insights", response_model=AIInsightsResponse)
def get_ai_insights(dataset_id: str):
    session = storage.get_dataset(dataset_id)
    if not session:
        raise HTTPException(status_code=404, detail="Dataset not found or session expired.")

    current_df = session["current_df"]
    analysis = analyze_dataset(current_df, dataset_id, session["filename"], session["file_size_bytes"])
    score_after = calculate_quality_score(current_df).total_score
    return generate_ai_insights(analysis, score_after)

# 8. RESET DATASET
@app.post("/dataset/{dataset_id}/reset")
def reset_dataset_endpoint(dataset_id: str):
    session = storage.get_dataset(dataset_id)
    if not session:
        raise HTTPException(status_code=404, detail="Dataset not found or session expired.")

    success = storage.reset_dataset(dataset_id)
    return {"status": "success", "message": "Dataset restored to original uncleaned state."}

# 9. EXPORT CSV
@app.get("/dataset/{dataset_id}/download/csv")
def download_csv(dataset_id: str, columns: Optional[List[str]] = Query(None)):
    session = storage.get_dataset(dataset_id)
    if not session:
        raise HTTPException(status_code=404, detail="Dataset not found or session expired.")

    current_df = session["current_df"]
    csv_bytes = generate_csv_bytes(current_df, columns)

    clean_filename = f"cleaned_{session['filename']}"
    if not clean_filename.endswith('.csv'):
        clean_filename += '.csv'

    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={clean_filename}"}
    )

# 10. EXPORT EXCEL
@app.get("/dataset/{dataset_id}/download/excel")
def download_excel(dataset_id: str, columns: Optional[List[str]] = Query(None)):
    session = storage.get_dataset(dataset_id)
    if not session:
        raise HTTPException(status_code=404, detail="Dataset not found or session expired.")

    current_df = session["current_df"]
    excel_bytes = generate_excel_bytes(current_df, columns)

    clean_filename = f"cleaned_{os.path.splitext(session['filename'])[0]}.xlsx"

    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={clean_filename}"}
    )

# 11. DOWNLOAD REPORT
@app.get("/dataset/{dataset_id}/report")
def download_report(dataset_id: str):
    session = storage.get_dataset(dataset_id)
    if not session:
        raise HTTPException(status_code=404, detail="Dataset not found or session expired.")

    orig_df = session["original_df"]
    current_df = session["current_df"]
    score_before = calculate_quality_score(orig_df).total_score
    score_after = calculate_quality_score(current_df).total_score

    report_text = generate_summary_report_text(
        filename=session["filename"],
        original_shape=(len(orig_df), len(orig_df.columns)),
        cleaned_shape=(len(current_df), len(current_df.columns)),
        score_before=score_before,
        score_after=score_after,
        change_log=session["change_log"]
    )

    return Response(
        content=report_text.encode('utf-8'),
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename=datagenius_audit_report_{dataset_id[:8]}.txt"}
    )
