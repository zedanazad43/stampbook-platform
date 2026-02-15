# Windows Development Environment Setup

This guide explains how to set up the Stampcoin Platform development environment on Windows using Chocolatey package manager.

## Quick Start

### Automated Setup (Recommended)

1. Open PowerShell as Administrator (Right-click PowerShell → Run as Administrator)
2. Navigate to the project directory
3. Run the setup script:
```powershell
.\setup-windows.ps1
```

The script will automatically install:
- Chocolatey (if not already installed)
- Python 3.14.3
- Node.js LTS
- Visual Studio 2022 Build Tools (VCTools workload)
- Git

## Manual Setup

If you prefer to install components manually or the automated script encounters issues, follow these steps:

### 1. Install Chocolatey

Chocolatey is a package manager for Windows that simplifies software installation.

```powershell
# Run in Administrator PowerShell
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

### 2. Install Required Packages

```powershell
# Install Python 3.14.3
choco install python --version=3.14.3 -y

# Install Node.js LTS
choco install nodejs-lts -y

# Install Git
choco install git -y

# Install Visual Studio 2022 Build Tools (required for some Python packages)
choco install visualstudio2022-workload-vctools -y
```

### 3. Verify Installations

```powershell
# Check Python version
python --version
# Expected output: Python 3.14.3

# Check Node.js version
node --version
# Expected output: v20.x.x or higher

# Check npm version
npm --version

# Check Git version
git --version
```

### 4. Clone and Setup Project

```powershell
# Clone the repository
git clone https://github.com/zedanazad43/stp.git
cd stp

# Install Node.js dependencies
npm install

# Install Python dependencies (if requirements.txt exists)
pip install -r requirements.txt
```

## Understanding Chocolatey Output

When you run Chocolatey commands, you may see various messages:

### Existing Installation Warning

If you see:
```
WARNING: An existing Chocolatey installation was detected. Installation will not continue.
```

This is normal if Chocolatey is already installed. To upgrade Chocolatey itself:
```powershell
choco upgrade chocolatey
```

### Package Upgrade Output

When upgrading packages, you'll see output like:
```
Upgrading the following packages:
python;visualstudio2022-workload-vctools

You have python v3.14.0 installed. Version 3.14.3 is available based on your source(s).
```

This indicates that:
- The package is being upgraded from an older version
- The new version is being downloaded from the Chocolatey repository
- Installation steps are being performed

### Successful Installation Messages

After installation, you'll see:
```
The upgrade of python314 was successful.
Environment Vars (like PATH) have changed. Close/reopen your shell to see the changes.
```

**Important**: Always close and reopen your terminal after installation to ensure environment variables are updated.

## Troubleshooting

### Issue: "Chocolatey already installed" warning

**Solution**: This is informational. If Chocolatey is working, no action needed. To upgrade:
```powershell
choco upgrade chocolatey
```

### Issue: Python not found after installation

**Solution**: 
1. Close all PowerShell/Command Prompt windows
2. Open a new terminal
3. Try `python --version` again
4. If still not found, check if Python is in your PATH:
   ```powershell
   $env:Path
   ```

### Issue: "choco command not found"

**Solution**:
1. Ensure Chocolatey installation completed successfully
2. Close and reopen PowerShell as Administrator
3. Run: `refreshenv` (in PowerShell)
4. Try the choco command again

### Issue: Visual Studio Build Tools installation takes too long

**Solution**: This is normal. The Visual Studio Build Tools are large (~5GB) and may take 15-30 minutes to install depending on your internet connection.

### Issue: npm install fails with build errors

**Solution**: This usually means Visual Studio Build Tools aren't properly installed:
```powershell
choco install visualstudio2022-workload-vctools -y --force
```

## Package Versions

The following versions are recommended for this project:

| Package | Version | Notes |
|---------|---------|-------|
| Python | 3.14.3 | Minimum 3.8, 3.14.3 recommended |
| Node.js | >= 16.x | LTS version recommended |
| Git | Latest | Any recent version works |
| VS Build Tools | 2022 | Required for native Python packages |

## Environment Variables

After installation, these paths should be in your PATH:

- `C:\Python314` (or similar Python installation path)
- `C:\Program Files\nodejs`
- `C:\Program Files\Git\cmd`
- `C:\ProgramData\chocolatey\bin`

To check your PATH:
```powershell
$env:Path -split ';'
```

## Updating Packages

To keep your development environment up to date:

```powershell
# Update Chocolatey itself
choco upgrade chocolatey

# Update all installed packages
choco upgrade all -y

# Update specific package
choco upgrade python -y
choco upgrade nodejs-lts -y
```

## Uninstalling

If you need to remove any package:

```powershell
# Uninstall Python
choco uninstall python -y

# Uninstall Node.js
choco uninstall nodejs-lts -y

# Uninstall Visual Studio Build Tools
choco uninstall visualstudio2022-workload-vctools -y
```

## Alternative: Manual Downloads

If you prefer not to use Chocolatey, you can download installers directly:

- **Python**: https://www.python.org/downloads/
- **Node.js**: https://nodejs.org/
- **Git**: https://git-scm.com/download/win
- **Visual Studio Build Tools**: https://visualstudio.microsoft.com/downloads/ (under "Tools for Visual Studio")

## Next Steps

After completing the setup:

1. ✅ Verify all tools are installed correctly
2. ✅ Clone the repository (if not done already)
3. ✅ Install project dependencies (`npm install`)
4. ✅ Read the [README.md](README.md) for project overview
5. ✅ Check [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines

## Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with:
   - Your Windows version
   - PowerShell output
   - Error messages
   - Steps to reproduce

---

**Last Updated**: February 2026  
**Maintainer**: Stampcoin Platform Team
