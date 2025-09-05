// Multi-Ecosystem Research Test Suite
// Testing 5 projects from each ecosystem to validate our expanded research bot
// Now with segmented testing to avoid timeout issues

import { AIResearchOrchestrator, conductAIOrchestratedResearch } from './ai-research-orchestrator';
import { 
  EXPANDED_PROJECT_TYPES, 
  BLOCKCHAIN_SUPPORT,
  getProjectTypeSummary,
  getBlockchainSummary
} from './project-status-summary';

// Test Projects by Ecosystem
const TEST_PROJECTS = {
  // DeFi Protocols
  defi: [
    {
      name: 'Uniswap',
      description: 'Leading DEX on Ethereum',
      expectedData: ['TVL', 'APY', 'Liquidity Pools', 'Token Distribution'],
      chain: 'ethereum',
      priority: 'high'
    },
    {
      name: 'Aave',
      description: 'Lending and borrowing protocol',
      expectedData: ['TVL', 'APY', 'Smart Contract Audits', 'Risk Assessment'],
      chain: 'ethereum',
      priority: 'high'
    },
    {
      name: 'Trader Joe',
      description: 'DeFi hub on Avalanche',
      expectedData: ['TVL', 'APY', 'Protocol Revenue', 'Governance'],
      chain: 'avalanche',
      priority: 'high'
    },
    {
      name: 'Raydium',
      description: 'DEX on Solana',
      expectedData: ['TVL', 'APY', 'Liquidity Pools', 'Token Distribution'],
      chain: 'solana',
      priority: 'medium'
    },
    {
      name: 'GMX',
      description: 'Perpetual trading protocol',
      expectedData: ['TVL', 'APY', 'Risk Assessment', 'Protocol Revenue'],
      chain: 'arbitrum',
      priority: 'medium'
    }
  ],

  // NFT Collections
  nft: [
    {
      name: 'Bored Ape Yacht Club',
      description: 'Iconic NFT collection',
      expectedData: ['Floor Price', 'Volume', 'Rarity', 'Community Utility'],
      chain: 'ethereum',
      priority: 'high'
    },
    {
      name: 'Doodles',
      description: 'Colorful NFT collection',
      expectedData: ['Floor Price', 'Volume', 'Royalty Structure', 'IP Rights'],
      chain: 'ethereum',
      priority: 'medium'
    },
    {
      name: 'Okay Bears',
      description: 'Solana NFT collection',
      expectedData: ['Floor Price', 'Volume', 'Marketplace Integration'],
      chain: 'solana',
      priority: 'medium'
    },
    {
      name: 'Azuki',
      description: 'Anime-inspired NFTs',
      expectedData: ['Floor Price', 'Volume', 'Rarity', 'Community'],
      chain: 'ethereum',
      priority: 'medium'
    },
    {
      name: 'Moonbirds',
      description: 'PFP NFT collection',
      expectedData: ['Floor Price', 'Volume', 'Utility', 'Staking'],
      chain: 'ethereum',
      priority: 'medium'
    }
  ],

  // AI/ML Projects
  ai: [
    {
      name: 'Fetch.ai',
      description: 'AI-powered blockchain platform',
      expectedData: ['Model Performance', 'API Pricing', 'Team Expertise', 'Use Cases'],
      chain: 'ethereum',
      priority: 'medium'
    },
    {
      name: 'Ocean Protocol',
      description: 'Data marketplace with AI',
      expectedData: ['Model Performance', 'Training Data', 'API Pricing', 'Ethical Considerations'],
      chain: 'ethereum',
      priority: 'medium'
    },
    {
      name: 'SingularityNET',
      description: 'AI marketplace platform',
      expectedData: ['Model Performance', 'Benchmarks', 'Team Expertise', 'Competitive Landscape'],
      chain: 'ethereum',
      priority: 'medium'
    },
    {
      name: 'Bittensor',
      description: 'Decentralized AI network',
      expectedData: ['Model Performance', 'Compute Requirements', 'Network Metrics', 'Incentives'],
      chain: 'ethereum',
      priority: 'medium'
    },
    {
      name: 'Render Network',
      description: 'GPU rendering network',
      expectedData: ['Compute Requirements', 'API Pricing', 'Network Metrics', 'Use Cases'],
      chain: 'ethereum',
      priority: 'medium'
    }
  ],

  // Meme Coins
  memecoin: [
    {
      name: 'Dogecoin',
      description: 'Original meme coin',
      expectedData: ['Community Sentiment', 'Viral Potential', 'Celebrity Endorsements', 'Tokenomics'],
      chain: 'ethereum',
      priority: 'medium'
    },
    {
      name: 'Shiba Inu',
      description: 'Dogecoin competitor',
      expectedData: ['Community Sentiment', 'Social Momentum', 'Tokenomics', 'Liquidity Locks'],
      chain: 'ethereum',
      priority: 'medium'
    },
    {
      name: 'Pepe',
      description: 'Frog meme coin',
      expectedData: ['Viral Potential', 'Social Momentum', 'Tokenomics', 'Community'],
      chain: 'ethereum',
      priority: 'medium'
    },
    {
      name: 'Bonk',
      description: 'Solana meme coin',
      expectedData: ['Community Sentiment', 'Viral Potential', 'Tokenomics', 'Social Momentum'],
      chain: 'solana',
      priority: 'medium'
    },
    {
      name: 'Floki',
      description: 'Viking-themed meme coin',
      expectedData: ['Community Sentiment', 'Celebrity Endorsements', 'Tokenomics', 'Marketing'],
      chain: 'ethereum',
      priority: 'low'
    }
  ],

  // Infrastructure/Blockchain
  infrastructure: [
    {
      name: 'Polygon',
      description: 'Ethereum scaling solution',
      expectedData: ['Network Metrics', 'Security Features', 'Scalability', 'Developer Experience'],
      chain: 'polygon',
      priority: 'high'
    },
    {
      name: 'Arbitrum',
      description: 'Layer 2 scaling solution',
      expectedData: ['Network Metrics', 'Security', 'Scalability', 'Interoperability'],
      chain: 'arbitrum',
      priority: 'high'
    },
    {
      name: 'Optimism',
      description: 'Optimistic rollup',
      expectedData: ['Network Metrics', 'Security', 'Scalability', 'Developer Experience'],
      chain: 'ethereum',
      priority: 'medium'
    },
    {
      name: 'Cosmos',
      description: 'Interoperable blockchain ecosystem',
      expectedData: ['Network Metrics', 'Interoperability', 'Security', 'Developer Experience'],
      chain: 'cosmos',
      priority: 'medium'
    },
    {
      name: 'Polkadot',
      description: 'Multi-chain network',
      expectedData: ['Network Metrics', 'Interoperability', 'Security', 'Governance'],
      chain: 'polkadot',
      priority: 'medium'
    }
  ],

  // DAOs
  dao: [
    {
      name: 'Uniswap DAO',
      description: 'Governance for Uniswap protocol',
      expectedData: ['Governance', 'Proposals', 'Treasury', 'Community'],
      chain: 'ethereum',
      priority: 'high'
    },
    {
      name: 'Aave DAO',
      description: 'Governance for Aave protocol',
      expectedData: ['Governance', 'Proposals', 'Treasury', 'Voting Mechanisms'],
      chain: 'ethereum',
      priority: 'high'
    },
    {
      name: 'MakerDAO',
      description: 'Dai stablecoin governance',
      expectedData: ['Governance', 'Treasury', 'Proposals', 'Community'],
      chain: 'ethereum',
      priority: 'high'
    },
    {
      name: 'Compound DAO',
      description: 'Lending protocol governance',
      expectedData: ['Governance', 'Proposals', 'Treasury', 'Voting'],
      chain: 'ethereum',
      priority: 'medium'
    },
    {
      name: 'ENS DAO',
      description: 'Ethereum Name Service governance',
      expectedData: ['Governance', 'Proposals', 'Treasury', 'Community'],
      chain: 'ethereum',
      priority: 'medium'
    }
  ],

  // Web3 Games
  web3_games: [
    {
      name: 'Axie Infinity',
      description: 'Pioneering Web3 game',
      expectedData: ['Player Count', 'Token Price', 'NFT Collections', 'Team Info'],
      chain: 'ronin',
      priority: 'high'
    },
    {
      name: 'The Sandbox',
      description: 'Virtual world platform',
      expectedData: ['Player Count', 'Token Price', 'NFT Collections', 'Development Activity'],
      chain: 'ethereum',
      priority: 'high'
    },
    {
      name: 'Decentraland',
      description: 'Virtual reality platform',
      expectedData: ['Player Count', 'Token Price', 'NFT Collections', 'Community'],
      chain: 'ethereum',
      priority: 'high'
    },
    {
      name: 'Illuvium',
      description: 'Auto-battler game',
      expectedData: ['Player Count', 'Token Price', 'NFT Collections', 'Development'],
      chain: 'ethereum',
      priority: 'medium'
    },
    {
      name: 'Gods Unchained',
      description: 'Trading card game',
      expectedData: ['Player Count', 'Token Price', 'NFT Collections', 'Game Mechanics'],
      chain: 'ethereum',
      priority: 'medium'
    }
  ]
};

