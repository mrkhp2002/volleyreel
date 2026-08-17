import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User
from app.utils.security import get_password_hash

def setup_admin():
    db = SessionLocal()
    try:
        hashed_pwd = get_password_hash("Password123!")

        # 1. Admin Coach Account
        admin = db.query(User).filter(User.email == "admin@volleyreel.com").first()
        if not admin:
            admin = User(
                email="admin@volleyreel.com",
                hashed_password=hashed_pwd,
                full_name="Coach Admin",
                role="coach"
            )
            db.add(admin)
            print("[OK] Created new admin account: admin@volleyreel.com")
        else:
            admin.hashed_password = hashed_pwd
            print("[OK] Updated password for admin@volleyreel.com")

        # 2. Update user account kanchanaz2002@gmail.com
        user2 = db.query(User).filter(User.email == "kanchanaz2002@gmail.com").first()
        if user2:
            user2.hashed_password = hashed_pwd
            print("[OK] Updated password for kanchanaz2002@gmail.com")

        db.commit()
        print("\n[SUCCESS] Admin credentials ready!")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Failed to set admin credentials: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    setup_admin()
