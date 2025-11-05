import os
import psycopg2
from flask import Flask, Response, stream_with_context, json
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)  # ← Enable CORS for all routes

last_update_time = time.time()

def notify_update():
    global last_update_time
    last_update_time = time.time()

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
            SELECT id, reported_at, image_url, latitude, longitude, hazard_type, device_ID
            FROM road_hazard_raw_data_db
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
                "device_ID": r[6]
            }
            for r in rows
        ])
    except Exception as e:
        return str(e), 500
    
@app.route("/stream")
def stream():
    def event_stream():
        last_sent = 0
        while True:
            if last_sent != last_update_time:
                last_sent = last_update_time
                yield "data: update\n\n"
            time.sleep(1)
    return Response(stream_with_context(event_stream()), mimetype="text/event-stream")