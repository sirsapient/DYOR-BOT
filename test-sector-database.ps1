# Test Sector Database Population System
Write-Host "🚀 Testing Sector Database Population System" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Check if backend is running
Write-Host "🔍 Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/health" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is running" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend responded with status: $($response.StatusCode)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Backend is not running. Please start the backend first." -ForegroundColor Red
    Write-Host "💡 Use: .\start-dev.ps1" -ForegroundColor Cyan
    exit 1
}

Write-Host ""

# Test 1: Get all sectors
Write-Host "📊 Test 1: Getting all sectors..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/sector-database/sectors" -Method GET
    $sectors = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Found $($sectors.totalSectors) sectors:" -ForegroundColor Green
    foreach ($sector in $sectors.sectors) {
        Write-Host "   🏭 $($sector.name) - $($sector.topProjects.Count) projects" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Failed to get sectors: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Get sector details (Web3 Games)
Write-Host "🎮 Test 2: Getting Web3 Games sector details..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/sector-database/sectors/Web3%20Games" -Method GET
    $sector = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Web3 Games sector details:" -ForegroundColor Green
    Write-Host "   📝 Description: $($sector.sector.description)" -ForegroundColor Cyan
    Write-Host "   🎯 Data Priorities: $($sector.sector.dataPriorities -join ', ')" -ForegroundColor Cyan
    Write-Host "   🔍 Search Terms: $($sector.sector.searchTerms -join ', ')" -ForegroundColor Cyan
    Write-Host "   📊 Top Projects:" -ForegroundColor Cyan
    for ($i = 0; $i -lt [Math]::Min(5, $sector.sector.topProjects.Count); $i++) {
        Write-Host "      $($i + 1). $($sector.sector.topProjects[$i])" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Failed to get Web3 Games sector: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Get current stats
Write-Host "📈 Test 3: Getting current stats..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/sector-database/stats" -Method GET
    $stats = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Current stats:" -ForegroundColor Green
    Write-Host "   📊 Progress: $($stats.progress)" -ForegroundColor Cyan
    Write-Host "   🏭 Sectors: $($stats.stats.completedSectors)/$($stats.stats.totalSectors)" -ForegroundColor Cyan
    Write-Host "   🔍 Projects: $($stats.stats.completedProjects)/$($stats.stats.totalProjects)" -ForegroundColor Cyan
    Write-Host "   🕐 Start Time: $($stats.stats.startTime)" -ForegroundColor Cyan
    Write-Host "   📍 Current Status: $($stats.currentStatus.sector) - $($stats.currentStatus.project)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to get stats: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Start sector database population
Write-Host "🚀 Test 4: Starting sector database population..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/sector-database/start" -Method POST
    $result = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Population started:" -ForegroundColor Green
    Write-Host "   📝 Message: $($result.message)" -ForegroundColor Cyan
    Write-Host "   🏭 Total Sectors: $($result.totalSectors)" -ForegroundColor Cyan
    Write-Host "   🔍 Total Projects: $($result.totalProjects)" -ForegroundColor Cyan
    Write-Host "   🕐 Timestamp: $($result.timestamp)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to start population: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Monitor progress for a few seconds
Write-Host "⏳ Test 5: Monitoring progress for 10 seconds..." -ForegroundColor Yellow
for ($i = 1; $i -le 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4000/api/sector-database/stats" -Method GET
        $stats = $response.Content | ConvertFrom-Json
        
        Write-Host "   📊 Progress at $i seconds: $($stats.progress)" -ForegroundColor Cyan
        Write-Host "      Current: $($stats.currentStatus.sector) - $($stats.currentStatus.project)" -ForegroundColor White
        
        if ($stats.stats.completedProjects -gt 0) {
            Write-Host "      ✅ Completed: $($stats.stats.completedProjects) projects" -ForegroundColor Green
        }
        
        Start-Sleep -Seconds 1
    } catch {
        Write-Host "   ❌ Failed to get progress: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 6: Stop population
Write-Host "⏹️ Test 6: Stopping sector database population..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/sector-database/stop" -Method POST
    $result = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Population stopped:" -ForegroundColor Green
    Write-Host "   📝 Message: $($result.message)" -ForegroundColor Cyan
    Write-Host "   🕐 Timestamp: $($result.timestamp)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to stop population: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 7: Final stats
Write-Host "📊 Test 7: Final stats after stopping..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/sector-database/stats" -Method GET
    $stats = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Final stats:" -ForegroundColor Green
    Write-Host "   📊 Progress: $($stats.progress)" -ForegroundColor Cyan
    Write-Host "   🏭 Sectors: $($stats.stats.completedSectors)/$($stats.stats.totalSectors)" -ForegroundColor Cyan
    Write-Host "   🔍 Projects: $($stats.stats.completedProjects)/$($stats.stats.totalProjects)" -ForegroundColor Cyan
    Write-Host "   📍 Current Status: $($stats.currentStatus.sector) - $($stats.currentStatus.project)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to get final stats: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 8: Check database stats
Write-Host "🗄️ Test 8: Checking project database stats..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/database/stats" -Method GET
    $dbStats = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Database stats:" -ForegroundColor Green
    Write-Host "   📊 Total Projects: $($dbStats.totalProjects)" -ForegroundColor Cyan
    Write-Host "   🏷️ Categories: $($dbStats.categories -join ', ')" -ForegroundColor Cyan
    Write-Host "   ⭐ High Priority: $($dbStats.priorityBreakdown.high || 0)" -ForegroundColor Cyan
    Write-Host "   🔍 Recent Additions: $($dbStats.recentAdditions.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to get database stats: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Sector Database Population Test Complete!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Review the populated database with: GET /api/database/stats" -ForegroundColor White
Write-Host "   2. Search for specific projects: GET /api/database/search?q=projectname" -ForegroundColor White
Write-Host "   3. Start full population: POST /api/sector-database/start" -ForegroundColor White
Write-Host "   4. Monitor progress: GET /api/sector-database/stats" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Ready to populate your Web3 project database!" -ForegroundColor Green
Write-Host "This system will add the top 10 projects from each of the 8 major Web3 sectors" -ForegroundColor Cyan
Write-Host "Total: 80 top-tier Web3 projects with sector metadata!" -ForegroundColor Green
Write-Host ""

