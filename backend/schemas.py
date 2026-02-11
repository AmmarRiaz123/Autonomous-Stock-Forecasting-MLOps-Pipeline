from pydantic import BaseModel, Field
from pydantic import AliasChoices, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# Health
class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str

# Tickers
class TickerBase(BaseModel):
    ticker: str = Field(..., description="Stock ticker symbol")
    name: str = Field(..., description="Company name")
    exchange: str = Field(..., description="Stock exchange")

class TickerCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    ticker: str = Field(validation_alias=AliasChoices("ticker", "symbol"))
    exchange: str
    name: Optional[str] = None

class TickerResponse(TickerBase):
    status: str
    current_model: Optional[str] = None
    last_trained_at: Optional[str] = None
    drift_score: Optional[float] = None
    accuracy: Optional[float] = None
    updated_at: str

class TickerDetail(BaseModel):
    ticker: str
    name: str
    exchange: str
    status: str
    current_model: Optional[str]
    last_trained_at: Optional[str]
    metrics: Dict[str, float]

# Forecast
class ForecastPoint(BaseModel):
    date: str
    actual: Optional[float]
    predicted: float
    lower: Optional[float] = None
    upper: Optional[float] = None

class ForecastResponse(BaseModel):
    ticker: str
    horizon: int
    points: List[ForecastPoint]

# Models
class ModelMetrics(BaseModel):
    model: str
    mae: float
    rmse: float
    mape: float
    r2: float
    last_trained_at: str
    status: str
    recommended: bool

class DeployModelRequest(BaseModel):
    model: str

class DeployModelResponse(BaseModel):
    ticker: str
    previous_model: Optional[str]
    deployed_model: str
    deployed_at: str

# Logs
class LogEntry(BaseModel):
    id: str
    timestamp: str
    ticker: str
    event: str
    status: str
    message: str
    details: Dict[str, Any] = {}

# Pipeline
class RetryPipelineResponse(BaseModel):
    ticker: str
    accepted: bool
    queued_at: str

# Settings
class Settings(BaseModel):
    retrain_frequency: str
    drift_threshold: float
    enable_auto_deploy: bool
    slack_webhook_url: str
    candidate_models: List[str]
    exchanges_enabled: List[str]

class SettingsUpdate(BaseModel):
    retrain_frequency: Optional[str] = None
    drift_threshold: Optional[float] = None
    enable_auto_deploy: Optional[bool] = None
    slack_webhook_url: Optional[str] = None
    candidate_models: Optional[List[str]] = None
    exchanges_enabled: Optional[List[str]] = None
