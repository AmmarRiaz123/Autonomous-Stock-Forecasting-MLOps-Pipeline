from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
import random
from pathlib import Path
import json

from models import Ticker, Model, ForecastPoint, Log, Settings as SettingsModel
from models import PipelineRun  # NEW

async def init_db(session: AsyncSession):
    """Initialize database with sample data"""
    
    try:
        print("  → Checking for existing data...")
        # Check if data already exists
        result = await session.execute(select(Ticker))
        existing_tickers = result.scalars().all()
        
        if existing_tickers:
            print(f"  → Found {len(existing_tickers)} existing tickers, skipping initialization")
            return  # Data already exists
        
        print("  → No existing data found, initializing...")
        
        # Sample tickers
        print("  → Creating sample tickers...")
        sample_tickers = [
            Ticker(
                ticker="AAPL",
                name="Apple Inc.",
                exchange="NASDAQ",
                status="healthy",
                current_model="Transformer",
                last_trained_at=datetime.utcnow() - timedelta(days=1),
                drift_score=0.12,
                accuracy=0.91,
                updated_at=datetime.utcnow()
            ),
            Ticker(
                ticker="GOOGL",
                name="Alphabet Inc.",
                exchange="NASDAQ",
                status="healthy",
                current_model="LSTM",
                last_trained_at=datetime.utcnow() - timedelta(days=2),
                drift_score=0.08,
                accuracy=0.88,
                updated_at=datetime.utcnow()
            ),
            Ticker(
                ticker="TSLA",
                name="Tesla Inc.",
                exchange="NASDAQ",
                status="warning",
                current_model="XGBoost",
                last_trained_at=datetime.utcnow() - timedelta(days=5),
                drift_score=0.25,
                accuracy=0.82,
                updated_at=datetime.utcnow()
            )
        ]
        
        for ticker in sample_tickers:
            session.add(ticker)
        
        await session.commit()
        print(f"  → Added {len(sample_tickers)} tickers")
        
        # Sample models for each ticker
        print("  → Creating sample models...")
        for ticker_symbol in ["AAPL", "GOOGL", "TSLA"]:
            models = [
                Model(
                    ticker=ticker_symbol,
                    model="LSTM",
                    mae=round(random.uniform(1.2, 2.5), 2),
                    rmse=round(random.uniform(1.8, 3.0), 2),
                    mape=round(random.uniform(0.03, 0.06), 3),
                    r2=round(random.uniform(0.82, 0.92), 2),
                    last_trained_at=datetime.utcnow() - timedelta(days=1),
                    status="success",
                    recommended=False
                ),
                Model(
                    ticker=ticker_symbol,
                    model="Transformer",
                    mae=round(random.uniform(1.0, 2.0), 2),
                    rmse=round(random.uniform(1.5, 2.5), 2),
                    mape=round(random.uniform(0.025, 0.05), 3),
                    r2=round(random.uniform(0.85, 0.95), 2),
                    last_trained_at=datetime.utcnow() - timedelta(days=1),
                    status="success",
                    recommended=True
                ),
                Model(
                    ticker=ticker_symbol,
                    model="XGBoost",
                    mae=round(random.uniform(1.3, 2.3), 2),
                    rmse=round(random.uniform(1.9, 2.8), 2),
                    mape=round(random.uniform(0.035, 0.055), 3),
                    r2=round(random.uniform(0.80, 0.90), 2),
                    last_trained_at=datetime.utcnow() - timedelta(days=1),
                    status="success",
                    recommended=False
                )
            ]
            for model in models:
                session.add(model)
        
        await session.commit()
        print("  → Added models for all tickers")
        
        # Sample forecast data
        print("  → Creating sample forecast data...")
        for ticker_symbol in ["AAPL", "GOOGL", "TSLA"]:
            base_price = random.uniform(100, 300)
            for i in range(60):
                date = (datetime.utcnow() - timedelta(days=60-i)).date().isoformat()
                actual = base_price + random.uniform(-5, 5) + (i * 0.1)
                predicted = actual + random.uniform(-2, 2)
                
                forecast_point = ForecastPoint(
                    ticker=ticker_symbol,
                    date=date,
                    actual=round(actual, 2) if i < 30 else None,
                    predicted=round(predicted, 2),
                    lower=round(predicted - 3, 2),
                    upper=round(predicted + 3, 2)
                )
                session.add(forecast_point)
        
        await session.commit()
        print("  → Added forecast data")
        
        # Sample logs
        print("  → Creating sample logs...")
        events = ["training_started", "training_completed", "drift_detected", "model_deployed", "prediction_generated"]
        statuses = ["success", "warning", "error"]
        
        for i in range(50):
            ticker = random.choice(["AAPL", "GOOGL", "TSLA"])
            event = random.choice(events)
            status = random.choice(statuses) if event != "training_completed" else "success"
            
            log = Log(
                id=f"log_{i:04d}",
                timestamp=datetime.utcnow() - timedelta(hours=i),
                ticker=ticker,
                event=event,
                status=status,
                message=f"{event.replace('_', ' ').title()} for {ticker}",
                details={
                    "model": random.choice(["LSTM", "Transformer", "XGBoost"]),
                    "mae": round(random.uniform(1.0, 2.5), 2)
                } if event == "training_completed" else {}
            )
            session.add(log)
        
        await session.commit()
        print("  → Added sample logs")
        
        # Default settings
        print("  → Creating default settings...")
        settings_result = await session.execute(select(SettingsModel).where(SettingsModel.id == 1))
        existing_settings = settings_result.scalar_one_or_none()
        
        if not existing_settings:
            settings = SettingsModel(
                id=1,
                retrain_frequency="Weekly",
                drift_threshold=0.2,
                enable_auto_deploy=True,
                slack_webhook_url="",
                candidate_models=["LSTM", "GRU", "Transformer", "XGBoost"],
                exchanges_enabled=["NYSE", "NASDAQ"]
            )
            session.add(settings)
            await session.commit()
            print("  → Default settings created")
        else:
            print("  → Settings already exist")
            
    except Exception as e:
        print(f"  ❌ Error during initialization: {e}")
        raise

