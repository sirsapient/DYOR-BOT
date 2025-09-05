# Test Debug Endpoint and Database Functionality
# This script tests our new debug system to see what data our bot is finding vs. what's available

Write-Host "🔍 Testing DYOR BOT Debug System" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Test project names
$testProjects = @("Zerebro", "Axie Infinity", "Decentraland")

foreach ($project in $testProjects) {
    Write-Host "`n🔍 Testing project: $project" -ForegroundColor Yellow
    
    try {
        # Test debug endpoint
        Write-Host "  Testing debug endpoint..." -ForegroundColor Cyan
        $debugResponse = Invoke-WebRequest -Uri "http://localhost:4000/api/debug" -Method POST -Headers @{"Content-Type"="application/json"} -Body "{\"projectName\":\"$project\"}"
        
        if ($debugResponse.StatusCode -eq 200) {
            $debugData = $debugResponse.Content | ConvertFrom-Json
            Write-Host "  ✅ Debug successful" -ForegroundColor Green
            
            # Display key metrics
            if ($debugData.debugResult) {
                $dp = $debugData.debugResult.finalSummary.totalDataPoints
                $ss = $debugData.debugResult.finalSummary.successfulSources
                $conf = [math]::Round($debugData.debugResult.finalSummary.confidence * 100)
                Write-Host "    Data Points: $dp" -ForegroundColor White
                Write-Host "    Sources: $ss/5" -ForegroundColor White
                Write-Host "    Confidence: $conf%" -ForegroundColor White
            }
            
            # Display comparison results
            if ($debugData.comparison) {
                $accuracy = [math]::Round($debugData.comparison.accuracy.overall * 100)
                Write-Host "    Overall Accuracy: $accuracy%" -ForegroundColor White
                
                if ($debugData.comparison.gaps) {
                    Write-Host "    Gaps found:" -ForegroundColor Red
                    foreach ($gap in $debugData.comparison.gaps) {
                        Write-Host "      - $gap" -ForegroundColor Red
                    }
                }
            }
        } else {
            Write-Host "  ❌ Debug failed with status: $($debugResponse.StatusCode)" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "  ❌ Debug request failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test database statistics
Write-Host "`n📊 Testing Database Statistics" -ForegroundColor Yellow
try {
    $statsResponse = Invoke-WebRequest -Uri "http://localhost:4000/api/database/stats" -Method GET
    
    if ($statsResponse.StatusCode -eq 200) {
        $stats = $statsResponse.Content | ConvertFrom-Json
        Write-Host "  ✅ Database stats retrieved" -ForegroundColor Green
        Write-Host "    Total Projects: $($stats.totalProjects)" -ForegroundColor White
        Write-Host "    Total URLs: $($stats.totalKnownUrls)" -ForegroundColor White
        Write-Host "    Total Contracts: $($stats.totalContractAddresses)" -ForegroundColor White
        Write-Host "    Average URLs/Project: $([math]::Round($stats.averageUrlsPerProject, 2))" -ForegroundColor White
    } else {
        Write-Host "  ❌ Database stats failed with status: $($statsResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "  ❌ Database stats request failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test database search
Write-Host "`n🔍 Testing Database Search" -ForegroundColor Yellow
try {
    $searchResponse = Invoke-WebRequest -Uri "http://localhost:4000/api/database/search?query=Zerebro" -Method GET
    
    if ($searchResponse.StatusCode -eq 200) {
        $searchResults = $searchResponse.Content | ConvertFrom-Json
        Write-Host "  ✅ Database search successful" -ForegroundColor Green
        Write-Host "    Query: $($searchResults.query)" -ForegroundColor White
        Write-Host "    Results: $($searchResults.total)" -ForegroundColor White
        
        if ($searchResults.results) {
            foreach ($result in $searchResults.results) {
                Write-Host "    - $($result.projectName) (Quality: $($result.dataQuality))" -ForegroundColor White
            }
        }
    } else {
        Write-Host "  ❌ Database search failed with status: $($searchResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "  ❌ Database search request failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Debug testing completed!" -ForegroundColor Green
Write-Host "Check the console output above for results and any issues found." -ForegroundColor White

