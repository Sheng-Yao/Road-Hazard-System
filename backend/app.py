from flask import Flask, jsonify
import psycopg2, os

app = Flask(__name__)

conn = psycopg2.connect(os.environ["DATABASE_URL"])

@app.route("/stats")
def get_stats():
    cur = conn.cursor()
    cur.execute("SELECT name, value FROM stats;")
    rows = cur.fetchall()
    return jsonify([{"name": r[0], "value": r[1]} for r in rows])