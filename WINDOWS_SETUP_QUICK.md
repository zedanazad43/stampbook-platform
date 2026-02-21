# Windows Setup Quick Reference

## TL;DR

```powershell
# Run as Administrator
.\setup-windows.ps1
```

This installs everything you need automatically.

## What Gets Installed

- ✅ Chocolatey (package manager)
- ✅ Python 3.14.3
- ✅ Node.js LTS (>= 16.x)
- ✅ Git
- ✅ Visual Studio 2022 Build Tools

## After Installation

```powershell
# Close and reopen terminal, then:
git clone https://github.com/zedanazad43/stp.git
cd stp
npm install
pip install -r requirements.txt
npm run dev
```

## Manual Installation

```powershell
# Install Chocolatey first from https://chocolatey.org/install
# Then run:
choco install python --version=3.14.3 -y
choco install nodejs-lts -y
choco install git -y
choco install visualstudio2022-workload-vctools -y
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `choco` not found | Restart terminal after Chocolatey install |
| `python` not found | Restart terminal or run `refreshenv` |
| Build errors | Install Visual Studio Build Tools |
| PATH not updated | Close/reopen terminal |

## More Information

- Full guide: [WINDOWS_SETUP.md](WINDOWS_SETUP.md)
- Installation docs: [INSTALLATION.md](INSTALLATION.md)
- Project README: [README.md](README.md)

---

**Quick Command Reference**

```powershell
# Check versions
python --version
node --version
git --version

# Upgrade packages
choco upgrade all -y

# Upgrade specific package
choco upgrade python -y
```
