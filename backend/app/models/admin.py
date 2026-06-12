from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base

class AIJob(Base):
    __tablename__ = "ai_jobs"

    id = Column(String, primary_key=True, index=True) 
    uploaded_by = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    status = Column(String, default="Pending") 
    date = Column(String, nullable=False)
    error = Column(String, default="")

class FlaggedItem(Base):
    __tablename__ = "flagged_items"

    id = Column(String, primary_key=True, index=True) 
    title = Column(String, nullable=False)
    uploaded_by = Column(String, nullable=False)
    reason = Column(String, nullable=False)
    date = Column(String, nullable=False)
    flags = Column(Integer, default=1)

class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, default=1)
    platform_name = Column(String, default="VolleyReel")
    maintenance_mode = Column(Boolean, default=False)
    support_email = Column(String, default="support@volleyreel.com")
    ai_model = Column(String, default="VolleyNet-v4.2")
    max_upload_size = Column(String, default="1GB")
    frame_rate = Column(String, default="30fps")
    mfa_required = Column(Boolean, default=True)
    rate_limit = Column(Integer, default=120)
    allowed_formats = Column(String, default="mp4, mov")