# CRUD operations
async def get_ticker(session: AsyncSession, ticker: str) -> Optional[Ticker]:
    result = await session.execute(select(Ticker).where(Ticker.ticker == ticker))
    return result.scalar_one_or_none()

async def get_all_tickers(session: AsyncSession) -> List[Ticker]:
    result = await session.execute(select(Ticker))
    return result.scalars().all()

async def add_ticker(session: AsyncSession, ticker_data: dict) -> Ticker:
    ticker = Ticker(**ticker_data)
    session.add(ticker)
    await session.commit()
    await session.refresh(ticker)
    return ticker

async def delete_ticker(session: AsyncSession, ticker: str) -> bool:
    result = await session.execute(delete(Ticker).where(Ticker.ticker == ticker))
    await session.commit()
    return result.rowcount > 0

async def get_models(session: AsyncSession, ticker: str) -> List[Model]:
    result = await session.execute(select(Model).where(Model.ticker == ticker))
    return result.scalars().all()

async def deploy_model(session: AsyncSession, ticker: str, model_name: str) -> Optional[dict]:
    ticker_obj = await get_ticker(session, ticker)
    if ticker_obj:
        previous_model = ticker_obj.current_model
        ticker_obj.current_model = model_name
        ticker_obj.updated_at = datetime.utcnow()
        await session.commit()
        
        return {
            "ticker": ticker,
            "previous_model": previous_model,
            "deployed_model": model_name,
            "deployed_at": datetime.utcnow().isoformat() + "Z"
        }
    return None

async def get_forecast(session: AsyncSession, ticker: str, horizon: int = 30) -> Optional[dict]:
    result = await session.execute(
        select(ForecastPoint)
        .where(ForecastPoint.ticker == ticker)
        .order_by(ForecastPoint.date)
        .limit(horizon if horizon != 30 else 60)
    )
    points = result.scalars().all()
    
    if not points:
        return None
    
    return {
        "ticker": ticker,
        "horizon": horizon,
        "points": [
            {
                "date": p.date,
                "actual": p.actual,
                "predicted": p.predicted,
                "lower": p.lower,
                "upper": p.upper
            }
            for p in points
        ]
    }

