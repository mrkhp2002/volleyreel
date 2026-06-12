from pydantic import BaseModel
from typing import Optional

class AIJobSchema(BaseModel):
    id: str
    uploaded_by: str
    filename: str
    status: str
    date: str
    error: str
    class Config:
        from_attributes = True

class FlaggedItemSchema(BaseModel):
    id: str
    title: str
    uploaded_by: str
    reason: str
    date: str
    flags: int
    class Config:
        from_attributes = True

class SystemSettingsSchema(BaseModel):
    platform_name: str
    maintenance_mode: bool
    support_email: str
    ai_model: str
    max_upload_size: str
    frame_rate: str
    mfa_required: bool
    rate_limit: int
    allowed_formats: str
    class Config:
        from_attributes = True