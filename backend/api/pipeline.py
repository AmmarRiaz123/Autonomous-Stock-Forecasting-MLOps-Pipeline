from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from schemas import RetryPipelineResponse
from database import get_ticker, add_log
from db_config import get_db

router = APIRouter()

@router.post("/pipeline/{ticker}/retry", response_model=RetryPipelineResponse, status_code=202)
async def retry_ticker_pipeline(ticker: str, db: AsyncSession = Depends(get_db)):
    """Retry the pipeline for a specific ticker"""
    ticker_obj = await get_ticker(db, ticker)
    if not ticker_obj:
        raise HTTPException(
            status_code=404,
            detail=f"Ticker {ticker} not found"
        )
    
    queued_at = datetime.utcnow().isoformat() + "Z"
    
    await add_log(db, {
        "ticker": ticker,
        "event": "pipeline_retry_requested",
        "status": "success",
        "message": f"Pipeline retry queued for {ticker}",
        "details": {"queued_at": queued_at}
    })
    
    return {
        "ticker": ticker,
        "accepted": True,
        "queued_at": queued_at
    }
