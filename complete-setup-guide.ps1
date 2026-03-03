
#  GitHub Actions Runner   

Write-Host "  GitHub Actions Runner  " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

Write-Host " 1:    URL  Runner  GitHub" -ForegroundColor Yellow
Write-Host "-------------------------------------------------------" -ForegroundColor Yellow
Write-Host "1.     GitHub  " -ForegroundColor White
Write-Host "2.    (repository)" -ForegroundColor White
Write-Host "3.      'Settings'" -ForegroundColor White
Write-Host "4.      'Actions'" -ForegroundColor White
Write-Host "5.      'Runners'" -ForegroundColor White
Write-Host "6.    'New runner'" -ForegroundColor White
Write-Host "7.   URL  Runner  " -ForegroundColor White
Write-Host ""

Write-Host " 2:   Runner " -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow
Write-Host "1.      actions-runner:" -ForegroundColor White
Write-Host "   cd C:\Users\azadz\actions-runner" -ForegroundColor White
Write-Host "2.    Runner       :" -ForegroundColor White
Write-Host "   tar -xzf actions-runner-linux-x64-2.331.0.tar.gz" -ForegroundColor White
Write-Host "3.    Runner   URL :" -ForegroundColor White
Write-Host "   .\config.cmd --url YOUR_REPO_URL --token YOUR_RUNNER_TOKEN" -ForegroundColor White
Write-Host "    YOUR_REPO_URL YOUR_RUNNER_TOKEN  " -ForegroundColor White
Write-Host ""

Write-Host " 3:   Runner" -ForegroundColor Yellow
Write-Host "-----------------------------" -ForegroundColor Yellow
Write-Host "1.       Runner:" -ForegroundColor White
Write-Host "   .\run.cmd" -ForegroundColor White
Write-Host "2.     Runner       " -ForegroundColor White
Write- ""

Write-Host " 4:    (Workflow)  " -ForegroundColor Yellow
Write-Host "-----------------------------------------------------" -ForegroundColor Yellow
Write-Host "1.   GitHub     '.github'    " -ForegroundColor White
Write-Host "2.  '.github'    'workflows'" -ForegroundColor White
Write-Host "3.  'workflows'     'publish.yml'" -ForegroundColor White
Write-Host "4.      (    ):" -ForegroundColor White
Write-Host ""

#     
$workflowContent = @"
name: Publish Project

on:
  push:
    branches: [ main, master ]

jobs:
  build-and-deploy:
    runs-on: self-hosted
    steps:
    - name: Checkout repository
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm install

    - name: Build project
      run: npm run build

    - name: Deploy project
      run: |
        #      
        # : rsync -av dist/ /path/to/deployment/
        echo "Deployment completed successfully"
"@

Write-Host $workflowContent -ForegroundColor Cyan
Write-Host ""

Write-Host " 5:     Runner" -ForegroundColor Yellow
Write-Host "-----------------------------------------------" -ForegroundColor Yellow
Write-Host "1.   commit    GitHub:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor White
Write-Host "   git commit -m 'Add GitHub Actions workflow'" -ForegroundColor White
Write-Host "   git push origin main" -ForegroundColor White
Write-Host "2.        'Actions'    GitHub" -ForegroundColor White
Write-Host "3.     Runner   " -ForegroundColor White
Write-Host ""

Write-Host " :" -ForegroundColor Yellow
Write-Host "---------------" -ForegroundColor Yellow
Write-Host "-    Windows      Windows  Runner    Linux" -ForegroundColor White
Write-Host "-   Runner   Windows : https://github.com/actions/runner/releases" -ForegroundColor White
Write-Host "-    Runner       " -ForegroundColor White
Write-Host "-       (environment variables)     " -ForegroundColor White
Write-Host ""
