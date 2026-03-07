<#
.SYNOPSIS
    Windows development environment setup script for Stampcoin Platform
    
.DESCRIPTION
    This script automates the installation of required development tools on Windows:
    - Python 3.14.3 (via Chocolatey)
    - Visual Studio 2022 Build Tools (via Chocolatey)
    - Node.js (if not already installed)
    - Git (if not already installed)
    
.NOTES
    Run this script in an elevated PowerShell session (Run as Administrator)
    
.EXAMPLE
    .\setup-windows.ps1
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Check if running as Administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Error "This script must be run as Administrator. Please restart PowerShell with elevated privileges."
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Stampcoin Platform - Windows Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists
function Test-CommandExists {
    param($command)
    $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
}

# Step 1: Install or upgrade Chocolatey
Write-Host "[1/5] Checking Chocolatey installation..." -ForegroundColor Yellow

if (Test-CommandExists choco) {
    Write-Host "[OK] Chocolatey is already installed" -ForegroundColor Green
    $chocoVersion = & choco --version
    Write-Host "[OK] Current version: $chocoVersion" -ForegroundColor Gray
    
    Write-Host "[OK] Upgrading Chocolatey to latest version..." -ForegroundColor Gray
    try {
        & choco upgrade chocolatey -y
        Write-Host "[OK] Chocolatey upgraded successfully" -ForegroundColor Green
    } catch {
        Write-Warning "Chocolatey upgrade failed, but continuing with existing installation"
    }
} else {
    Write-Host "[OK] Installing Chocolatey..." -ForegroundColor Gray
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    try {
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        Write-Host "[OK] Chocolatey installed successfully" -ForegroundColor Green
    } catch {
        Write-Error "Failed to install Chocolatey. Please install it manually from https://chocolatey.org/install"
        exit 1
    }
}

Write-Host ""

# Step 2: Install/Upgrade Python
Write-Host "[2/5] Checking Python installation..." -ForegroundColor Yellow

if (Test-CommandExists python) {
    $pythonVersion = & python --version 2>&1
    Write-Host "[OK] Python is already installed: $pythonVersion" -ForegroundColor Green
    
    # Check if upgrade is needed
    if ($pythonVersion -notmatch "3\.14\.3") {
        Write-Host "[OK] Upgrading Python to 3.14.3..." -ForegroundColor Gray
        try {
            & choco upgrade python -y --version=3.14.3
            Write-Host "[OK] Python upgraded successfully" -ForegroundColor Green
            Write-Host "[OK] Note: You may need to restart your terminal to use the new version" -ForegroundColor Yellow
        } catch {
            Write-Warning "Python upgrade failed, but continuing with existing installation"
        }
    } else {
        Write-Host "[OK] Python 3.14.3 is already installed" -ForegroundColor Gray
    }
} else {
    Write-Host "[OK] Installing Python 3.14.3..." -ForegroundColor Gray
    try {
        & choco install python -y --version=3.14.3
        Write-Host "[OK] Python installed successfully" -ForegroundColor Green
        Write-Host "[OK] Note: You may need to restart your terminal to use Python" -ForegroundColor Yellow
    } catch {
        Write-Error "Failed to install Python. Please install it manually from https://www.python.org/"
        exit 1
    }
}

Write-Host ""

# Step 3: Install Visual Studio Build Tools
Write-Host "[3/5] Checking Visual Studio Build Tools..." -ForegroundColor Yellow

$vsBuildTools = Get-Command "cl.exe" -ErrorAction SilentlyContinue
if ($null -ne $vsBuildTools) {
    Write-Host "[OK] Visual Studio Build Tools are already installed" -ForegroundColor Green
} else {
    Write-Host "[OK] Installing Visual Studio 2022 Build Tools (VCTools workload)..." -ForegroundColor Gray
    Write-Host "[OK] This may take several minutes..." -ForegroundColor Gray
    try {
        & choco install visualstudio2022-workload-vctools -y
        Write-Host "[OK] Visual Studio Build Tools installed successfully" -ForegroundColor Green
    } catch {
        Write-Warning "Visual Studio Build Tools installation failed. You may need to install manually if you need C++ compilation."
    }
}

Write-Host ""

# Step 4: Install Node.js
Write-Host "[4/5] Checking Node.js installation..." -ForegroundColor Yellow

if (Test-CommandExists node) {
    $nodeVersion = & node --version
    Write-Host "[OK] Node.js is already installed: $nodeVersion" -ForegroundColor Green
    
    $nodeMajor = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($nodeMajor -lt 16) {
        Write-Warning "  Node.js version is below 16.x. Upgrading is recommended."
        $upgrade = Read-Host "  Would you like to upgrade Node.js? (Y/N)"
        if ($upgrade -eq "Y" -or $upgrade -eq "y") {
            & choco upgrade nodejs -y
        }
    }
} else {
    Write-Host "[OK] Installing Node.js LTS..." -ForegroundColor Gray
    try {
        & choco install nodejs-lts -y
        Write-Host "[OK] Node.js installed successfully" -ForegroundColor Green
    } catch {
        Write-Error "Failed to install Node.js. Please install it manually from https://nodejs.org/"
        exit 1
    }
}

Write-Host ""

# Step 5: Install Git
Write-Host "[5/5] Checking Git installation..." -ForegroundColor Yellow

if (Test-CommandExists git) {
    $gitVersion = & git --version
    Write-Host "[OK] Git is already installed: $gitVersion" -ForegroundColor Green
} else {
    Write-Host "[OK] Installing Git..." -ForegroundColor Gray
    try {
        & choco install git -y
        Write-Host "[OK] Git installed successfully" -ForegroundColor Green
    } catch {
        Write-Error "Failed to install Git. Please install it manually from https://git-scm.com/"
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Close and reopen your terminal to refresh environment variables" -ForegroundColor White
Write-Host "2. Clone the repository (if not already done):" -ForegroundColor White
Write-Host "   git clone https://github.com/zedanazad43/stp.git" -ForegroundColor Gray
Write-Host "3. Navigate to the project directory:" -ForegroundColor White
Write-Host "   cd stp" -ForegroundColor Gray
Write-Host "4. Install Node.js dependencies:" -ForegroundColor White
Write-Host "   npm install" -ForegroundColor Gray
Write-Host "5. Install Python dependencies (if requirements.txt exists):" -ForegroundColor White
Write-Host "   pip install -r requirements.txt" -ForegroundColor Gray
Write-Host "6. Start the development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "For more information, see INSTALLATION.md" -ForegroundColor Cyan
Write-Host ""

# Refresh environment variables
Write-Host "Refreshing environment variables..." -ForegroundColor Gray
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Write-Host "[OK] Environment variables refreshed" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
