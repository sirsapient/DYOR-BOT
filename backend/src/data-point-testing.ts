// Data Point Testing & Debugging Script
// This script helps systematically test and debug missing data points

interface DataPointTest {
  category: string;
  dataPoint: string;
  expected: boolean;
  found: boolean;
  source: string;
  debugNotes: string;
  fixImplemented: boolean;
}

interface ProjectTestResult {
  projectName: string;
  projectType: string;
  totalDataPoints: number;
  foundDataPoints: number;
  coverage: number;
  categories: {
    [category: string]: {
      total: number;
      found: number;
      coverage: number;
      tests: DataPointTest[];
    };
  };
  missingCritical: string[];
  recommendations: string[];
}

class DataPointTester {
  private testResults: ProjectTestResult[] = [];

  // Define expected data points for each project type
  private getExpectedDataPoints(projectType: string): DataPointTest[] {
    const baseTests: DataPointTest[] = [
      // Category 1: Basic Project Information (100% Required)
      { category: 'Basic Info', dataPoint: 'Project Name', expected: true, found: false, source: 'User Input', debugNotes: '', fixImplemented: false },
      { category: 'Basic Info', dataPoint: 'Project Type', expected: true, found: false, source: 'AI Classification', debugNotes: '', fixImplemented: false },
      { category: 'Basic Info', dataPoint: 'Official Website', expected: true, found: false, source: 'Search Service', debugNotes: '', fixImplemented: false },
      { category: 'Basic Info', dataPoint: 'Project Description', expected: true, found: false, source: 'Website Scraping', debugNotes: '', fixImplemented: false },
      { category: 'Basic Info', dataPoint: 'Launch Date', expected: true, found: false, source: 'Website/News', debugNotes: '', fixImplemented: false },
      { category: 'Basic Info', dataPoint: 'Studio/Company', expected: true, found: false, source: 'Website/Company Info', debugNotes: '', fixImplemented: false },
      { category: 'Basic Info', dataPoint: 'Platforms', expected: true, found: false, source: 'Game Data', debugNotes: '', fixImplemented: false },

      // Category 2: Financial Data (80% Required)
      { category: 'Financial Data', dataPoint: 'Market Cap', expected: true, found: false, source: 'CoinGecko/CoinMarketCap', debugNotes: '', fixImplemented: false },
      { category: 'Financial Data', dataPoint: 'Token Price', expected: true, found: false, source: 'CoinGecko/CoinMarketCap', debugNotes: '', fixImplemented: false },
      { category: 'Financial Data', dataPoint: 'Token Symbol', expected: true, found: false, source: 'CoinGecko/Blockchain Explorer', debugNotes: '', fixImplemented: false },
      { category: 'Financial Data', dataPoint: 'Contract Address', expected: true, found: false, source: 'CoinGecko/Blockchain Explorer', debugNotes: '', fixImplemented: false },
      { category: 'Financial Data', dataPoint: 'Total Supply', expected: true, found: false, source: 'CoinGecko/Blockchain Explorer', debugNotes: '', fixImplemented: false },
      { category: 'Financial Data', dataPoint: 'Circulating Supply', expected: true, found: false, source: 'CoinGecko/CoinMarketCap', debugNotes: '', fixImplemented: false },
      { category: 'Financial Data', dataPoint: '24h Volume', expected: true, found: false, source: 'CoinGecko/CoinMarketCap', debugNotes: '', fixImplemented: false },
      { category: 'Financial Data', dataPoint: 'Network', expected: true, found: false, source: 'CoinGecko/Blockchain Explorer', debugNotes: '', fixImplemented: false },

      // Category 3: Team & Company Information (70% Required)
      { category: 'Team Info', dataPoint: 'Studio Background', expected: true, found: false, source: 'Website/Company Info', debugNotes: '', fixImplemented: false },
      { category: 'Team Info', dataPoint: 'Team Size', expected: false, found: false, source: 'LinkedIn/Company Info', debugNotes: '', fixImplemented: false },
      { category: 'Team Info', dataPoint: 'Key People', expected: true, found: false, source: 'Website/LinkedIn', debugNotes: '', fixImplemented: false },
      { category: 'Team Info', dataPoint: 'LinkedIn Profiles', expected: false, found: false, source: 'LinkedIn Search', debugNotes: '', fixImplemented: false },
      { category: 'Team Info', dataPoint: 'Company Location', expected: false, found: false, source: 'Website/Company Info', debugNotes: '', fixImplemented: false },
      { category: 'Team Info', dataPoint: 'Funding Information', expected: false, found: false, source: 'Crunchbase/News', debugNotes: '', fixImplemented: false },
      { category: 'Team Info', dataPoint: 'Company Website', expected: true, found: false, source: 'Search Service', debugNotes: '', fixImplemented: false },

      // Category 4: Technical Information (80% Required)
      { category: 'Technical Info', dataPoint: 'GitHub Repository', expected: true, found: false, source: 'GitHub API', debugNotes: '', fixImplemented: false },
      { category: 'Technical Info', dataPoint: 'Technology Stack', expected: false, found: false, source: 'GitHub/Website', debugNotes: '', fixImplemented: false },
      { category: 'Technical Info', dataPoint: 'Smart Contracts', expected: true, found: false, source: 'Blockchain Explorer', debugNotes: '', fixImplemented: false },
      { category: 'Technical Info', dataPoint: 'Security Audits', expected: true, found: false, source: 'Audit Firms', debugNotes: '', fixImplemented: false },
      { category: 'Technical Info', dataPoint: 'Documentation', expected: true, found: false, source: 'Website/GitHub', debugNotes: '', fixImplemented: false },
      { category: 'Technical Info', dataPoint: 'API Documentation', expected: false, found: false, source: 'Website/GitHub', debugNotes: '', fixImplemented: false },
      { category: 'Technical Info', dataPoint: 'Development Activity', expected: false, found: false, source: 'GitHub API', debugNotes: '', fixImplemented: false },

      // Category 5: Community & Social (90% Required)
      { category: 'Community', dataPoint: 'Twitter Handle', expected: true, found: false, source: 'Website/Search', debugNotes: '', fixImplemented: false },
      { category: 'Community', dataPoint: 'Twitter Followers', expected: true, found: false, source: 'Twitter API', debugNotes: '', fixImplemented: false },
      { category: 'Community', dataPoint: 'Discord Server', expected: true, found: false, source: 'Website/Search', debugNotes: '', fixImplemented: false },
      { category: 'Community', dataPoint: 'Discord Members', expected: true, found: false, source: 'Discord API', debugNotes: '', fixImplemented: false },
      { category: 'Community', dataPoint: 'Reddit Community', expected: true, found: false, source: 'Website/Search', debugNotes: '', fixImplemented: false },
      { category: 'Community', dataPoint: 'Reddit Members', expected: true, found: false, source: 'Reddit API', debugNotes: '', fixImplemented: false },
      { category: 'Community', dataPoint: 'Telegram Channel', expected: false, found: false, source: 'Website/Search', debugNotes: '', fixImplemented: false },
      { category: 'Community', dataPoint: 'YouTube Channel', expected: false, found: false, source: 'Website/Search', debugNotes: '', fixImplemented: false },
      { category: 'Community', dataPoint: 'Community Sentiment', expected: false, found: false, source: 'Social Media Analysis', debugNotes: '', fixImplemented: false },

      // Category 6: Game/Product Information (90% Required)
      { category: 'Game Info', dataPoint: 'Game Genre', expected: true, found: false, source: 'Steam/Website', debugNotes: '', fixImplemented: false },
      { category: 'Game Info', dataPoint: 'Game Description', expected: true, found: false, source: 'Steam/Website', debugNotes: '', fixImplemented: false },
      { category: 'Game Info', dataPoint: 'Download Links', expected: true, found: false, source: 'Steam/Epic/Website', debugNotes: '', fixImplemented: false },
      { category: 'Game Info', dataPoint: 'Platform Availability', expected: true, found: false, source: 'Game Store APIs', debugNotes: '', fixImplemented: false },
      { category: 'Game Info', dataPoint: 'User Reviews', expected: true, found: false, source: 'Steam/Epic', debugNotes: '', fixImplemented: false },
      { category: 'Game Info', dataPoint: 'Player Count', expected: false, found: false, source: 'Steam/Game APIs', debugNotes: '', fixImplemented: false },
      { category: 'Game Info', dataPoint: 'Game Features', expected: true, found: false, source: 'Steam/Website', debugNotes: '', fixImplemented: false },
      { category: 'Game Info', dataPoint: 'Screenshots/Videos', expected: false, found: false, source: 'Steam/Website', debugNotes: '', fixImplemented: false },

      // Category 7: News & Media (60% Required)
      { category: 'News/Media', dataPoint: 'Recent News', expected: false, found: false, source: 'News APIs', debugNotes: '', fixImplemented: false },
      { category: 'News/Media', dataPoint: 'Press Coverage', expected: false, found: false, source: 'News APIs', debugNotes: '', fixImplemented: false },
      { category: 'News/Media', dataPoint: 'Partnerships', expected: false, found: false, source: 'News/Website', debugNotes: '', fixImplemented: false },
      { category: 'News/Media', dataPoint: 'Updates', expected: false, found: false, source: 'Website/Social Media', debugNotes: '', fixImplemented: false },
      { category: 'News/Media', dataPoint: 'Roadmap', expected: false, found: false, source: 'Website/Whitepaper', debugNotes: '', fixImplemented: false },
    ];

    // Adjust expectations based on project type
    if (projectType === 'Web3Game') {
      // Web3 games should have more financial and blockchain data
      baseTests.forEach(test => {
        if (test.category === 'Financial Data') {
          test.expected = true; // All financial data expected for Web3 games
        }
      });
    } else if (projectType === 'TraditionalGame') {
      // Traditional games might not have financial data but should have game data
      baseTests.forEach(test => {
        if (test.category === 'Financial Data') {
          test.expected = false; // Traditional games don't have tokens
        }
        if (test.category === 'Game Info') {
          test.expected = true; // All game data expected for traditional games
        }
      });
    }

    return baseTests;
  }

