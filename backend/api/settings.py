from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from schemas import Settings, SettingsUpdate
from database import get_settings, update_settings
from db_config import get_db

router = APIRouter()

@router.get("/settings", response_model=Settings)
async def get_application_settings(db: AsyncSession = Depends(get_db)):
    """Get current application settings"""
    print("📥 GET /api/settings - Loading settings from database...")
    settings = await get_settings(db)
    
    if not settings:
        print("⚠️ No settings found in database!")
        raise HTTPException(status_code=404, detail="Settings not found")
    
    result = {
        "retrain_frequency": settings.retrain_frequency,
        "drift_threshold": settings.drift_threshold,
        "enable_auto_deploy": settings.enable_auto_deploy,
        "slack_webhook_url": settings.slack_webhook_url,
        "candidate_models": settings.candidate_models,
        "exchanges_enabled": settings.exchanges_enabled
    }
    
    print(f"✅ Loaded settings: {result}")
    return result

@router.put("/settings", response_model=Settings)
async def update_application_settings(settings_update: SettingsUpdate, db: AsyncSession = Depends(get_db)):
    """Update application settings"""
    print(f"📤 PUT /api/settings - Received update: {settings_update.dict()}")
    
    # Filter out None values
    update_data = {k: v for k, v in settings_update.dict().items() if v is not None}
    print(f"📝 Filtered update data: {update_data}")
    
    # Update in database
    settings = await update_settings(db, update_data)
    
    # Return the updated settings
    result = {
        "retrain_frequency": settings.retrain_frequency,
        "drift_threshold": settings.drift_threshold,
        "enable_auto_deploy": settings.enable_auto_deploy,
        "slack_webhook_url": settings.slack_webhook_url,
        "candidate_models": settings.candidate_models,
        "exchanges_enabled": settings.exchanges_enabled
    }
    
    print(f"✅ Settings saved to database: {result}")
    return result
