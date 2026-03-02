
# GitHub Actions Runner 

Write-Host "GitHub Actions Runner " -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# 
$repoUrl = "https://github.com/your-username/your-repo"  # URL
$runnerToken = "your_runner_token"  #  runner token

#  actions-runner 
Write-Host " actions-runner ..." -ForegroundColor Yellow
Set-Location -Path "C:\Users\azadz\actions-runner"

# 
Write-Host " GitHub Actions Runner..." -ForegroundColor Yellow
tar -xzf actions-runner-linux-x64-2.331.0.tar.gz

#  runner
Write-Host " GitHub Actions Runner..." -ForegroundColor Yellow
.\config.cmd --url $repoUrl --token $runnerToken

#  runner
Write-Host " GitHub Actions Runner..." -ForegroundColor Yellow
.un.cmd --once

Write-Host "!Runner " -ForegroundColor Green
