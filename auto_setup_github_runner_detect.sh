#!/bin/bash

# --------- USER CONFIGURATION ----------
REPO_URL="https://github.com/zedanazad43/stp"
TOKEN="B53NQE47CB336MKT5K2VZK3JUROQA" # Get this from https://github.com/zedanazad43/stp/settings/actions/runners
LABELS="self-hosted,linux"
RUNNER_DIR="/actions-runner"
RUNNER_VERSION="2.311.0"

# --------- ARCHITECTURE DETECTION ------
ARCH=$(uname -m)
DOWNLOAD_URL=""

echo "Detected architecture: $ARCH"

if [[ "$ARCH" == "x86_64" ]]; then
  DOWNLOAD_URL="https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"
elif [[ "$ARCH" == "aarch64" ]] || [[ "$ARCH" == "arm64" ]]; then
  DOWNLOAD_URL="https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-arm64-${RUNNER_VERSION}.tar.gz"
elif [[ "$ARCH" == "armv7l" ]]; then
  DOWNLOAD_URL="https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-arm-${RUNNER_VERSION}.tar.gz"
else
  echo "Unsupported architecture: $ARCH"
  exit 1
fi

echo "Download URL chosen: $DOWNLOAD_URL"
echo

# --------- SCRIPT LOGIC ----------------

set -e

echo "=== [1/7] Creating runner directory..."
sudo rm -rf $RUNNER_DIR # Remove the old directory if exists
sudo mkdir -p $RUNNER_DIR
sudo chown "$USER":"$USER" $RUNNER_DIR
cd $RUNNER_DIR

echo "=== [2/7] Downloading runner..."
curl -o actions-runner.tar.gz -L $DOWNLOAD_URL

echo "=== [3/7] Extracting runner archive..."
tar xzf actions-runner.tar.gz
rm -f actions-runner.tar.gz

echo "=== [4/7] Configuring runner..."
./config.sh --url "$REPO_URL" --token "$TOKEN" --labels "$LABELS" --unattended

echo "=== [5/7] Installing runner as a service..."
sudo ./svc.sh install

echo "=== [6/7] Starting runner service..."
sudo ./svc.sh start

echo "=== [7/7] Checking runner service status..."
sudo ./svc.sh status

echo "
----------------------------------------------------------
Setup is complete!
Go to $REPO_URL/settings/actions/runners to confirm runner is ONLINE.
If any errors occur, check logs:
  sudo journalctl -u actions-runner.service -f
----------------------------------------------------------
"