# DYOR BOT Local Development Starter Script

Write-Host "Starting DYOR BOT Development Environment..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "Error: Please run this script from the DYOR BOT project root directory" -ForegroundColor Red
    exit 1
}

# Check if .env files exist
if (-not (Test-Path "backend\.env")) {
    Write-Host "Warning: backend\.env file not found" -ForegroundColor Yellow
}

if (-not (Test-Path "frontend\.env")) {
    Write-Host "Warning: frontend\.env file not found" -ForegroundColor Yellow
}

# Check if node_modules exist
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
    Set-Location backend
    npm install
    Set-Location ..
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    Set-Location frontend
    npm install
    Set-Location ..
}

Write-Host "Building backend..." -ForegroundColor Cyan
Set-Location backend
npm run build
Set-Location ..

Write-Host "Starting servers..." -ForegroundColor Green
Write-Host "Backend:  http://localhost:4000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan

# Start backend in a new PowerShell window
Write-Host "Starting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$(Get-Location)\backend'; npm run dev"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend in a new PowerShell window
Write-Host "Starting frontend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$(Get-Location)\frontend'; npm start"

Write-Host "Development environment started!" -ForegroundColor Green
Write-Host "Backend:  http://localhost:4000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "To stop servers: Close the PowerShell windows or press Ctrl+C in each window" -ForegroundColor Yellow
