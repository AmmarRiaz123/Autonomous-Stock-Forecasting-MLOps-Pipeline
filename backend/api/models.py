from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from schemas import ModelMetrics, DeployModelRequest, DeployModelResponse
from database import get_models, deploy_model, get_ticker, add_log
from db_config import get_db

router = APIRouter()

@router.get("/models/{ticker}", response_model=List[ModelMetrics])
async def get_candidate_models(ticker: str, db: AsyncSession = Depends(get_db)):
    """Get candidate models and their metrics for a ticker"""
    ticker_obj = await get_ticker(db, ticker)
    if not ticker_obj:
        raise HTTPException(
            status_code=404,
            detail=f"Ticker {ticker} not found"
        )
    
    models = await get_models(db, ticker)
    if not models:
        raise HTTPException(
            status_code=404,
            detail=f"No models available for {ticker}"
        )
    
    return [
        {
            "model": m.model,
            "mae": m.mae,
            "rmse": m.rmse,
            "mape": m.mape,
            "r2": m.r2,
            "last_trained_at": m.last_trained_at.isoformat() + "Z",
            "status": m.status,
            "recommended": m.recommended
        }
        for m in models
    ]

@router.post("/models/{ticker}/deploy", response_model=DeployModelResponse)
async def deploy_ticker_model(ticker: str, request: DeployModelRequest, db: AsyncSession = Depends(get_db)):
    """Deploy a specific model for a ticker"""
    ticker_obj = await get_ticker(db, ticker)
    if not ticker_obj:
        raise HTTPException(
            status_code=404,
            detail=f"Ticker {ticker} not found"
        )
    
    models = await get_models(db, ticker)
    if not any(m.model == request.model for m in models):
        raise HTTPException(
            status_code=400,
            detail=f"Model {request.model} not found in candidates for {ticker}"
        )
    
    result = await deploy_model(db, ticker, request.model)
    
    await add_log(db, {
        "ticker": ticker,
        "event": "model_deployed",
        "status": "success",
        "message": f"Deployed {request.model} model for {ticker}",
        "details": {"model": request.model}
    })
    
    return result
