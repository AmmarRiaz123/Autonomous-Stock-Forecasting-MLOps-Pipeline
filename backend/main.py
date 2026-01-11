from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
import sys
import traceback

from api import health, tickers, forecast, models, logs, settings, pipeline
from db_config import engine, Base, AsyncSessionLocal
from database import init_db
from config import settings as app_settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and initialize database
    print("🚀 Starting application...")
    try:
        print("📊 Connecting to database...")
        print(f"Database URL: {app_settings.DATABASE_URL[:50]}...")
        
        async with engine.begin() as conn:
            print("✅ Database connection established")
            print("📝 Creating tables...")
            await conn.run_sync(Base.metadata.create_all)
            print("✅ Tables created successfully")
        
        print("🔄 Initializing sample data...")
        async with AsyncSessionLocal() as session:
            await init_db(session)
        
        print("✅ Database initialized successfully!")
        print("🎉 Application startup complete!")
        
    except Exception as e:
        print(f"\n❌ Database connection failed!")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print(f"\nFull traceback:")
        traceback.print_exc()
        print(f"\nDATABASE_URL: {app_settings.DATABASE_URL}")
        print("\n⚠️ Please check:")
        print("1. PostgreSQL/Railway database is accessible")
        print("2. DATABASE_URL in .env is correct")
        print("3. Database credentials are valid")
        print("4. Network connection is stable")
        print("5. Database server is not overloaded")
        
        # Don't exit, let FastAPI handle it gracefully
        raise
    
    yield
    
    # Shutdown: cleanup
    print("🛑 Shutting down application...")
    try:
        await engine.dispose()
        print("✅ Database connections closed")
    except Exception as e:
        print(f"⚠️ Error during shutdown: {e}")

app = FastAPI(
    title="Stock Forecasting MLOps API",
    description="Backend API for autonomous stock forecasting dashboard",
    version="0.1.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=app_settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(tickers.router, prefix="/api", tags=["Tickers"])
app.include_router(forecast.router, prefix="/api", tags=["Forecast"])
app.include_router(models.router, prefix="/api", tags=["Models"])
app.include_router(logs.router, prefix="/api", tags=["Logs"])
app.include_router(pipeline.router, prefix="/api", tags=["Pipeline"])
app.include_router(settings.router, prefix="/api", tags=["Settings"])

@app.get("/")
async def root():
    return {
        "message": "Stock Forecasting MLOps API",
        "version": "0.1.0",
        "docs": "/docs",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
