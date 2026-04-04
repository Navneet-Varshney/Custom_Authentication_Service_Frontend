#!/bin/bash

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "Starting CORS Proxy Server..."
echo ""
echo "========================================"
echo "  CORS Proxy running on port 3000"
echo "========================================"
echo "Frontend: http://localhost:5500"
echo "Backend: http://localhost:8081"
echo "Proxy: http://localhost:3000"
echo "========================================"
echo ""

python proxy.py
