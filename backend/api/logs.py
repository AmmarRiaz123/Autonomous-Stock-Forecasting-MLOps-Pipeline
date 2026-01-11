from fastapi import APIRouter, Query, Depends
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from schemas import LogEntry
from database import get_logs
from db_config import get_db

router = APIRouter()

@router.get("/logs", response_model=List[LogEntry])
async def get_system_logs(
    ticker: Optional[str] = Query(None, description="Filter by ticker symbol"),
    limit: int = Query(200, ge=1, le=1000, description="Maximum number of logs to return"),
    db: AsyncSession = Depends(get_db)
):
    """Get system logs with optional filtering"""
    logs = await get_logs(db, ticker, limit)
    return [
        {
            "id": log.id,
            "timestamp": log.timestamp.isoformat() + "Z",
            "ticker": log.ticker,
            "event": log.event,
            "status": log.status,
            "message": log.message,
            "details": log.details
        }
        for log in logs
    ]
