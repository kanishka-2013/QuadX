import pandas as pd
import uuid
import time
from typing import Tuple, List
from app.models import RestructureOptions, ChangeLogEntry

def restructure_dataset(df: pd.DataFrame, options: RestructureOptions) -> Tuple[pd.DataFrame, List[ChangeLogEntry]]:
    cleaned_df = df.copy(deep=True)
    change_log: List[ChangeLogEntry] = []
    timestamp_str = time.strftime("%Y-%m-%d %H:%M:%S")

    # 1. Rename Columns
    if options.rename_columns:
        valid_renames = {k: v for k, v in options.rename_columns.items() if k in cleaned_df.columns and v and v.strip()}
        if valid_renames:
            cleaned_df = cleaned_df.rename(columns=valid_renames)
            change_log.append(ChangeLogEntry(
                id=str(uuid.uuid4()),
                timestamp=timestamp_str,
                action_type="rename_columns",
                description=f"Renamed {len(valid_renames)} column(s): {', '.join([f'{k}->{v}' for k, v in valid_renames.items()])}",
                affected_rows=0,
                affected_columns=list(valid_renames.values())
            ))

    # 2. Keep / Remove Columns
    if options.keep_columns is not None and len(options.keep_columns) > 0:
        valid_keep = [c for c in options.keep_columns if c in cleaned_df.columns]
        if valid_keep:
            dropped_cols = [c for c in cleaned_df.columns if c not in valid_keep]
            cleaned_df = cleaned_df[valid_keep]
            if dropped_cols:
                change_log.append(ChangeLogEntry(
                    id=str(uuid.uuid4()),
                    timestamp=timestamp_str,
                    action_type="drop_columns",
                    description=f"Dropped {len(dropped_cols)} column(s): {', '.join(dropped_cols)}",
                    affected_rows=0,
                    affected_columns=dropped_cols
                ))
    elif options.remove_columns is not None and len(options.remove_columns) > 0:
        valid_remove = [c for c in options.remove_columns if c in cleaned_df.columns]
        if valid_remove:
            cleaned_df = cleaned_df.drop(columns=valid_remove)
            change_log.append(ChangeLogEntry(
                id=str(uuid.uuid4()),
                timestamp=timestamp_str,
                action_type="drop_columns",
                description=f"Removed {len(valid_remove)} column(s): {', '.join(valid_remove)}",
                affected_rows=0,
                affected_columns=valid_remove
            ))

    # 3. Reorder Columns
    if options.reorder_columns is not None and len(options.reorder_columns) > 0:
        valid_reorder = [c for c in options.reorder_columns if c in cleaned_df.columns]
        # Append any missing existing columns at the end
        remaining = [c for c in cleaned_df.columns if c not in valid_reorder]
        final_order = valid_reorder + remaining
        cleaned_df = cleaned_df[final_order]
        change_log.append(ChangeLogEntry(
            id=str(uuid.uuid4()),
            timestamp=timestamp_str,
            action_type="reorder_columns",
            description=f"Reordered dataset columns to custom specified layout.",
            affected_rows=0,
            affected_columns=final_order
        ))

    return cleaned_df, change_log
