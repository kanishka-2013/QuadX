# DataGenius AI Platform 🚀

DataGenius AI is an intelligent, full-stack data cleaning, normalization, deduplication, and restructuring platform built for messy Excel (`.xlsx`) and CSV (`.csv`) datasets.

## 🌟 Features

1. **SaaS Dashboard & Visual Analytics**: Live health score gauge (0-100), duplicate tracking, missing cell counts, and interactive Recharts visualizations.
2. **Automated Data Quality Audit**: Detects exact duplicate rows, null values, inconsistent column naming conventions, extra whitespace, capitalization inconsistencies, date string variations, currency strings stored as text, and malformed emails.
3. **Pandas Data Cleaning Engine**:
   - **Duplicate Purging**: Instant exact row deduplication.
   - **Imputation Rules**: Column-level strategy selection (Mean, Median, Mode, Custom Value, Drop Rows, Keep Unchanged).
   - **Column Normalization**: Automatic transformation to clean `snake_case` header schemas.
   - **Text Normalization**: Whitespace trimming, Title/lower/upper capitalization, and email syntax correction.
   - **Date & Numeric Parsing**: Converts currency `$1,250` into floating point numbers and normalizes dates to ISO `YYYY-MM-DD`.
4. **Data Restructuring Studio**: Interactive interface to rename column headers, drag/reorder layout, or drop unwanted attributes.
5. **AI-Powered Data Insights**: Rule-based analytical engine + optional LLM integration providing executive audit reports, recommended cleaning sequences, and column-level manual review flags.
6. **Before-and-After Inspector & Change Log**: Real-time side-by-side dataset comparison, complete audit trail, and instant reset state.
7. **Export Studio**: Download cleaned datasets as CSV, Excel workbook (`.xlsx`), or detailed plain-text audit summary report with column selection checklist.
8. **Sample Dataset Included**: One-click "Try Sample Dataset" button for instant judging and evaluation.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Recharts, Axios
- **Backend**: Python 3.14, FastAPI, Pandas, NumPy, OpenPyXL, Uvicorn, Pydantic
- **API Communication**: REST API with CORS middleware

---

## 🚀 Quick Start Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Run Backend Server (FastAPI)
```bash
# Activate virtual environment
.\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation: `http://127.0.0.1:8000/docs`

### 2. Run Frontend Web Application (React + Vite)
```bash
cd frontend
cmd /c npm run dev
```
Access UI: `http://localhost:3000`

---

## 📊 Quality Score Formula

The Data Quality Score is calculated on a 0–100 scale:
$$\text{Score} = (\text{Missing Score} \times 0.30) + (\text{Duplicate Score} \times 0.25) + (\text{Formatting Score} \times 0.25) + (\text{Naming Score} \times 0.20)$$

Where each sub-score scales down proportionally according to matrix anomaly density.
