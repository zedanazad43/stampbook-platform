# Script to resolve git conflicts and push to GitHub

Write-Host "Resolve Git Conflicts and Push to GitHub" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green

Write-Host "Problem: Merge conflicts prevent pushing to GitHub" -ForegroundColor Yellow
Write-Host "Solution: Resolve conflicts locally then push" -ForegroundColor Yellow
Write-Host ""

Write-Host "Step 1: Pull latest changes" -ForegroundColor Yellow
Write-Host "--------------------------------------------" -ForegroundColor Yellow
Write-Host "Pull the latest changes from GitHub:"
Write-Host "git pull origin main"
Write-Host ""

Write-Host "Step 2: Resolve conflicts" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow
Write-Host "For each conflicted file:"
Write-Host "1. Open the conflicted file in your editor"
Write-Host "2. Look for conflict markers (<<<<<<<, =======, >>>>>>>)"
Write-Host "3. Edit the file to keep the desired changes"
Write-Host "4. Stage the resolved file:"
Write-Host "   git add <file-name>"
Write-Host "5. Complete the merge:"
Write-Host "   git commit"
Write-Host ""

Write-Host "Step 3: Push to GitHub" -ForegroundColor Yellow
Write-Host "------------------------------------------------" -ForegroundColor Yellow
Write-Host "Push your resolved changes:"
Write-Host "git push origin main"
Write-Host ""

Write-Host "Alternative: force push (use with caution):" -ForegroundColor Yellow
Write-Host "git push --force-with-lease origin main" -ForegroundColor White
Write-Host ""

Write-Host "Warning: force push will overwrite remote history" -ForegroundColor Yellow
