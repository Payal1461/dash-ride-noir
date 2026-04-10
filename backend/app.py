from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3

app = Flask(__name__)

# ✅ Enable CORS
CORS(app)

print("🔥 BACKEND WITH CORS IS RUNNING")

# 🔹 DB connection
def get_db():
    conn = sqlite3.connect("uber.db")
    conn.row_factory = sqlite3.Row
    return conn

# ✅ Home route
@app.route("/")
def home():
    return {"message": "Backend running with DB 🚀"}

# ✅ Users route
@app.route("/users")
def users():
    conn = get_db()

    # 🔹 params from frontend
    search = request.args.get("search", "")
    city = request.args.get("city", "")
    role = request.args.get("role", "")
    sort = request.args.get("sort", "user_id")
    direction = request.args.get("dir", "asc")
    page = int(request.args.get("page", 0))

    limit = 20
    offset = page * limit

    # 🔹 base query
    query = "SELECT * FROM users WHERE 1=1"
    params = []

    # 🔍 search (LIKE for better UX)
    if search:
        query += " AND (name LIKE ? OR email LIKE ?)"
        params += [f"%{search}%", f"%{search}%"]

    # 🏙 city filter
    if city and city != "all":
        query += " AND city = ?"
        params.append(city)

    # 👤 role filter
    if role == "driver":
        query += " AND is_driver = 1"
    elif role == "rider":
        query += " AND is_driver = 0"

    # 🔃 sorting (safe)
    allowed = ["name", "email", "city", "date_joined", "user_id"]
    if sort not in allowed:
        sort = "user_id"

    direction = "ASC" if direction == "asc" else "DESC"
    query += f" ORDER BY {sort} {direction}"

    # 📄 pagination
    query += " LIMIT ? OFFSET ?"
    params += [limit, offset]

    # 🔹 execute
    data = conn.execute(query, params).fetchall()
    conn.close()

    return jsonify([dict(row) for row in data])
 

 #DASHBOARD

@app.route("/dashboard")
def dashboard():
    conn = get_db()

    total_users = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    total_drivers = conn.execute("SELECT COUNT(*) FROM users WHERE is_driver = 1").fetchone()[0]
    total_riders = conn.execute("SELECT COUNT(*) FROM users WHERE is_driver = 0").fetchone()[0]
    total_trips = conn.execute("SELECT COUNT(*) FROM trips").fetchone()[0]

    # ✅ FIX: use payments table instead of trips
    result = conn.execute("SELECT SUM(amount) FROM payments").fetchone()[0]
    total_revenue = result if result else 0

    conn.close()

    return jsonify({
        "users": total_users,
        "drivers": total_drivers,
        "riders": total_riders,
        "trips": total_trips,
        "revenue": total_revenue
    })

#RIDERS PAGE 

@app.route("/riders")
def riders():
    conn = get_db()

    rows = conn.execute("""
        SELECT 
            r.rider_id,
            r.user_id,
            u.name,
            u.email,
            u.city,
            r.rating,
            r.total_trips,
            r.created_at
        FROM riders r
        JOIN users u ON r.user_id = u.user_id
        ORDER BY r.total_trips DESC
        LIMIT 20
    """).fetchall()

    conn.close()

    return jsonify([dict(row) for row in rows])





# ✅ Run server
if __name__ == "__main__":
    app.run(port=5001, debug=True)