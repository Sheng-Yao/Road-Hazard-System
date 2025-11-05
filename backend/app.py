import os
import psycopg2
from flask import Flask, jsonify

app = Flask(__name__)

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

@app.route("/")
def home():
    return "Backend is running!"

@app.route("/stats")
def get_stats():
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("""
            SELECT id, reported_at, image_url, latitude, longitude, hazard_type, source
            FROM road_hazard_raw_data
        """)
        rows = cur.fetchall()
        cur.close()
        conn.close()

        return jsonify([
            {
                "id": r[0],
                "reported_at": r[1],
                "image_url": r[2],
                "latitude": r[3],
                "longitude": r[4],
                "hazard_type": r[5],
                "source": r[6]
            }
            for r in rows
        ])

    except Exception as e:
        return str(e), 500