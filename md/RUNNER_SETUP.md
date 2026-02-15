# Setting Up Self-Hosted Runner for Stampcoin Platform

This guide explains how to set up and configure a self-hosted runner for the Stampcoin Platform project.

## Overview

A self-hosted runner allows you to run GitHub Actions workflows on your own infrastructure, providing more control and potentially better performance for certain tasks.

## Prerequisites

- A machine (virtual or physical) running:
  - Linux (recommended), Windows, or macOS
  - Docker installed and configured
  - Node.js 18 or higher
  - npm (comes with Node.js)
  - Git

## Setup Instructions

### 1. Register the Runner

1. Go to your GitHub repository
2. Navigate to Settings > Actions > Runners
3. Click "New runner"
4. Select the appropriate operating system
5. Follow the on-screen instructions to download and configure the runner

### 2. Configure the Runner

#### Linux/macOS

```bash
# Navigate to the runner directory
cd actions-runner

# Configure the runner
./config.sh --url https://github.com/zedanazad43/stp --token YOUR_TOKEN

# Start the runner
./run.sh
```

#### Windows

```cmd
# Navigate to the runner directory
cd actions-runner

# Configure the runner
config.cmd --url https://github.com/zedanazad43/stp --token YOUR_TOKEN

# Start the runner
run.cmd
```

### 3. Install Required Software

Ensure the following software is installed on the runner machine:

#### Docker Installation

**Linux (Ubuntu/Debian):**
```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# Add Docker repository
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Install Docker
sudo apt-get update
sudo apt-get install -y docker-ce

# Add your user to the docker group
sudo usermod -aG docker $USER

# Activate the changes
newgrp docker
```

**Windows:**
1. Download Docker Desktop for Windows from [docker.com](https://www.docker.com/products/docker-desktop)
2. Follow the installation instructions
3. Ensure Docker is running after installation

#### Node.js and npm

**Using nvm (recommended):**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Activate nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Install Node.js 18
nvm install 18
nvm use 18
```

**Direct installation:**
- Download from [nodejs.org](https://nodejs.org/)
- Follow the installation instructions

### 4. Configure Runner as a Service

To ensure the runner runs continuously, configure it as a service.

#### Linux (systemd)

```bash
# Create a service file
sudo nano /etc/systemd/system/github-runner.service
```

Add the following content:

```ini
[Unit]
Description=GitHub Actions Runner
After=network.target

[Service]
User=your_username
WorkingDirectory=/home/your_username/actions-runner
ExecStart=/home/your_username/actions-runner/run.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable the service
sudo systemctl enable github-runner

# Start the service
sudo systemctl start github-runner
```

#### Windows (as a Windows Service)

1. Download NSSM (Non-Sucking Service Manager) from [nssm.io](https://nssm.cc)
2. Install the runner as a service:
   ```cmd
   nssm install GitHubRunner "C:\path	octions-runnerun.cmd"
   ```
3. Start the service:
   ```cmd
   nssm start GitHubRunner
   ```

#### macOS (launchd)

Create a plist file:

```bash
sudo nano /Library/LaunchDaemons/com.github.runner.plist
```

Add the following content:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.github.runner</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/your_username/actions-runner/run.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

Load and start the service:

```bash
sudo launchctl load /Library/LaunchDaemons/com.github.runner.plist
sudo launchctl start com.github.runner
```

### 5. Configure Docker for the Runner

Ensure Docker is accessible to the runner user:

```bash
# Linux
sudo usermod -aG docker your_runner_user

# Restart the runner service after adding to the docker group
```

### 6. Verify the Runner

1. Go to your repository's Settings > Actions > Runners
2. Verify that your runner appears in the list and is online
3. Run a test workflow to ensure everything is working

## Troubleshooting

### Common Issues

1. **Runner offline**
   - Check if the runner process is running
   - Verify network connectivity
   - Check if the runner token has expired

2. **Docker permission issues**
   - Ensure the runner user is in the docker group
   - Verify Docker is running
   - Check Docker socket permissions

3. **Node.js/npm issues**
   - Verify Node.js and npm are installed
   - Check versions (`node -v`, `npm -v`)
   - Ensure Node.js is in the PATH

### Debug Commands

```bash
# Check runner status
./run.sh --help

# View runner logs
./run.sh --trace

# Check Docker status
docker --version
docker info

# Check Node.js status
node --version
npm --version
```

## Maintenance

### Updating the Runner

1. Download the latest runner:
   ```bash
   ./svc.sh stop
   ./config.sh remove
   ./run.sh --update
   ./svc.sh start
   ```

### Updating Docker

1. Follow the official Docker installation instructions for your OS

### Updating Node.js

1. Using nvm:
   ```bash
   nvm install 18
   nvm use 18
   ```

2. Direct installation:
   - Download the latest version from nodejs.org
   - Follow the installation instructions

## Security Considerations

1. **Runner Security**
   - Use a dedicated machine for the runner
   - Regularly update the runner software
   - Use firewall rules to restrict access

2. **Docker Security**
   - Regularly update Docker
   - Use official images when possible
   - Follow Docker security best practices

3. **Access Control**
   - Use a dedicated GitHub account for the runner if possible
   - Limit repository access for the runner account
   - Use runner groups for better organization

## Support

For issues with the self-hosted runner:
- Check the GitHub runner documentation
- Review the runner logs
- Create an issue in the repository
