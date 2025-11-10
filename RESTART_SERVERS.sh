#!/bin/bash

# LearnHub LMS - Server Restart Script
# Run this to restart both frontend and backend servers

echo " Restarting LearnHub LMS Servers..."
echo ""

# Kill existing processes on ports 3000 and 5174
echo " Stopping existing servers..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5174 | xargs kill -9 2>/dev/null || true
echo " Existing servers stopped"
echo ""

# Start backend
echo " Starting Backend Server (Port 3000)..."
cd lms-backend
node index.js &
BACKEND_PID=$!
echo " Backend started (PID: $BACKEND_PID)"
echo ""

# Wait a moment for backend to initialize
sleep 2

# Start frontend
echo " Starting Frontend Server (Port 5174)..."
cd ../lms-frontend
npm run dev &
FRONTEND_PID=$!
echo " Frontend started (PID: $FRONTEND_PID)"
echo ""

echo " Both servers are running!"
echo ""
echo " Access your LMS at:"
echo "   Frontend: http://localhost:5174"
echo "   Backend:  http://localhost:3000"
echo ""
echo "  To stop servers later:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo " Happy coding!"