// Test Results Interface
export interface TestResult {
  projectName: string;
  projectType: string;
  chain: string;
  success: boolean;
  dataCollected: string[];
  missingData: string[];
  errors: string[];
  executionTime: number;
  confidence: number;
  notes: string[];
}

export interface EcosystemTestSummary {
  ecosystem: string;
  totalProjects: number;
  successfulTests: number;
  failedTests: number;
  averageExecutionTime: number;
  averageConfidence: number;
  dataCoverage: number;
  topPerformingProjects: string[];
  problematicProjects: string[];
  recommendations: string[];
}

// Test Configuration
export interface TestConfig {
  ecosystems: string[];
  maxProjectsPerRun: number;
  delayBetweenTests: number;
  delayBetweenEcosystems: number;
  saveResults: boolean;
  resultsFile?: string;
}

// Test Runner Class
class MultiEcosystemTestRunner {
  private orchestrator: AIResearchOrchestrator;
  private results: TestResult[] = [];
  private config: TestConfig;
  private anthropicApiKey: string;

  constructor(anthropicApiKey: string, config?: Partial<TestConfig>) {
    this.anthropicApiKey = anthropicApiKey;
    this.orchestrator = new AIResearchOrchestrator(anthropicApiKey);
    this.config = {
      ecosystems: Object.keys(TEST_PROJECTS),
      maxProjectsPerRun: 5,
      delayBetweenTests: 2000,
      delayBetweenEcosystems: 5000,
      saveResults: true,
      resultsFile: 'test-results.json',
      ...config
    };
  }