async def get_logs(session: AsyncSession, ticker: Optional[str] = None, limit: int = 200) -> List[Log]:
    query = select(Log).order_by(Log.timestamp.desc()).limit(limit)
    
    if ticker:
        query = query.where(Log.ticker == ticker)
    
    result = await session.execute(query)
    return result.scalars().all()

async def add_log(session: AsyncSession, log_data: dict) -> Log:
    log_data["id"] = f"log_{datetime.utcnow().timestamp()}"
    log_data["timestamp"] = datetime.utcnow()
    
    log = Log(**log_data)
    session.add(log)
    await session.commit()
    await session.refresh(log)
    return log

async def get_settings(session: AsyncSession) -> Optional[SettingsModel]:
    result = await session.execute(select(SettingsModel).where(SettingsModel.id == 1))
    settings = result.scalar_one_or_none()
    print(f"🔍 Database query for settings (id=1): {settings is not None}")
    if settings:
        print(f"   → candidate_models: {settings.candidate_models}")
        print(f"   → exchanges_enabled: {settings.exchanges_enabled}")
    return settings

async def update_settings(session: AsyncSession, new_settings: dict) -> SettingsModel:
    print(f"💾 Updating settings in database with: {new_settings}")
    settings = await get_settings(session)
    
    if not settings:
        print("⚠️ No existing settings found, creating new record...")
        settings = SettingsModel(id=1)
        session.add(settings)
        # Set default values first
        settings.retrain_frequency = "Weekly"
        settings.drift_threshold = 0.2
        settings.enable_auto_deploy = True
        settings.slack_webhook_url = ""
        settings.candidate_models = ["LSTM", "GRU", "Transformer", "XGBoost"]
        settings.exchanges_enabled = ["NYSE", "NASDAQ"]
    
    # Update fields
    for key, value in new_settings.items():
        if hasattr(settings, key) and value is not None:
            print(f"   → Setting {key} = {value}")
            setattr(settings, key, value)
    
    settings.updated_at = datetime.utcnow()
    
    await session.commit()
    await session.refresh(settings)
    
    print(f"✅ Settings committed to database")
    print(f"   → candidate_models: {settings.candidate_models}")
    print(f"   → exchanges_enabled: {settings.exchanges_enabled}")
    
    return settings

async def create_pipeline_run(session: AsyncSession, ticker: str) -> PipelineRun:
    run = PipelineRun(ticker=ticker, status="running", stage="queued", progress=0.0, message="Queued")
    session.add(run)
    await session.commit()
    await session.refresh(run)
    return run

async def get_latest_pipeline_run(session: AsyncSession, ticker: str) -> Optional[PipelineRun]:
    result = await session.execute(
        select(PipelineRun).where(PipelineRun.ticker == ticker).order_by(PipelineRun.id.desc()).limit(1)
    )
    return result.scalar_one_or_none()

async def update_pipeline_run(
    session: AsyncSession,
    run_id: int,
    *,
    status: Optional[str] = None,
    stage: Optional[str] = None,
    progress: Optional[float] = None,
    message: Optional[str] = None,
    error: Optional[str] = None,
) -> Optional[PipelineRun]:
    result = await session.execute(select(PipelineRun).where(PipelineRun.id == run_id))
    run = result.scalar_one_or_none()
    if not run:
        return None

    if status is not None:
        run.status = status
    if stage is not None:
        run.stage = stage
    if progress is not None:
        run.progress = float(progress)
    if message is not None:
        run.message = message
    if error is not None:
        run.error = error

    run.updated_at = datetime.utcnow()
    await session.commit()
    await session.refresh(run)
    return run

async def finalize_ticker_from_metadata(session: AsyncSession, ticker: str) -> None:
    """
    Best-effort: reads models/latest/{TICKER}/metadata.json and updates ticker fields.
    """
    repo_root = Path(__file__).resolve().parents[1]
    meta_path = repo_root / "models" / "latest" / ticker / "metadata.json"
    model_type = None
    trained_at = None

    if meta_path.exists():
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        model_type = meta.get("model_type")
        trained_at = meta.get("trained_at_utc")

    t = await get_ticker(session, ticker)
    if not t:
        return

    if model_type:
        t.current_model = model_type
    t.last_trained_at = datetime.utcnow()
    t.status = "healthy"
    t.updated_at = datetime.utcnow()
    await session.commit()
