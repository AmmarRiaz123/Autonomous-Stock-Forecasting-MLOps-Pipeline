# Stock Forecasting MLOps Backend

FastAPI backend for the autonomous stock forecasting dashboard with PostgreSQL database.

## Features

- ✅ RESTful API with OpenAPI documentation
- ✅ CORS enabled for frontend integration
- ✅ PostgreSQL database with SQLAlchemy ORM
- ✅ Async database operations
- ✅ Pydantic validation
- ✅ Database migrations with Alembic
- ✅ Sample data initialization

## Tech Stack

- **Framework**: FastAPI
- **Server**: Uvicorn
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy 2.0 (async)
- **Migrations**: Alembic
- **Validation**: Pydantic v2
- **Python**: 3.10+

## Getting Started

### Prerequisites

- Python 3.10 or higher
- PostgreSQL 12+ installed and running
- pip or conda

### Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE mlops_stock_db;
CREATE USER mlops_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE mlops_stock_db TO mlops_user;
```

2. Update `.env` file with your database credentials:
```bash
DATABASE_URL=postgresql+asyncpg://mlops_user:your_password@localhost:5432/mlops_stock_db
```

### Database URL (important)

This backend uses **SQLAlchemy async**, so `DATABASE_URL` must use an async driver:

```bash
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST:PORT/DBNAME
```

If you use `postgresql://...`, SQLAlchemy may try to load `psycopg2` and you will get:
`InvalidRequestError: ... requires an async driver ... psycopg2 is not async`.

### Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv

# Activate on Windows
venv\Scripts\activate

# Activate on macOS/Linux
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create environment file:
```bash
cp .env.example .env
```

Edit `.env` and set your `DATABASE_URL`.

### Running the Server

The database tables will be created automatically on first run.

Development mode with auto-reload:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Production mode:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

> Note: Auto-running `notebooks/01_EDA_Preprocessing.ipynb` and `notebooks/02_Model_Experiments.ipynb` from the backend
> requires the notebook execution dependencies (`nbformat`, `nbclient`, `ipykernel`). They are included in `requirements.txt`.

## Project Structure

## API Notes (Ticker Create)

`POST /api/tickers` accepts either:
- `{ "ticker": "AAPL", "exchange": "NASDAQ", "name": "Apple Inc." }`
or
- `{ "symbol": "AAPL", "exchange": "NASDAQ" }`  (name optional; defaults to ticker)