  // Run test for a single project
  async testSingleProject(project: any): Promise<TestResult> {
    const startTime = Date.now();
    const result: TestResult = {
      projectName: project.name,
      projectType: this.getProjectTypeFromName(project.name),
      chain: project.chain,
      success: false,
      dataCollected: [],
      missingData: [],
      errors: [],
      executionTime: 0,
      confidence: 0,
      notes: []
    };

    try {
      console.log(`🔍 Testing ${project.name} (${project.description})`);
      
      // Run research using AI orchestrator with data collection functions
              const dataCollectionFunctions = {
          fetchWhitepaperUrl: async (websiteUrl: string) => null,
          fetchWebsiteAboutSection: async (url: string) => 'About section placeholder',
          fetchPdfBuffer: async (url: string) => null,
          extractTokenomicsFromWhitepaper: async (url: string) => null,
          searchProjectSpecificTokenomics: async (projectName: string, aliases: string[]) => null,
          fetchTwitterProfileAndTweets: async (handle: string) => ({ followers: 1000, tweets: [] }),
          fetchEnhancedTwitterData: async (handle: string) => ({ followers: 1000, tweets: [] }),
          fetchDiscordServerData: async (inviteCode: string) => ({ members: 1000 }),
          fetchRedditCommunityData: async (subreddit: string) => ({ subscribers: 1000 }),
          fetchRedditRecentPosts: async (subreddit: string, limit?: number) => ({ posts: [] }),
          discoverSocialMediaLinks: async (projectName: string, websiteUrl?: string) => ({}),
          fetchSteamDescription: async (appid: string) => 'Game description',
          fetchRoninTokenData: async (contractAddress: string) => ({ symbol: 'TOKEN', totalSupply: '1000000' }),
          fetchRoninTransactionHistory: async (contractAddress: string) => ({ transactions: [] }),
          discoverOfficialUrlsWithAI: async (projectName: string, aliases: string[]) => ({
            website: `https://${projectName.toLowerCase().replace(/\s+/g, '')}.com`,
            whitepaper: `https://${projectName.toLowerCase().replace(/\s+/g, '')}.com/whitepaper`,
            socialMedia: `https://twitter.com/${projectName.toLowerCase().replace(/\s+/g, '')}`,
            documentation: `https://docs.${projectName.toLowerCase().replace(/\s+/g, '')}.com`,
            github: `https://github.com/${projectName.toLowerCase().replace(/\s+/g, '')}`
          }),
          findOfficialSourcesForEstablishedProject: async (projectName: string, aliases: string[]) => ({}),
          searchContractAddressWithLLM: async (projectName: string) => null,
          getFinancialDataFromAlternativeSources: async (projectName: string) => ({ marketCap: 1000000, price: 1.0 }),
          searchNFTs: async (projectName: string) => Promise.resolve([])
        };
      
      const researchResult = await conductAIOrchestratedResearch(project.name, this.anthropicApiKey, undefined, dataCollectionFunctions);
      
      if (researchResult) {
        result.success = true;
        result.executionTime = Date.now() - startTime;
        result.confidence = researchResult.confidence || 0;
        
        // Analyze collected data
        this.analyzeCollectedData(researchResult, project.expectedData, result);
        
        console.log(`✅ ${project.name} - Success (${result.executionTime}ms, ${result.confidence}% confidence)`);
      } else {
        result.errors.push('No research result returned');
        console.log(`❌ ${project.name} - Failed (no result)`);
      }
    } catch (error) {
      result.errors.push((error as Error).message);
      result.executionTime = Date.now() - startTime;
      console.log(`❌ ${project.name} - Error: ${(error as Error).message}`);
    }

    return result;
  }