  // Analyze search results and check data point coverage
  analyzeSearchResults(projectName: string, projectType: string, searchResults: any): ProjectTestResult {
    console.log(`\n🔍 ANALYZING DATA POINT COVERAGE FOR: ${projectName}`);
    console.log(`📊 Project Type: ${projectType}`);

    const expectedTests = this.getExpectedDataPoints(projectType);
    const categories: { [key: string]: { total: number; found: number; coverage: number; tests: DataPointTest[] } } = {};

    // Initialize categories
    expectedTests.forEach(test => {
      if (!categories[test.category]) {
        categories[test.category] = { total: 0, found: 0, coverage: 0, tests: [] };
      }
      categories[test.category].tests.push(test);
      categories[test.category].total++;
    });

    // Check each data point against search results
    expectedTests.forEach(test => {
      const found = this.checkDataPointExists(test.dataPoint, searchResults);
      test.found = found;
      
      if (found) {
        categories[test.category].found++;
      } else {
        test.debugNotes = this.generateDebugNotes(test.dataPoint, test.source);
      }
    });

    // Calculate coverage for each category
    Object.keys(categories).forEach(category => {
      const cat = categories[category];
      cat.coverage = cat.total > 0 ? (cat.found / cat.total) * 100 : 0;
    });

    // Calculate overall coverage
    const totalDataPoints = expectedTests.filter(t => t.expected).length;
    const foundDataPoints = expectedTests.filter(t => t.expected && t.found).length;
    const overallCoverage = totalDataPoints > 0 ? (foundDataPoints / totalDataPoints) * 100 : 0;

    // Identify missing critical data points
    const missingCritical = expectedTests
      .filter(t => t.expected && !t.found)
      .map(t => `${t.category}: ${t.dataPoint}`);

    // Generate recommendations
    const recommendations = this.generateRecommendations(categories, missingCritical);

    const result: ProjectTestResult = {
      projectName,
      projectType,
      totalDataPoints,
      foundDataPoints,
      coverage: overallCoverage,
      categories,
      missingCritical,
      recommendations
    };

    this.testResults.push(result);
    return result;
  }

