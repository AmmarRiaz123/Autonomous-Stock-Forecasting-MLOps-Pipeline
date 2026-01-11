from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from schemas import ForecastResponse
from database import get_forecast, get_ticker
from db_config import get_db

router = APIRouter()

@router.get("/forecast/{ticker}", response_model=ForecastResponse)
async def get_ticker_forecast(
    ticker: str,
    horizon: int = Query(30, ge=1, le=90, description="Forecast horizon in days"),
    db: AsyncSession = Depends(get_db)
):
    """Get forecast data for a ticker"""
    ticker_obj = await get_ticker(db, ticker)
    if not ticker_obj:
        raise HTTPException(
            status_code=404,
            detail=f"Ticker {ticker} not found"
        )
    
    forecast_data = await get_forecast(db, ticker, horizon)
    if not forecast_data:
        raise HTTPException(
            status_code=404,
            detail=f"No forecast data available for {ticker}"
        )
    
    return forecast_data