  // Run tests for a single ecosystem
  async testEcosystem(ecosystem: string): Promise<TestResult[]> {
    console.log(`\n🚀 TESTING ${ecosystem.toUpperCase()} ECOSYSTEM`);
    console.log('='.repeat(50));
    
    const projects = TEST_PROJECTS[ecosystem as keyof typeof TEST_PROJECTS];
    const results: TestResult[] = [];

    for (const project of projects) {
      const result = await this.testSingleProject(project);
      results.push(result);
      this.results.push(result);
      
      // Add delay between tests to avoid rate limits
      await this.delay(this.config.delayBetweenTests);
    }

    return results;
  }

  // Run tests for specific ecosystems only
  async testSpecificEcosystems(ecosystems: string[]): Promise<{
    results: TestResult[];
    summaries: EcosystemTestSummary[];
    overallSummary: any;
  }> {
    console.log('🎯 SEGMENTED ECOSYSTEM RESEARCH BOT TEST');
    console.log('========================================\n');
    
    console.log(`Testing ecosystems: ${ecosystems.join(', ')}`);
    console.log(getProjectTypeSummary());
    console.log(getBlockchainSummary());
    console.log('');

    const allResults: TestResult[] = [];
    const summaries: EcosystemTestSummary[] = [];

    // Test each specified ecosystem
    for (const ecosystem of ecosystems) {
      if (!TEST_PROJECTS[ecosystem as keyof typeof TEST_PROJECTS]) {
        console.log(`⚠️ Ecosystem '${ecosystem}' not found, skipping...`);
        continue;
      }

      const ecosystemResults = await this.testEcosystem(ecosystem);
      allResults.push(...ecosystemResults);
      
      const summary = this.generateEcosystemSummary(ecosystem, ecosystemResults);
      summaries.push(summary);

      // Add delay between ecosystems
      if (ecosystems.indexOf(ecosystem) < ecosystems.length - 1) {
        console.log(`\n⏳ Waiting ${this.config.delayBetweenEcosystems/1000}s before next ecosystem...`);
        await this.delay(this.config.delayBetweenEcosystems);
      }
    }

    const overallSummary = this.generateOverallSummary(allResults, summaries);

    // Save results if configured
    if (this.config.saveResults) {
      this.saveResults(allResults, summaries, overallSummary);
    }

    return {
      results: allResults,
      summaries,
      overallSummary
    };
  }

