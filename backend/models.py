from sqlalchemy import Column, String, Float, DateTime, Integer, Boolean, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from db_config import Base

class Ticker(Base):
    __tablename__ = "tickers"
    
    ticker = Column(String(10), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    exchange = Column(String(50), nullable=False)
    status = Column(String(20), default="warning")
    current_model = Column(String(50), nullable=True)
    last_trained_at = Column(DateTime, nullable=True)
    drift_score = Column(Float, nullable=True)
    accuracy = Column(Float, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    models = relationship("Model", back_populates="ticker_rel", cascade="all, delete-orphan")
    forecasts = relationship("ForecastPoint", back_populates="ticker_rel", cascade="all, delete-orphan")
    logs = relationship("Log", back_populates="ticker_rel", cascade="all, delete-orphan")
    pipeline_runs = relationship("PipelineRun", back_populates="ticker_rel", cascade="all, delete-orphan")

class Model(Base):
    __tablename__ = "models"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    ticker = Column(String(10), ForeignKey("tickers.ticker", ondelete="CASCADE"), nullable=False)
    model = Column(String(50), nullable=False)
    mae = Column(Float, nullable=False)
    rmse = Column(Float, nullable=False)
    mape = Column(Float, nullable=False)
    r2 = Column(Float, nullable=False)
    last_trained_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), default="success")
    recommended = Column(Boolean, default=False)
    
    # Relationships
    ticker_rel = relationship("Ticker", back_populates="models")

class ForecastPoint(Base):
    __tablename__ = "forecast_points"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    ticker = Column(String(10), ForeignKey("tickers.ticker", ondelete="CASCADE"), nullable=False)
    date = Column(String(20), nullable=False)
    actual = Column(Float, nullable=True)
    predicted = Column(Float, nullable=False)
    lower = Column(Float, nullable=True)
    upper = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    ticker_rel = relationship("Ticker", back_populates="forecasts")

class Log(Base):
    __tablename__ = "logs"
    
    id = Column(String(50), primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    ticker = Column(String(10), ForeignKey("tickers.ticker", ondelete="CASCADE"), nullable=False, index=True)
    event = Column(String(100), nullable=False)
    status = Column(String(20), nullable=False)
    message = Column(Text, nullable=False)
    details = Column(JSON, default={})
    
    # Relationships
    ticker_rel = relationship("Ticker", back_populates="logs")

class Settings(Base):
    __tablename__ = "settings"
    
    id = Column(Integer, primary_key=True, default=1)
    retrain_frequency = Column(String(50), default="Weekly")
    drift_threshold = Column(Float, default=0.2)
    enable_auto_deploy = Column(Boolean, default=True)
    slack_webhook_url = Column(String(500), default="")
    candidate_models = Column(JSON, default=["LSTM", "GRU", "Transformer", "XGBoost"])
    exchanges_enabled = Column(JSON, default=["NYSE", "NASDAQ"])
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PipelineRun(Base):
    __tablename__ = "pipeline_runs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ticker = Column(String(10), ForeignKey("tickers.ticker", ondelete="CASCADE"), nullable=False, index=True)

    status = Column(String(20), default="running")  # running | success | error
    stage = Column(String(50), default="queued")    # queued | eda | experiments | finalize
    progress = Column(Float, default=0.0)           # 0..100
    message = Column(Text, default="")

    started_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    error = Column(Text, nullable=True)

    # Relationships
    ticker_rel = relationship("Ticker", back_populates="pipeline_runs")
