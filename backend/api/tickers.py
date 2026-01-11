from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from schemas import TickerCreate, TickerResponse, TickerDetail
from database import get_all_tickers, get_ticker, add_ticker, delete_ticker
from db_config import get_db

router = APIRouter()

@router.get("/tickers", response_model=List[TickerResponse])
async def list_tickers(db: AsyncSession = Depends(get_db)):
    """Get all tickers"""
    tickers = await get_all_tickers(db)
    return [
        {
            "ticker": t.ticker,
            "name": t.name,
            "exchange": t.exchange,
            "status": t.status,
            "current_model": t.current_model,
            "last_trained_at": t.last_trained_at.isoformat() + "Z" if t.last_trained_at else None,
            "drift_score": t.drift_score,
            "accuracy": t.accuracy,
            "updated_at": t.updated_at.isoformat() + "Z"
        }
        for t in tickers
    ]

@router.post("/tickers", response_model=TickerResponse, status_code=status.HTTP_201_CREATED)
async def create_ticker(ticker_data: TickerCreate, db: AsyncSession = Depends(get_db)):
    """Add a new ticker to monitor"""
    existing = await get_ticker(db, ticker_data.ticker)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ticker {ticker_data.ticker} already exists"
        )
    
    new_ticker_data = {
        "ticker": ticker_data.ticker,
        "name": ticker_data.name,
        "exchange": ticker_data.exchange,
        "status": "warning",
        "current_model": None,
        "last_trained_at": None,
        "drift_score": None,
        "accuracy": None,
        "updated_at": datetime.utcnow()
    }
    
    ticker = await add_ticker(db, new_ticker_data)
    
    return {
        "ticker": ticker.ticker,
        "name": ticker.name,
        "exchange": ticker.exchange,
        "status": ticker.status,
        "current_model": ticker.current_model,
        "last_trained_at": ticker.last_trained_at.isoformat() + "Z" if ticker.last_trained_at else None,
        "drift_score": ticker.drift_score,
        "accuracy": ticker.accuracy,
        "updated_at": ticker.updated_at.isoformat() + "Z"
    }

@router.get("/tickers/{ticker}", response_model=TickerDetail)
async def get_ticker_detail(ticker: str, db: AsyncSession = Depends(get_db)):
    """Get detailed information for a specific ticker"""
    ticker_obj = await get_ticker(db, ticker)
    if not ticker_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticker {ticker} not found"
        )
    
    return {
        "ticker": ticker_obj.ticker,
        "name": ticker_obj.name,
        "exchange": ticker_obj.exchange,
        "status": ticker_obj.status,
        "current_model": ticker_obj.current_model,
        "last_trained_at": ticker_obj.last_trained_at.isoformat() + "Z" if ticker_obj.last_trained_at else None,
        "metrics": {
            "mae": 1.23,
            "rmse": 1.95,
            "mape": 0.034
        }
    }

@router.delete("/tickers/{ticker}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ticker_route(ticker: str, db: AsyncSession = Depends(get_db)):
    """Delete a ticker"""
    success = await delete_ticker(db, ticker)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticker {ticker} not found"
        )
    return None