  // Check if a specific data point exists in search results
  private checkDataPointExists(dataPoint: string, searchResults: any): boolean {
    // Enhanced check that handles nested fields and specific data point logic
    const dataPointLower = dataPoint.toLowerCase();



    // Special handling for specific data points that are nested
    if (dataPoint === 'Company Website') {
      // Check in teamAnalysis.companyWebsite first, then root level
      if (searchResults.teamAnalysis?.companyWebsite || searchResults.companyWebsite) {
        return true;
      }
    }

    if (dataPoint === 'Studio Background') {
      if (searchResults.teamAnalysis?.studioBackground || searchResults.studioBackground) {
        return true;
      }
    }

    if (dataPoint === 'Team Size') {
      if (searchResults.teamAnalysis?.teamSize || searchResults.teamSize) {
        return true;
      }
    }

    if (dataPoint === 'Key People') {
      if (searchResults.teamAnalysis?.keyPeople || searchResults.keyPeople) {
        return true;
      }
    }

    if (dataPoint === 'LinkedIn Profiles') {
      if (searchResults.teamAnalysis?.linkedInProfiles || searchResults.linkedInProfiles) {
        return true;
      }
    }

    if (dataPoint === 'Company Location') {
      if (searchResults.teamAnalysis?.companyLocation || searchResults.companyLocation) {
        return true;
      }
    }

    if (dataPoint === 'Funding Information') {
      if (searchResults.teamAnalysis?.fundingInfo || searchResults.fundingInfo) {
        return true;
      }
    }

    if (dataPoint === 'Reddit Members') {
      if (searchResults.communityHealth?.redditMembers || searchResults.redditMembers) {
        return true;
      }
    }

    if (dataPoint === 'Reddit Community') {
      if (searchResults.communityHealth?.redditCommunity || searchResults.redditCommunity) {
        return true;
      }
    }

          if (dataPoint === 'Game Description') {
        if (searchResults.gameData?.description || searchResults.gameData?.gameDescription || searchResults.gameDescription) {
          return true;
        }
      }

    if (dataPoint === 'Platform Availability') {
      if (searchResults.gameData?.platformAvailability || searchResults.platformAvailability) {
        return true;
      }
    }

    // For other data points, use the string-based approach
    const searchResultsStr = JSON.stringify(searchResults).toLowerCase();

    // Map data point names to actual field names in search results
    const fieldMappings: { [key: string]: string[] } = {
      'Project Name': ['projectName', 'name'],
      'Project Type': ['projectType', 'type'],
      'Official Website': ['website', 'officialWebsite', 'url'],
      'Project Description': ['description', 'about', 'summary'],
      'Launch Date': ['launchDate', 'releaseDate', 'founded'],
      'Studio/Company': ['studio', 'company', 'developer'],
      'Platforms': ['platforms', 'platform'],
      'Market Cap': ['marketCap', 'marketcap', 'market_cap'],
      'Token Price': ['price', 'tokenPrice', 'currentPrice'],
      'Token Symbol': ['symbol', 'tokenSymbol'],
      'Contract Address': ['contractAddress', 'contract', 'address'],
      'Total Supply': ['totalSupply', 'supply'],
      'Circulating Supply': ['circulatingSupply', 'circulating'],
      '24h Volume': ['volume', 'tradingVolume', 'volume24h'],
      'Network': ['network', 'blockchain', 'chain'],
      'GitHub Repository': ['github', 'repository', 'repo'],
      'Smart Contracts': ['smartContracts', 'contractAddress', 'contracts', 'contract'],
      'Security Audits': ['audits', 'security', 'audit'],
      'Documentation': ['docs', 'documentation'],
      'Twitter Handle': ['twitter', 'twitterHandle'],
      'Twitter Followers': ['twitterFollowers', 'followers'],
      'Discord Server': ['discord', 'discordServer'],
      'Discord Members': ['discordMembers', 'members'],
      'Reddit Community': ['reddit', 'subreddit'],
      'Reddit Members': ['redditMembers'],
      'Game Genre': ['genre', 'gameGenre'],
      'Game Description': ['gameDescription', 'gameDesc'],
      'Download Links': ['downloadLinks', 'downloads', 'links'],
      'User Reviews': ['reviews', 'userReviews'],
      'Game Features': ['features', 'gameFeatures'],
      'Studio Background': ['studioBackground', 'background', 'companyBackground'],
      'Team Size': ['teamSize', 'employees', 'staff'],
      'Key People': ['keyPeople', 'team', 'founders', 'leadership'],
      'LinkedIn Profiles': ['linkedInProfiles', 'linkedin', 'profiles'],
      'Company Location': ['companyLocation', 'location', 'headquarters'],
      'Funding Information': ['fundingInfo', 'funding', 'investment'],
      'Company Website': ['companyWebsite', 'companySite', 'corporateWebsite']
    };

    const possibleFields = fieldMappings[dataPoint] || [dataPointLower];
    
    for (const field of possibleFields) {
      if (searchResultsStr.includes(field)) {
        return true;
      }
    }

    return false;
  }

