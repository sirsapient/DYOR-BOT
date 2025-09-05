// Debug Endpoint for Data Collection Testing
// This helps us understand what our bot is finding vs. what's actually available

import { debugProjectDataCollection } from './debug-data-collection';
import { projectDatabase } from './project-database';

export async function handleDebugRequest(projectName: string, anthropicApiKey: string) {
  console.log(`🔍 DEBUG: Starting debug request for ${projectName}`);
  
  try {
    // Step 1: Run comprehensive debug
    const debugResult = await debugProjectDataCollection(projectName, anthropicApiKey);
    
    // Step 2: Check database for existing reference data
    const existingReference = projectDatabase.getProjectReference(projectName);
    
    // Step 3: Generate comparison report
    const comparison = {
      projectName,
      debugResult,
      databaseComparison: {
        hasExistingData: !!existingReference,
        existingUrls: existingReference?.knownUrls || {},
        existingContracts: existingReference?.contractAddresses || {},
        dataQuality: existingReference?.dataQuality || 'none'
      },
      recommendations: generateRecommendations(debugResult, existingReference)
    };
    
    return comparison;
    
  } catch (error) {
    console.error(`❌ DEBUG: Error in debug request:`, error);
    return {
      error: error instanceof Error ? error.message : String(error),
      projectName,
      timestamp: new Date().toISOString()
    };
  }
}

function generateRecommendations(debugResult: any, existingReference: any): string[] {
  const recommendations: string[] = [];
  
  // Check data collection success
  if (debugResult.finalSummary.successfulSources < 3) {
    recommendations.push(`Only ${debugResult.finalSummary.successfulSources}/5 sources successful - investigate missing source handlers`);
  }
  
  // Check URL discovery
  const discoveredUrls = Object.values(debugResult.discoveredUrls).filter((d: any) => d.found).length;
  if (discoveredUrls < 3) {
    recommendations.push(`Only ${discoveredUrls}/5 URLs discovered - improve URL discovery logic`);
  }
  
  // Check data points
  if (debugResult.finalSummary.totalDataPoints < 20) {
    recommendations.push(`Low data points (${debugResult.finalSummary.totalDataPoints}) - enhance data extraction`);
  }
  
  // Check confidence
  if (debugResult.finalSummary.confidence < 0.7) {
    recommendations.push(`Low confidence (${Math.round(debugResult.finalSummary.confidence * 100)}%) - improve data quality`);
  }
  
  // Database recommendations
  if (existingReference) {
    if (existingReference.dataQuality === 'low') {
      recommendations.push('Existing database entry has low quality - consider re-researching');
    }
  } else {
    recommendations.push('No existing database entry - this is a new project');
  }
  
  return recommendations;
}

// Function to test what's actually available for a project
export async function testRealDataAvailability(projectName: string): Promise<any> {
  console.log(`🔍 REAL DATA TEST: Testing what's actually available for ${projectName}`);
  
  const testResults = {
    projectName,
    timestamp: new Date().toISOString(),
    urlTests: {} as { [key: string]: any },
    apiTests: {} as { [key: string]: any }
  };
  
  // Test common URL patterns
  const urlPatterns = [
    { name: 'official_website', pattern: `https://${projectName.toLowerCase()}.com` },
    { name: 'github', pattern: `https://github.com/${projectName.toLowerCase()}` },
    { name: 'twitter', pattern: `https://twitter.com/${projectName.toLowerCase()}` },
    { name: 'discord', pattern: `https://discord.gg/${projectName.toLowerCase()}` }
  ];
  
  for (const urlTest of urlPatterns) {
    try {
      const response = await fetch(urlTest.pattern, { method: 'HEAD' });
      testResults.urlTests[urlTest.name] = {
        url: urlTest.pattern,
        exists: response.ok,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      testResults.urlTests[urlTest.name] = {
        url: urlTest.pattern,
        exists: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  // Test API endpoints (CoinGecko, etc.)
  try {
    const coingeckoResponse = await fetch(`https://api.coingecko.com/api/v3/search?query=${projectName.toLowerCase()}`);
    if (coingeckoResponse.ok) {
      const data = await coingeckoResponse.json();
      testResults.apiTests.coingecko = {
        success: true,
        results: data.coins?.length || 0,
        data: data.coins?.slice(0, 3) || []
      };
    } else {
      testResults.apiTests.coingecko = {
        success: false,
        status: coingeckoResponse.status
      };
    }
  } catch (error) {
    testResults.apiTests.coingecko = {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
  
  return testResults;
}

// Function to compare our findings with real data
export async function compareFindingsWithReality(
  ourFindings: any, 
  realDataTest: any
): Promise<any> {
  const comparison = {
    projectName: ourFindings.projectName,
    timestamp: new Date().toISOString(),
    gaps: [] as string[],
    improvements: [] as string[],
    accuracy: {
      urlDiscovery: 0,
      dataCollection: 0,
      overall: 0
    }
  };
  
  // Compare URL discovery
  const ourUrls = Object.values(ourFindings.discoveredUrls).filter((d: any) => d.found).length;
  const realUrls = Object.values(realDataTest.urlTests).filter((t: any) => t.exists).length;
  
  comparison.accuracy.urlDiscovery = realUrls > 0 ? ourUrls / realUrls : 0;
  
  if (ourUrls < realUrls) {
    comparison.gaps.push(`Missing ${realUrls - ourUrls} URLs that actually exist`);
    comparison.improvements.push('Enhance URL discovery patterns');
  }
  
  // Compare data collection
  const ourDataPoints = ourFindings.finalSummary.totalDataPoints;
  const expectedDataPoints = realUrls * 10; // Rough estimate
  
  comparison.accuracy.dataCollection = expectedDataPoints > 0 ? ourDataPoints / expectedDataPoints : 0;
  
  if (ourDataPoints < expectedDataPoints) {
    comparison.gaps.push(`Collected ${ourDataPoints} data points, expected ~${expectedDataPoints}`);
    comparison.improvements.push('Improve data extraction from discovered sources');
  }
  
  // Overall accuracy
  comparison.accuracy.overall = (comparison.accuracy.urlDiscovery + comparison.accuracy.dataCollection) / 2;
  
  return comparison;
}

