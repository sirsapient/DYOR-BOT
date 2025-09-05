# Test DYOR BOT Batch Discovery with Validation System
# This script demonstrates the new workflow: bot searches -> validation -> pause for review -> resume

Write-Host "🚀 Testing DYOR BOT Batch Discovery with Validation System" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green

# Test 1: Start batch discovery with validation enabled
Write-Host "`n📋 Test 1: Starting batch discovery with validation..." -ForegroundColor Yellow
$startResponse = Invoke-WebRequest -Uri "http://localhost:4000/api/batch-discovery/start" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{
  "config": {
    "maxConcurrentProjects": 2,
    "delayBetweenProjects": 3000,
    "enableValidation": true,
    "pauseOnValidationIssues": true,
    "minValidationScore": 0.7
  }
}' | ConvertFrom-Json

Write-Host "✅ Batch discovery started: $($startResponse.message)" -ForegroundColor Green
Write-Host "   Configuration: $($startResponse.config | ConvertTo-Json -Compress)" -ForegroundColor Cyan

# Wait a moment for processing to begin
Write-Host "`n⏳ Waiting for projects to be processed and validated..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Test 2: Check validation queue status
Write-Host "`n🔍 Test 2: Checking validation queue status..." -ForegroundColor Yellow
$validationStatus = Invoke-WebRequest -Uri "http://localhost:4000/api/batch-discovery/validation-queue" -Method GET | ConvertFrom-Json

Write-Host "📋 Validation Queue Status:" -ForegroundColor Cyan
Write-Host "   Queue Length: $($validationStatus.queueLength)" -ForegroundColor White
Write-Host "   Is Paused: $($validationStatus.isPaused)" -ForegroundColor White

if ($validationStatus.items.Count -gt 0) {
    Write-Host "   Projects in Queue:" -ForegroundColor White
    foreach ($item in $validationStatus.items) {
        Write-Host "     - $($item.projectName): Score $([math]::Round($item.validationScore * 100, 1))%" -ForegroundColor White
    }
}

# Test 3: Check batch discovery stats
Write-Host "`n📊 Test 3: Checking batch discovery statistics..." -ForegroundColor Yellow
$stats = Invoke-WebRequest -Uri "http://localhost:4000/api/batch-discovery/stats" -Method GET | ConvertFrom-Json

Write-Host "📈 Batch Discovery Stats:" -ForegroundColor Cyan
Write-Host "   Total Projects: $($stats.stats.totalProjects)" -ForegroundColor White
Write-Host "   Successful: $($stats.stats.successfulProjects)" -ForegroundColor White
Write-Host "   Failed: $($stats.stats.failedProjects)" -ForegroundColor White
Write-Host "   Queue Length: $($stats.queueStatus.queueLength)" -ForegroundColor White
Write-Host "   Is Running: $($stats.queueStatus.isRunning)" -ForegroundColor White

# Test 4: If there are validation items, examine one in detail
if ($validationStatus.queueLength -gt 0) {
    $firstProject = $validationStatus.items[0].projectName
    Write-Host "`n🔍 Test 4: Examining validation item for '$firstProject'..." -ForegroundColor Yellow
    
    $validationItem = Invoke-WebRequest -Uri "http://localhost:4000/api/batch-discovery/validation-item/$firstProject" -Method GET | ConvertFrom-Json
    
    Write-Host "📋 Validation Details for '$firstProject':" -ForegroundColor Cyan
    Write-Host "   Validation Score: $([math]::Round($validationItem.validationScore * 100, 1))%" -ForegroundColor White
    Write-Host "   Data Points Found: $($validationItem.aiResult.totalDataPoints)" -ForegroundColor White
    Write-Host "   Confidence: $([math]::Round($validationItem.aiResult.confidence * 100, 1))%" -ForegroundColor White
    
    if ($validationItem.validationResult.gaps) {
        Write-Host "   Missing Sources: $($validationItem.validationResult.gaps.Count)" -ForegroundColor Red
        foreach ($gap in $validationItem.validationResult.gaps) {
            Write-Host "     - $gap" -ForegroundColor Red
        }
    }
    
    if ($validationItem.validationResult.recommendations) {
        Write-Host "   Recommendations: $($validationItem.validationResult.recommendations.Count)" -ForegroundColor Yellow
        foreach ($rec in $validationItem.validationResult.recommendations) {
            Write-Host "     - $rec" -ForegroundColor Yellow
        }
    }
    
    # Test 5: Resolve the validation item
    Write-Host "`n✅ Test 5: Resolving validation item for '$firstProject'..." -ForegroundColor Yellow
    
    $resolveResponse = Invoke-WebRequest -Uri "http://localhost:4000/api/batch-discovery/validation-resolve/$firstProject" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{
      "action": "approve",
      "notes": "Manual review completed - data quality acceptable"
    }' | ConvertFrom-Json
    
    Write-Host "✅ Validation resolved: $($resolveResponse.message)" -ForegroundColor Green
}

# Test 6: Check final status
Write-Host "`n📊 Test 6: Final status check..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$finalValidationStatus = Invoke-WebRequest -Uri "http://localhost:4000/api/batch-discovery/validation-queue" -Method GET | ConvertFrom-Json
$finalStats = Invoke-WebRequest -Uri "http://localhost:4000/api/batch-discovery/stats" -Method GET | ConvertFrom-Json

Write-Host "📋 Final Validation Queue: $($finalValidationStatus.queueLength) items" -ForegroundColor Cyan
Write-Host "📈 Final Stats: $($finalStats.stats.totalProjects) total, $($finalStats.stats.successfulProjects) successful" -ForegroundColor Cyan

# Test 7: Stop batch discovery
Write-Host "`n⏹️ Test 7: Stopping batch discovery..." -ForegroundColor Yellow
$stopResponse = Invoke-WebRequest -Uri "http://localhost:4000/api/batch-discovery/stop" -Method POST | ConvertFrom-Json

Write-Host "✅ Batch discovery stopped: $($stopResponse.message)" -ForegroundColor Green

Write-Host "`n🎉 Batch Discovery with Validation System Test Complete!" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
Write-Host "`nThis demonstrates the new workflow:" -ForegroundColor White
Write-Host "1. Bot searches for projects automatically" -ForegroundColor White
Write-Host "2. Each project is validated against real-world data" -ForegroundColor White
Write-Host "3. Projects with low validation scores are paused for review" -ForegroundColor White
Write-Host "4. Manual review and resolution of validation issues" -ForegroundColor White
Write-Host "5. System resumes automatically after validation" -ForegroundColor White
Write-Host "6. Database is populated with validated, complete information" -ForegroundColor White

