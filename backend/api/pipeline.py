from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from schemas import RetryPipelineResponse
from database import get_ticker, add_log
from database import get_latest_pipeline_run, create_pipeline_run  # NEW
from db_config import get_db
from pipeline_runner import run_ticker_pipeline_sync  # NEW

router = APIRouter()

@router.get("/pipeline/{ticker}/status")
async def get_pipeline_status(ticker: str, db: AsyncSession = Depends(get_db)):
    t = await get_ticker(db, ticker)
    if not t:
        raise HTTPException(status_code=404, detail=f"Ticker {ticker} not found")

    run = await get_latest_pipeline_run(db, ticker)
    if not run:
        return {"ticker": ticker, "status": "idle", "stage": "none", "progress": 0.0, "message": "No runs yet"}

    return {
        "ticker": ticker,
        "run_id": run.id,
        "status": run.status,
        "stage": run.stage,
        "progress": run.progress,
        "message": run.message,
        "error": run.error,
        "updated_at": run.updated_at.isoformat() + "Z",
    }

@router.post("/pipeline/{ticker}/retry", response_model=RetryPipelineResponse, status_code=202)
async def retry_ticker_pipeline(ticker: str, background: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    ticker_obj = await get_ticker(db, ticker)
    if not ticker_obj:
        raise HTTPException(status_code=404, detail=f"Ticker {ticker} not found")

    queued_at = datetime.utcnow().isoformat() + "Z"
    run = await create_pipeline_run(db, ticker)

    await add_log(db, {
        "ticker": ticker,
        "event": "pipeline_retry_requested",
        "status": "success",
        "message": f"Pipeline retry queued for {ticker}",
        "details": {"queued_at": queued_at, "run_id": run.id}
    })

    background.add_task(run_ticker_pipeline_sync, ticker, run.id)

    return {"ticker": ticker, "accepted": True, "queued_at": queued_at}
