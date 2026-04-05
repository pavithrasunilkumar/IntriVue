#!/bin/bash
echo "🚀 Starting IntriVue Full Stack..."

# Start ML service
echo "▶ Starting ML Service on port 8000..."
cd ml-service
python -m venv venv 2>/dev/null || true
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null || true
pip install -r requirements.txt -q
python main.py &
ML_PID=$!
cd ..

sleep 2

# Start Backend
echo "▶ Starting Backend on port 5000..."
cd backend
npm install -q
npm run dev &
BACKEND_PID=$!
cd ..

sleep 2

# Start Frontend
echo "▶ Starting Frontend on port 5173..."
cd frontend
npm install -q
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ All services started!"
echo "   Frontend:   http://localhost:5173"
echo "   Backend:    http://localhost:5000"
echo "   ML Service: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services"

trap "kill $ML_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
