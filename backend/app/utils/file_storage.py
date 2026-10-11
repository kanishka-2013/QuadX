import uuid
import time
import os
import io
import pandas as pd
from typing import Dict, Any, Optional, Tuple
from pathlib import Path
from app.config import TEMP_DATASET_DIR

class DatasetStorage:
    def __init__(self):
        # In-memory session state store mapping dataset_id -> dict
        self._store: Dict[str, Dict[str, Any]] = {}

    def save_dataset(self, df: pd.DataFrame, filename: str, file_size_bytes: int) -> str:
        dataset_id = str(uuid.uuid4())
        
        # Save persistent copy to temp folder safely
        file_path = TEMP_DATASET_DIR / f"{dataset_id}.parquet"
        try:
            df.to_parquet(file_path, index=False)
        except Exception:
            # Fallback to pickle if parquet fails
            file_path = TEMP_DATASET_DIR / f"{dataset_id}.pkl"
            df.to_pickle(file_path)

        # Store session in memory for ultra-fast manipulation
        self._store[dataset_id] = {
            "dataset_id": dataset_id,
            "filename": filename,
            "file_size_bytes": file_size_bytes,
            "created_at": time.time(),
            "original_df": df.copy(deep=True),
            "current_df": df.copy(deep=True),
            "change_log": [],
            "file_path": str(file_path)
        }
        return dataset_id

    def get_dataset(self, dataset_id: str) -> Optional[Dict[str, Any]]:
        if dataset_id not in self._store:
            # Try to recover from file storage if server restarted
            file_path_parquet = TEMP_DATASET_DIR / f"{dataset_id}.parquet"
            file_path_pkl = TEMP_DATASET_DIR / f"{dataset_id}.pkl"
            df = None
            if file_path_parquet.exists():
                df = pd.read_parquet(file_path_parquet)
            elif file_path_pkl.exists():
                df = pd.read_pickle(file_path_pkl)

            if df is not None:
                self._store[dataset_id] = {
                    "dataset_id": dataset_id,
                    "filename": "recovered_dataset.csv",
                    "file_size_bytes": 0,
                    "created_at": time.time(),
                    "original_df": df.copy(deep=True),
                    "current_df": df.copy(deep=True),
                    "change_log": [],
                    "file_path": str(file_path_parquet if file_path_parquet.exists() else file_path_pkl)
                }
            else:
                return None
        return self._store[dataset_id]

    def update_current_df(self, dataset_id: str, new_df: pd.DataFrame, change_entries: list):
        if dataset_id in self._store:
            self._store[dataset_id]["current_df"] = new_df.copy(deep=True)
            self._store[dataset_id]["change_log"].extend(change_entries)

    def reset_dataset(self, dataset_id: str) -> bool:
        if dataset_id in self._store:
            orig = self._store[dataset_id]["original_df"]
            self._store[dataset_id]["current_df"] = orig.copy(deep=True)
            self._store[dataset_id]["change_log"] = [{
                "id": str(uuid.uuid4()),
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "action_type": "reset",
                "description": "Reset dataset to original uncleaned state",
                "affected_rows": len(orig),
                "affected_columns": list(orig.columns)
            }]
            return True
        return False

storage = DatasetStorage()
