import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User
from app.utils.security import get_password_hash

def reset_user_pwd():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "mrkhpentr@gmail.com").first()
        if user:
            user.hashed_password = get_password_hash("Password123!")
            db.commit()
            print("[OK] Password successfully reset for mrkhpentr@gmail.com")
        else:
            print("[ERROR] User not found")
    finally:
        db.close()

if __name__ == "__main__":
    reset_user_pwd()
