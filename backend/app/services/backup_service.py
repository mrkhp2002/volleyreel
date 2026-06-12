import os
import shutil
from datetime import datetime

def create_sqlite_backup() -> dict:
    source_db = "volleyreel.db"
    backup_dir = "static/backups"
    os.makedirs(backup_dir, exist_ok=True)
    
    bk_id = f"BK-{int(time.time())}"
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    destination = f"{backup_dir}/backup_{bk_id}.db"
    
    if os.path.exists(source_db):
        shutil.copyfile(source_db, destination)
        size = f"{os.path.getsize(destination) / 1024:.1f} KB"
        return {"id": bk_id, "date": timestamp, "size": size, "createdBy": "System Admin", "status": "Completed"}
    return {"error": "Database file not found"}