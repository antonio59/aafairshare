#!/bin/bash

# Function to kill processes on specific ports
kill_port() {
  local port=$1
  echo "Checking port $port..."
  
  # Get PID using the port (works on macOS and Linux)
  local pid=$(lsof -i :$port -t)
  
  if [ -n "$pid" ]; then
    echo "Killing process on port $port (PID: $pid)"
    kill -9 $pid
  else
    echo "No process using port $port"
  fi
}

echo "Killing any running dev servers..."

# Kill processes on common Vite dev server ports
for port in {5173..5177}; do
  kill_port $port
done

# Kill any node processes containing "vite"
echo "Killing any other Vite processes..."
pkill -f "vite" || echo "No additional Vite processes found"

# Clean Vite cache
echo "Cleaning Vite cache..."
rm -rf node_modules/.vite

# Start the development server
echo "Starting Vite development server..."
npx vite dev
