#!/bin/sh

# Render startup script for Stampcoin Platform

# Set environment variables
export NODE_ENV=production
export PORT=8080
export HOST=0.0.0.0
export RENDER_OUTBOUND_IPS="74.220.48.0/24 74.220.56.0/24"

# Log environment variables for debugging
echo "Starting with environment:"
echo "NODE_ENV=$NODE_ENV"
echo "PORT=$PORT"
echo "HOST=$HOST"
echo "RENDER_OUTBOUND_IPS=$RENDER_OUTBOUND_IPS"

# Start the application
echo "Starting Stampcoin Platform..."
node server.js