  // Generate debug notes for missing data points
  private generateDebugNotes(dataPoint: string, source: string): string {
    return `Missing ${dataPoint} from ${source}. Check if source is accessible and search terms are optimal.`;
  }

  // Generate recommendations based on missing data
  private generateRecommendations(categories: any, missingCritical: string[]): string[] {
    const recommendations: string[] = [];

    // Check category coverage
    Object.keys(categories).forEach(category => {
      const cat = categories[category];
      if (cat.coverage < 80) {
        recommendations.push(`Improve ${category} coverage (currently ${cat.coverage.toFixed(1)}%)`);
      }
    });

    // Check critical missing data
    if (missingCritical.length > 0) {
      recommendations.push(`Fix missing critical data points: ${missingCritical.slice(0, 3).join(', ')}`);
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('Excellent coverage! Consider adding more optional data points.');
    }

    return recommendations;
  }

  // Print detailed test results
  printTestResults(result: ProjectTestResult): void {
    console.log(`\n📊 DATA POINT COVERAGE REPORT FOR: ${result.projectName}`);
    console.log(`🎯 Overall Coverage: ${result.coverage.toFixed(1)}% (${result.foundDataPoints}/${result.totalDataPoints})`);
    console.log(`📋 Project Type: ${result.projectType}`);

    console.log(`\n📈 CATEGORY BREAKDOWN:`);
    Object.keys(result.categories).forEach(category => {
      const cat = result.categories[category];
      const status = cat.coverage >= 80 ? '✅' : cat.coverage >= 60 ? '⚠️' : '❌';
      console.log(`${status} ${category}: ${cat.coverage.toFixed(1)}% (${cat.found}/${cat.total})`);
    });

    if (result.missingCritical.length > 0) {
      console.log(`\n❌ MISSING CRITICAL DATA POINTS:`);
      result.missingCritical.forEach(point => {
        console.log(`   • ${point}`);
      });
    }

    if (result.recommendations.length > 0) {
      console.log(`\n💡 RECOMMENDATIONS:`);
      result.recommendations.forEach(rec => {
        console.log(`   • ${rec}`);
      });
    }

    console.log(`\n🔍 DETAILED BREAKDOWN:`);
    Object.keys(result.categories).forEach(category => {
      const cat = result.categories[category];
      console.log(`\n📂 ${category}:`);
      cat.tests.forEach(test => {
        const status = test.found ? '✅' : test.expected ? '❌' : '⏭️';
        console.log(`   ${status} ${test.dataPoint} (${test.source})`);
        if (!test.found && test.expected) {
          console.log(`      Debug: ${test.debugNotes}`);
        }
      });
    });
  }

