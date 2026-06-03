from app.database import get_db_connection

conn = get_db_connection()

print("Database Connected Successfully!")

conn.close()