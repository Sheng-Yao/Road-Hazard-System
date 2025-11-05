import psycopg2, os
from flask import Flask, jsonify

app = Flask(__name__)

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

@app.route("/stats")
def get_stats():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT name, value FROM stats;")
    rows = cur.fetchall()
    conn.close()
    return jsonify([{"name": r[0], "value": r[1]} for r in rows])