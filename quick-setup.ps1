# DYOR BOT Quick Setup Script
# This script creates .env files from the examples

Write-Host "🔧 Setting up DYOR BOT environment files..." -ForegroundColor Green
Write-Host ""

# Setup backend .env
if (-not (Test-Path "backend\.env")) {
    Copy-Item "backend\env.example" "backend\.env"
    Write-Host "✅ Created backend\.env" -ForegroundColor Green
} else {
    Write-Host "ℹ️  backend\.env already exists" -ForegroundColor Yellow
}

# Setup frontend .env
if (-not (Test-Path "frontend\.env")) {
    Copy-Item "frontend\env.example" "frontend\.env"
    Write-Host "✅ Created frontend\.env" -ForegroundColor Green
} else {
    Write-Host "ℹ️  frontend\.env already exists" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Edit backend\.env and add your API keys" -ForegroundColor White
Write-Host "   2. Edit frontend\.env and set REACT_APP_API_URL=http://localhost:4000" -ForegroundColor White
Write-Host "   3. Run .\start-dev.ps1 to start the development servers" -ForegroundColor White
Write-Host ""

# Offer to open the files for editing
$openFiles = Read-Host "Would you like to open the .env files for editing? (y/n)"
if ($openFiles -eq "y" -or $openFiles -eq "Y") {
    if (Test-Path "backend\.env") {
        Start-Process notepad "backend\.env"
    }
    if (Test-Path "frontend\.env") {
        Start-Process notepad "frontend\.env"
    }
    Write-Host "✅ Opened .env files for editing" -ForegroundColor Green
}