  // Run comprehensive test across all ecosystems (original method)
  async runComprehensiveTest(): Promise<{
    results: TestResult[];
    summaries: EcosystemTestSummary[];
    overallSummary: any;
  }> {
    return this.testSpecificEcosystems(this.config.ecosystems);
  }

  // Run a quick test with just 1-2 projects per ecosystem
  async runQuickTest(): Promise<{
    results: TestResult[];
    summaries: EcosystemTestSummary[];
    overallSummary: any;
  }> {
    console.log('⚡ QUICK TEST - 1-2 projects per ecosystem');
    console.log('==========================================\n');

    const quickProjects: { [key: string]: any[] } = {};
    
    // Take first 1-2 projects from each ecosystem
    for (const [ecosystem, projects] of Object.entries(TEST_PROJECTS)) {
      quickProjects[ecosystem] = projects.slice(0, 2);
    }

    const allResults: TestResult[] = [];
    const summaries: EcosystemTestSummary[] = [];

    for (const [ecosystem, projects] of Object.entries(quickProjects)) {
      console.log(`\n🚀 QUICK TESTING ${ecosystem.toUpperCase()} (${projects.length} projects)`);
      console.log('='.repeat(50));
      
      const results: TestResult[] = [];
      
      for (const project of projects) {
        const result = await this.testSingleProject(project);
        results.push(result);
        allResults.push(result);
        this.results.push(result);
        
        await this.delay(this.config.delayBetweenTests);
      }
      
      const summary = this.generateEcosystemSummary(ecosystem, results);
      summaries.push(summary);
      
      await this.delay(this.config.delayBetweenEcosystems);
    }

    const overallSummary = this.generateOverallSummary(allResults, summaries);
    
    if (this.config.saveResults) {
      this.saveResults(allResults, summaries, overallSummary, 'quick-test-results.json');
    }

    return {
      results: allResults,
      summaries,
      overallSummary
    };
  }

