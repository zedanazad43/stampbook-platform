#!/bin/bash

# Self-Hosted Runner Verification Script
#      
# Skript zur Uberprufung des Self-Hosted Runners

set -e

echo ""
echo "  Self-Hosted Runner Verification |    "
echo ""
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check command
check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "${GREEN}${NC} $1 is installed"
        if [ -n "$2" ]; then
            version=$($1 $2 2>&1 | head -n 1)
            echo "  Version: $version"
        fi
        return 0
    else
        echo -e "${RED}${NC} $1 is NOT installed"
        return 1
    fi
}

# Function to check version
check_version() {
    local cmd=$1
    local flag=$2
    local min_version=$3
    local current=$($cmd $flag 2>&1 | grep -oP '\d+\.\d+' | head -n 1)
    
    if [ -n "$current" ]; then
        echo "  Found version: $current (minimum required: $min_version)"
        return 0
    fi
    return 1
}

echo ""
echo "1. Checking Prerequisites |   "
echo ""
echo ""

# Check Linux
if [ "$(uname)" == "Linux" ]; then
    echo -e "${GREEN}${NC} Running on Linux"
    echo "  Distribution: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
else
    echo -e "${YELLOW}${NC} Not running on Linux (detected: $(uname))"
fi
echo ""

# Check Node.js
check_command "node" "--version"
if command -v node &> /dev/null; then
    node_version=$(node --version | grep -oP '\d+' | head -n 1)
    if [ "$node_version" -ge 18 ]; then
        echo -e "  ${GREEN}${NC} Node.js version is >= 18"
    else
        echo -e "  ${RED}${NC} Node.js version is < 18 (found: $node_version)"
    fi
fi
echo ""

# Check npm
check_command "npm" "--version"
echo ""

# Check Docker (optional but recommended)
if check_command "docker" "--version"; then
    echo -e "  ${GREEN}${NC} Docker is available (required for docker-build job)"
else
    echo -e "  ${YELLOW}${NC} Docker is not installed (optional, needed for docker-build job)"
fi
echo ""

# Check Git
check_command "git" "--version"
echo ""

# Check curl
check_command "curl" "--version"
echo ""

echo ""
echo "2. Checking System Resources |   "
echo ""
echo ""

# Check RAM
total_ram=$(free -m | awk 'NR==2{print $2}')
echo "RAM: ${total_ram}MB"
if [ "$total_ram" -ge 2048 ]; then
    echo -e "${GREEN}${NC} RAM is sufficient (>= 2GB)"
else
    echo -e "${RED}${NC} RAM is below recommended minimum (found: ${total_ram}MB, recommended: 2048MB)"
fi
echo ""

# Check disk space
available_space=$(df -h . | awk 'NR==2{print $4}')
echo "Available disk space: $available_space"
available_gb=$(df -BG . | awk 'NR==2{print $4}' | grep -oP '\d+')
if [ "$available_gb" -ge 10 ]; then
    echo -e "${GREEN}${NC} Disk space is sufficient (>= 10GB)"
else
    echo -e "${YELLOW}${NC} Disk space is below recommended (found: ${available_gb}GB, recommended: 10GB)"
fi
echo ""

echo ""
echo "3. Checking Runner Installation |   "
echo ""
echo ""

# Check if runner directory exists
if [ -d "actions-runner" ]; then
    echo -e "${GREEN}${NC} actions-runner directory exists"
    
    # Check if runner is configured
    if [ -f "actions-runner/.runner" ]; then
        echo -e "${GREEN}${NC} Runner is configured"
    else
        echo -e "${YELLOW}${NC} Runner is not configured yet"
        echo "  Run: cd actions-runner && ./config.sh --url https://github.com/zedanazad43/stp --token YOUR_TOKEN"
    fi
    
    # Check if runner service is installed
    if systemctl list-units --type=service --all | grep -q "actions.runner"; then
        echo -e "${GREEN}${NC} Runner service is installed"
        
        # Check if runner is running
        if systemctl is-active --quiet actions.runner.*.service 2>/dev/null; then
            echo -e "${GREEN}${NC} Runner service is RUNNING"
        else
            echo -e "${RED}${NC} Runner service is NOT running"
            echo "  Run: sudo ./svc.sh start"
        fi
    else
        echo -e "${YELLOW}${NC} Runner service is not installed"
        echo "  Run: cd actions-runner && sudo ./svc.sh install"
    fi
else
    echo -e "${YELLOW}${NC} actions-runner directory not found"
    echo "  Follow setup instructions in QUICKSTART_SELF_HOSTED_RUNNER.md"
fi
echo ""

echo ""
echo "4. Summary |  | Zusammenfassung"
echo ""
echo ""

echo "Next Steps |  :"
echo ""
echo "1. If runner is not set up, see: QUICKSTART_SELF_HOSTED_RUNNER.md"
echo "        : QUICKSTART_SELF_HOSTED_RUNNER.md"
echo ""
echo "2. Get registration token from:"
echo "       :"
echo "   https://github.com/zedanazad43/stp/settings/actions/runners"
echo ""
echo "3. Configure runner labels: self-hosted,linux"
echo "      : self-hosted,linux"
echo ""
echo "4. Verify runner appears in GitHub settings as 'Idle'"
echo "         GitHub  'Idle'"
echo ""

echo ""
echo "  Verification Complete |   | Uberprufung abgeschlossen"
echo ""
