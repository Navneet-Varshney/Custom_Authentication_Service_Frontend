from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]}})

BACKEND_URL = "http://localhost:8081"

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
        return response

@app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def proxy(path):
    try:
        headers = {k: v for k, v in request.headers if k.lower() != 'host'}
        
        if request.method == 'OPTIONS':
            return '', 204
        
        url = f"{BACKEND_URL}/{path}"
        
        if request.query_string:
            url += f"?{request.query_string.decode()}"
        
        data = request.get_data() if request.data else None
        
        response = requests.request(
            method=request.method,
            url=url,
            headers=headers,
            data=data,
            timeout=10
        )
        
        return response.text, response.status_code, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Content-Type': response.headers.get('Content-Type', 'application/json')
        }
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 CORS Proxy running on http://localhost:3000")
    print("📡 Forwarding to http://localhost:8081")
    app.run(port=3000, debug=False)