  // Generate summary for an ecosystem
  private generateEcosystemSummary(ecosystem: string, results: TestResult[]): EcosystemTestSummary {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    const avgExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
    const avgConfidence = successful.reduce((sum, r) => sum + r.confidence, 0) / successful.length || 0;
    
    const dataCoverage = results.reduce((sum, r) => {
      const totalExpected = TEST_PROJECTS[ecosystem as keyof typeof TEST_PROJECTS]
        .find(p => p.name === r.projectName)?.expectedData.length || 0;
      return sum + (r.dataCollected.length / totalExpected);
    }, 0) / results.length * 100;

    const topPerforming = results
      .filter(r => r.success && r.confidence > 80)
      .map(r => r.projectName);

    const problematic = results
      .filter(r => !r.success || r.confidence < 50)
      .map(r => r.projectName);

    const recommendations = this.generateRecommendations(ecosystem, results);

    return {
      ecosystem,
      totalProjects: results.length,
      successfulTests: successful.length,
      failedTests: failed.length,
      averageExecutionTime: avgExecutionTime,
      averageConfidence: avgConfidence,
      dataCoverage,
      topPerformingProjects: topPerforming,
      problematicProjects: problematic,
      recommendations
    };
  }

  // Generate overall summary
  private generateOverallSummary(results: TestResult[], summaries: EcosystemTestSummary[]): any {
    const totalProjects = results.length;
    const totalSuccessful = results.filter(r => r.success).length;
    const totalFailed = results.filter(r => !r.success).length;
    
    const avgExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
    const avgConfidence = results.filter(r => r.success)
      .reduce((sum, r) => sum + r.confidence, 0) / totalSuccessful || 0;

    const bestEcosystem = summaries.reduce((best, current) => 
      current.dataCoverage > best.dataCoverage ? current : best
    );

    const worstEcosystem = summaries.reduce((worst, current) => 
      current.dataCoverage < worst.dataCoverage ? current : worst
    );

    return {
      totalProjects,
      totalSuccessful,
      totalFailed,
      successRate: (totalSuccessful / totalProjects) * 100,
      avgExecutionTime,
      avgConfidence,
      bestPerformingEcosystem: bestEcosystem.ecosystem,
      worstPerformingEcosystem: worstEcosystem.ecosystem,
      overallDataCoverage: summaries.reduce((sum, s) => sum + s.dataCoverage, 0) / summaries.length,
      timestamp: new Date().toISOString()
    };
  }

  // Helper methods
  private getProjectTypeFromName(projectName: string): string {
    for (const [ecosystem, projects] of Object.entries(TEST_PROJECTS)) {
      if (projects.some(p => p.name === projectName)) {
        return ecosystem;
      }
    }
    return 'unknown';
  }

  private analyzeCollectedData(researchResult: any, expectedData: string[], result: TestResult): void {
    // This would analyze the research result and compare with expected data
    // For now, we'll use a simplified approach
    result.dataCollected = expectedData.filter(data => {
      // Check if the data exists in the research result
      return researchResult[data.toLowerCase()] || 
             researchResult[data.toLowerCase().replace(/\s+/g, '_')] ||
             researchResult[data.toLowerCase().replace(/\s+/g, '')];
    });
    
    result.missingData = expectedData.filter(data => !result.dataCollected.includes(data));
  }

