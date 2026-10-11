import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
TEMP_DATASET_DIR = BASE_DIR / "temp_datasets"
SAMPLE_DATA_DIR = BASE_DIR / "sample_data"

TEMP_DATASET_DIR.mkdir(parents=True, exist_ok=True)
SAMPLE_DATA_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE_MB = 25
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
