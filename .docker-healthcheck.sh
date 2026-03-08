#!/bin/bash

# Try to reach the web server on the configured port
curl --fail http://localhost:${PORT:-8080}/health || exit 1