  private generateRecommendations(ecosystem: string, results: TestResult[]): string[] {
    const recommendations: string[] = [];
    
    const successRate = results.filter(r => r.success).length / results.length;
    
    if (successRate < 0.8) {
      recommendations.push(`Improve success rate for ${ecosystem} projects`);
    }
    
    const avgConfidence = results.filter(r => r.success)
      .reduce((sum, r) => sum + r.confidence, 0) / results.filter(r => r.success).length || 0;
    
    if (avgConfidence < 70) {
      recommendations.push(`Enhance data quality and confidence for ${ecosystem}`);
    }
    
    const slowProjects = results.filter(r => r.executionTime > 10000);
    if (slowProjects.length > 0) {
      recommendations.push(`Optimize performance for slow ${ecosystem} projects`);
    }
    
    return recommendations;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Save results to file
  private saveResults(results: TestResult[], summaries: EcosystemTestSummary[], overallSummary: any, filename?: string): void {
    const fs = require('fs');
    const filepath = filename || this.config.resultsFile || 'test-results.json';
    
    const data = {
      timestamp: new Date().toISOString(),
      config: this.config,
      results,
      summaries,
      overallSummary
    };

    try {
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
      console.log(`\n💾 Results saved to ${filepath}`);
    } catch (error) {
      console.log(`\n⚠️ Failed to save results: ${(error as Error).message}`);
    }
  }

  // Display results
  displayResults(results: TestResult[], summaries: EcosystemTestSummary[], overallSummary: any): void {
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('========================\n');
    
    console.log('🎯 OVERALL PERFORMANCE:');
    console.log(`   Total Projects: ${overallSummary.totalProjects}`);
    console.log(`   Success Rate: ${overallSummary.successRate.toFixed(1)}%`);
         console.log(`   Average Execution Time: ${overallSummary.avgExecutionTime?.toFixed(0) || 'N/A'}ms`);
     console.log(`   Average Confidence: ${overallSummary.avgConfidence?.toFixed(1) || 'N/A'}%`);
    console.log(`   Overall Data Coverage: ${overallSummary.overallDataCoverage.toFixed(1)}%`);
    console.log(`   Best Ecosystem: ${overallSummary.bestPerformingEcosystem}`);
    console.log(`   Worst Ecosystem: ${overallSummary.worstPerformingEcosystem}`);
    console.log(`   Timestamp: ${overallSummary.timestamp}`);
    
    console.log('\n📈 ECOSYSTEM BREAKDOWN:');
    for (const summary of summaries) {
      const emoji = summary.successfulTests / summary.totalProjects > 0.8 ? '✅' : 
                   summary.successfulTests / summary.totalProjects > 0.6 ? '⚠️' : '❌';
      console.log(`${emoji} ${summary.ecosystem.toUpperCase()}:`);
      console.log(`   Success: ${summary.successfulTests}/${summary.totalProjects} (${(summary.successfulTests/summary.totalProjects*100).toFixed(1)}%)`);
      console.log(`   Data Coverage: ${summary.dataCoverage.toFixed(1)}%`);
      console.log(`   Avg Confidence: ${summary.averageConfidence.toFixed(1)}%`);
             console.log(`   Avg Time: ${summary.averageExecutionTime?.toFixed(0) || 'N/A'}ms`);
      
      if (summary.topPerformingProjects.length > 0) {
        console.log(`   Top Performers: ${summary.topPerformingProjects.join(', ')}`);
      }
      if (summary.problematicProjects.length > 0) {
        console.log(`   Issues: ${summary.problematicProjects.join(', ')}`);
      }
      console.log('');
    }
    
    console.log('💡 RECOMMENDATIONS:');
    for (const summary of summaries) {
      if (summary.recommendations.length > 0) {
        console.log(`   ${summary.ecosystem.toUpperCase()}:`);
        summary.recommendations.forEach(rec => console.log(`     • ${rec}`));
      }
    }
  }

  // Get available ecosystems
  getAvailableEcosystems(): string[] {
    return Object.keys(TEST_PROJECTS);
  }

  // Get projects for a specific ecosystem
  getProjectsForEcosystem(ecosystem: string): any[] {
    return TEST_PROJECTS[ecosystem as keyof typeof TEST_PROJECTS] || [];
  }
}

// Main test runners with different configurations
async function runQuickTest() {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!anthropicApiKey) {
    console.log('❌ ANTHROPIC_API_KEY not found in environment variables');
    console.log('Please set your Anthropic API key to run the tests');
    return;
  }

  const testRunner = new MultiEcosystemTestRunner(anthropicApiKey, {
    delayBetweenTests: 1500,
    delayBetweenEcosystems: 3000,
    saveResults: true,
    resultsFile: 'quick-test-results.json'
  });
  
  try {
    const { results, summaries, overallSummary } = await testRunner.runQuickTest();
    testRunner.displayResults(results, summaries, overallSummary);
    
    console.log('\n✅ QUICK TEST COMPLETE');
    console.log('🎯 Research bot tested across 14 projects in 7 ecosystems!');
    
  } catch (error) {
    console.error('❌ Quick test failed:', error);
  }
}

