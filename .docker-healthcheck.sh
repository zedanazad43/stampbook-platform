#!/bin/bash

# Try to reach the web server on localhost:3000
curl --fail http://localhost:3000/health || exit 1