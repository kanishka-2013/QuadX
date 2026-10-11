import pandas as pd
import numpy as np
import re
import time
import uuid
from typing import List, Dict, Any, Tuple
from app.models import CleaningOptions, CleanResponse, ChangeLogEntry
from app.services.quality_score_service import calculate_quality_score

def clean_dataset(df: pd.DataFrame, options: CleaningOptions) -> Tuple[pd.DataFrame, List[ChangeLogEntry]]:
    cleaned_df = df.copy(deep=True)
    change_log: List[ChangeLogEntry] = []
    
    timestamp_str = time.strftime("%Y-%m-%d %H:%M:%S")

    # 1. Duplicate Removal
    if options.remove_duplicates:
        orig_row_count = len(cleaned_df)
        cleaned_df = cleaned_df.drop_duplicates()
        dropped_count = orig_row_count - len(cleaned_df)
        if dropped_count > 0:
            change_log.append(ChangeLogEntry(
                id=str(uuid.uuid4()),
                timestamp=timestamp_str,
                action_type="deduplication",
                description=f"Removed {dropped_count} exact duplicate row(s)",
                affected_rows=dropped_count,
                affected_columns=list(cleaned_df.columns)
            ))

    # 2. Column Normalization
    if options.normalize_column_names:
        old_cols = list(cleaned_df.columns)
        new_cols = []
        col_count_map: Dict[str, int] = {}

        for col in old_cols:
            c_str = str(col).strip().lower()
            # Replace spaces and hyphens/symbols with underscores
            c_norm = re.sub(r'[\s\-\(\)\$\#\%\@\.\,]+', '_', c_str)
            c_norm = re.sub(r'_+', '_', c_norm).strip('_')
            if not c_norm:
                c_norm = "column"
            
            # Prevent duplicate column names after normalization
            if c_norm in col_count_map:
                col_count_map[c_norm] += 1
                c_final = f"{c_norm}_{col_count_map[c_norm]}"
            else:
                col_count_map[c_norm] = 0
                c_final = c_norm
            new_cols.append(c_final)

        cleaned_df.columns = new_cols
        change_log.append(ChangeLogEntry(
            id=str(uuid.uuid4()),
            timestamp=timestamp_str,
            action_type="column_normalization",
            description=f"Normalized {len(new_cols)} column header names into clean snake_case",
            affected_rows=0,
            affected_columns=new_cols
        ))

    # 3. Trim Whitespace
    if options.trim_whitespace:
        affected_cols = []
        for col in cleaned_df.columns:
            if cleaned_df[col].dtype == object:
                # Keep original non-string as is, trim strings
                orig_series = cleaned_df[col].copy()
                cleaned_df[col] = cleaned_df[col].apply(lambda x: x.strip() if isinstance(x, str) else x)
                if not orig_series.equals(cleaned_df[col]):
                    affected_cols.append(str(col))

        if affected_cols:
            change_log.append(ChangeLogEntry(
                id=str(uuid.uuid4()),
                timestamp=timestamp_str,
                action_type="trim_whitespace",
                description=f"Trimmed leading/trailing whitespace across {len(affected_cols)} text column(s)",
                affected_rows=len(cleaned_df),
                affected_columns=affected_cols
            ))

    # 4. Standardize Capitalization
    if options.standardize_capitalization in ["title", "lower", "upper"]:
        cap_type = options.standardize_capitalization
        affected_cols = []
        for col in cleaned_df.columns:
            if cleaned_df[col].dtype == object:
                if cap_type == "title":
                    cleaned_df[col] = cleaned_df[col].apply(lambda x: str(x).title() if isinstance(x, str) and str(x).lower() not in ['nan', 'n/a', 'na', 'null', ''] else x)
                elif cap_type == "lower":
                    cleaned_df[col] = cleaned_df[col].apply(lambda x: str(x).lower() if isinstance(x, str) and str(x).lower() not in ['nan', 'n/a', 'na', 'null', ''] else x)
                elif cap_type == "upper":
                    cleaned_df[col] = cleaned_df[col].apply(lambda x: str(x).upper() if isinstance(x, str) and str(x).lower() not in ['nan', 'n/a', 'na', 'null', ''] else x)
                affected_cols.append(str(col))

        change_log.append(ChangeLogEntry(
            id=str(uuid.uuid4()),
            timestamp=timestamp_str,
            action_type="capitalization",
            description=f"Standardized text capitalization to '{cap_type}' style across categorical text columns",
            affected_rows=len(cleaned_df),
            affected_columns=affected_cols
        ))

    # 5. Email Normalization
    if options.normalize_emails:
        email_cols = [c for c in cleaned_df.columns if 'email' in str(c).lower()]
        for col in email_cols:
            def fix_email(v):
                if not isinstance(v, str) or str(v).lower() in ['nan', 'n/a', 'na', 'null', '']:
                    return v
                e = v.strip().lower()
                # Fix common typo like charlie@@gmail.com -> charlie@gmail.com
                e = re.sub(r'@{2,}', '@', e)
                return e

            cleaned_df[col] = cleaned_df[col].apply(fix_email)

        if email_cols:
            change_log.append(ChangeLogEntry(
                id=str(uuid.uuid4()),
                timestamp=timestamp_str,
                action_type="email_normalization",
                description=f"Normalized email formatting and fixed syntax typos in column(s): {', '.join(email_cols)}",
                affected_rows=len(cleaned_df),
                affected_columns=[str(c) for c in email_cols]
            ))

    # 6. Numeric Text Normalization
    if options.convert_numeric_text:
        target_cols = options.numeric_columns if options.numeric_columns else list(cleaned_df.columns)
        converted_cols = []

        for col in target_cols:
            if col in cleaned_df.columns:
                series = cleaned_df[col]
                # Check if convertable
                def parse_num(val):
                    if pd.isna(val) or val is None:
                        return np.nan
                    v_str = str(val).strip()
                    if v_str.lower() in ['nan', 'n/a', 'na', 'null', 'error', 'none', '']:
                        return np.nan
                    # Strip $, commas, %
                    v_clean = re.sub(r'[\$,%]', '', v_str)
                    try:
                        f_val = float(v_clean)
                        return int(f_val) if f_val.is_integer() else f_val
                    except ValueError:
                        return val

                new_series = series.apply(parse_num)
                # If numeric count increased, update
                if not new_series.equals(series):
                    cleaned_df[col] = new_series
                    converted_cols.append(str(col))

        if converted_cols:
            change_log.append(ChangeLogEntry(
                id=str(uuid.uuid4()),
                timestamp=timestamp_str,
                action_type="numeric_conversion",
                description=f"Cleaned and parsed numeric string values in column(s): {', '.join(converted_cols)}",
                affected_rows=len(cleaned_df),
                affected_columns=converted_cols
            ))

    # 7. Date Normalization
    if options.normalize_dates:
        target_cols = options.date_columns if options.date_columns else [c for c in cleaned_df.columns if any(kw in str(c).lower() for kw in ['date', 'joined', 'time', 'dob', 'created'])]
        converted_date_cols = []

        for col in target_cols:
            if col in cleaned_df.columns:
                def parse_date(v):
                    if pd.isna(v) or not v:
                        return np.nan
                    v_str = str(v).strip()
                    if v_str.lower() in ['nan', 'n/a', 'na', 'null', 'none', '']:
                        return np.nan
                    try:
                        # Use pd.to_datetime with format infer
                        dt = pd.to_datetime(v_str, errors='coerce', dayfirst=False)
                        if pd.notna(dt):
                            return dt.strftime('%Y-%m-%d')
                    except Exception:
                        pass
                    return v_str

                cleaned_df[col] = cleaned_df[col].apply(parse_date)
                converted_date_cols.append(str(col))

        if converted_date_cols:
            change_log.append(ChangeLogEntry(
                id=str(uuid.uuid4()),
                timestamp=timestamp_str,
                action_type="date_normalization",
                description=f"Normalized date values into YYYY-MM-DD standard format for column(s): {', '.join(converted_date_cols)}",
                affected_rows=len(cleaned_df),
                affected_columns=converted_date_cols
            ))

    # 8. Missing Values Actions per Column
    if options.missing_value_actions:
        for mv_action in options.missing_value_actions:
            col = mv_action.column
            strategy = mv_action.strategy
            if col not in cleaned_df.columns:
                continue

            # Standardize missing representation to NaN first
            col_str = cleaned_df[col].astype(str).str.strip().str.lower()
            missing_mask = cleaned_df[col].isna() | col_str.isin(['', 'nan', 'n/a', 'na', 'null', 'none', 'undefined', 'error'])
            cleaned_df.loc[missing_mask, col] = np.nan

            affected_count = int(missing_mask.sum())
            if affected_count == 0:
                continue

            if strategy == "remove_rows":
                orig_cnt = len(cleaned_df)
                cleaned_df = cleaned_df[~missing_mask]
                dropped = orig_cnt - len(cleaned_df)
                change_log.append(ChangeLogEntry(
                    id=str(uuid.uuid4()),
                    timestamp=timestamp_str,
                    action_type="imputation_drop",
                    description=f"Dropped {dropped} row(s) containing missing values in '{col}'",
                    affected_rows=dropped,
                    affected_columns=[str(col)]
                ))
            elif strategy == "fill_mean":
                # Convert to numeric if possible
                num_series = pd.to_numeric(cleaned_df[col], errors='coerce')
                mean_val = num_series.mean()
                if pd.notna(mean_val):
                    mean_val = round(float(mean_val), 2)
                    cleaned_df[col] = num_series.fillna(mean_val)
                    change_log.append(ChangeLogEntry(
                        id=str(uuid.uuid4()),
                        timestamp=timestamp_str,
                        action_type="imputation_mean",
                        description=f"Filled {affected_count} missing values in '{col}' with column mean ({mean_val})",
                        affected_rows=affected_count,
                        affected_columns=[str(col)]
                    ))
            elif strategy == "fill_median":
                num_series = pd.to_numeric(cleaned_df[col], errors='coerce')
                median_val = num_series.median()
                if pd.notna(median_val):
                    median_val = round(float(median_val), 2)
                    cleaned_df[col] = num_series.fillna(median_val)
                    change_log.append(ChangeLogEntry(
                        id=str(uuid.uuid4()),
                        timestamp=timestamp_str,
                        action_type="imputation_median",
                        description=f"Filled {affected_count} missing values in '{col}' with column median ({median_val})",
                        affected_rows=affected_count,
                        affected_columns=[str(col)]
                    ))
            elif strategy == "fill_mode":
                mode_series = cleaned_df[col].dropna().mode()
                if not mode_series.empty:
                    mode_val = mode_series.iloc[0]
                    cleaned_df[col] = cleaned_df[col].fillna(mode_val)
                    change_log.append(ChangeLogEntry(
                        id=str(uuid.uuid4()),
                        timestamp=timestamp_str,
                        action_type="imputation_mode",
                        description=f"Filled {affected_count} missing values in '{col}' with most frequent mode value ('{mode_val}')",
                        affected_rows=affected_count,
                        affected_columns=[str(col)]
                    ))
            elif strategy == "fill_custom":
                custom_val = mv_action.custom_value if mv_action.custom_value is not None else ""
                cleaned_df[col] = cleaned_df[col].fillna(custom_val)
                change_log.append(ChangeLogEntry(
                    id=str(uuid.uuid4()),
                    timestamp=timestamp_str,
                    action_type="imputation_custom",
                    description=f"Filled {affected_count} missing values in '{col}' with custom value ('{custom_val}')",
                    affected_rows=affected_count,
                    affected_columns=[str(col)]
                ))

    return cleaned_df, change_log