async function runDefiTest() {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!anthropicApiKey) {
    console.log('❌ ANTHROPIC_API_KEY not found in environment variables');
    console.log('Please set your Anthropic API key to run the tests');
    return;
  }

  const testRunner = new MultiEcosystemTestRunner(anthropicApiKey, {
    ecosystems: ['defi'],
    delayBetweenTests: 2000,
    saveResults: true,
    resultsFile: 'defi-test-results.json'
  });
  
  try {
    const { results, summaries, overallSummary } = await testRunner.testSpecificEcosystems(['defi']);
    testRunner.displayResults(results, summaries, overallSummary);
    
    console.log('\n✅ DEFI ECOSYSTEM TEST COMPLETE');
    console.log('🎯 Research bot tested across 5 DeFi projects!');
    
  } catch (error) {
    console.error('❌ DeFi test failed:', error);
  }
}

async function runNftTest() {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!anthropicApiKey) {
    console.log('❌ ANTHROPIC_API_KEY not found in environment variables');
    console.log('Please set your Anthropic API key to run the tests');
    return;
  }

  const testRunner = new MultiEcosystemTestRunner(anthropicApiKey, {
    ecosystems: ['nft'],
    delayBetweenTests: 2000,
    saveResults: true,
    resultsFile: 'nft-test-results.json'
  });
  
  try {
    const { results, summaries, overallSummary } = await testRunner.testSpecificEcosystems(['nft']);
    testRunner.displayResults(results, summaries, overallSummary);
    
    console.log('\n✅ NFT ECOSYSTEM TEST COMPLETE');
    console.log('🎯 Research bot tested across 5 NFT projects!');
    
  } catch (error) {
    console.error('❌ NFT test failed:', error);
  }
}

async function runWeb3GamesTest() {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!anthropicApiKey) {
    console.log('❌ ANTHROPIC_API_KEY not found in environment variables');
    console.log('Please set your Anthropic API key to run the tests');
    return;
  }

  const testRunner = new MultiEcosystemTestRunner(anthropicApiKey, {
    ecosystems: ['web3_games'],
    delayBetweenTests: 2000,
    saveResults: true,
    resultsFile: 'web3games-test-results.json'
  });
  
  try {
    const { results, summaries, overallSummary } = await testRunner.testSpecificEcosystems(['web3_games']);
    testRunner.displayResults(results, summaries, overallSummary);
    
    console.log('\n✅ WEB3 GAMES ECOSYSTEM TEST COMPLETE');
    console.log('🎯 Research bot tested across 5 Web3 Games projects!');
    
  } catch (error) {
    console.error('❌ Web3 Games test failed:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const testType = args[0] || 'quick';
  
  switch (testType) {
    case 'quick':
      runQuickTest();
      break;
    case 'defi':
      runDefiTest();
      break;
    case 'nft':
      runNftTest();
      break;
    case 'web3games':
      runWeb3GamesTest();
      break;
    case 'all':
      // This would run the full test - use with caution
      console.log('⚠️ Full test not implemented yet - use individual ecosystem tests');
      break;
    default:
      console.log('Available test types:');
      console.log('  quick     - Test 1-2 projects per ecosystem (recommended)');
      console.log('  defi      - Test only DeFi projects');
      console.log('  nft       - Test only NFT projects');
      console.log('  web3games - Test only Web3 Games projects');
      console.log('  all       - Test all 35 projects (use with caution)');
      console.log('\nUsage: npx ts-node src/test-multi-ecosystem-research.ts [test-type]');
  }
}

export { 
  runQuickTest,
  runDefiTest,
  runNftTest,
  runWeb3GamesTest,
  MultiEcosystemTestRunner, 
  TEST_PROJECTS 
};
