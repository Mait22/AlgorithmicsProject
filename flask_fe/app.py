# compose_flask/app.py
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS

import redis
from redis.commands.json.path import Path

redis_cache = redis.Redis(host='redis_db', port=6379, decode_responses=True)

app = Flask(__name__)
CORS(app)

@app.route('/')
def get_data():

    result = redis_cache.json().get('iteration:1')
    return make_response(jsonify(result), 200)

if __name__ == "__main__":
    app.run(debug=True)