  // Get all test results
  getAllTestResults(): ProjectTestResult[] {
    return this.testResults;
  }

  // Generate summary report
  generateSummaryReport(): void {
    console.log(`\n📋 SUMMARY REPORT`);
    console.log(`================`);
    
    if (this.testResults.length === 0) {
      console.log('No test results available.');
      return;
    }

    const totalProjects = this.testResults.length;
    const avgCoverage = this.testResults.reduce((sum, r) => sum + r.coverage, 0) / totalProjects;
    const projectsWithHighCoverage = this.testResults.filter(r => r.coverage >= 80).length;

    console.log(`📊 Total Projects Tested: ${totalProjects}`);
    console.log(`📈 Average Coverage: ${avgCoverage.toFixed(1)}%`);
    console.log(`✅ Projects with >80% Coverage: ${projectsWithHighCoverage}/${totalProjects}`);

    console.log(`\n🏆 BEST PERFORMING PROJECTS:`);
    this.testResults
      .sort((a, b) => b.coverage - a.coverage)
      .slice(0, 3)
      .forEach((result, index) => {
        console.log(`${index + 1}. ${result.projectName}: ${result.coverage.toFixed(1)}%`);
      });

    console.log(`\n⚠️ NEEDS IMPROVEMENT:`);
    this.testResults
      .filter(r => r.coverage < 60)
      .forEach(result => {
        console.log(`• ${result.projectName}: ${result.coverage.toFixed(1)}%`);
      });
  }
}

// Export for use in other files
export { DataPointTester, DataPointTest, ProjectTestResult };
