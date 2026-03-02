
#   GitHub Actions Runner

Write-Host "  GitHub Actions Runner" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

#   Runner
Write-Host " 1:    URL  Runner  GitHub" -ForegroundColor Yellow
Write-Host "-      GitHub" -ForegroundColor White
Write-Host "-   Settings > Actions > Runners" -ForegroundColor White
Write-Host "-   'New runner'    " -ForegroundColor White
Write-Host ""

Write-Host " 2:   Runner   " -ForegroundColor Yellow
Write-Host "   runner     " -ForegroundColor White
tar -xzf actions-runner-linux-x64-2.331.0.tar.gz
Write-Host "   " -ForegroundColor Green
Write-Host ""

Write-Host " 3:   Runner" -ForegroundColor Yellow
Write-Host "     URL  :" -ForegroundColor White
Write-Host ".\config.cmd --url YOUR_REPO_URL --token YOUR_RUNNER_TOKEN" -ForegroundColor Cyan
Write-Host ""

Write-Host " 4:   Runner" -ForegroundColor Yellow
Write-Host "     Runner :" -ForegroundColor White
Write-Host ".un.cmd" -ForegroundColor Cyan
Write-Host ""

Write-Host ":      Linux     WSL   Windows" -ForegroundColor Yellow
Write-Host "     Windows : https://github.com/actions/runner/releases" -ForegroundColor White
