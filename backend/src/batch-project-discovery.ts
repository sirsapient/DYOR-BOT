// Automated Batch Project Discovery System
// This system continuously discovers and researches projects to build a comprehensive database

import { conductAIOrchestratedResearch } from './ai-research-orchestrator';
import { projectDatabase } from './project-database';
import { debugProjectDataCollection } from './debug-data-collection';
import { testRealDataAvailability, compareFindingsWithReality } from './debug-endpoint';

export interface BatchDiscoveryConfig {
  maxConcurrentProjects: number;
  delayBetweenProjects: number; // milliseconds
  maxProjectsPerBatch: number;
  autoRestart: boolean;
  discoverySources: string[];
  priorityChains: string[];
  minDataQuality: 'low' | 'medium' | 'high';
  enableValidation: boolean; // NEW: Enable validation workflow
  pauseOnValidationIssues: boolean; // NEW: Pause when validation finds issues
  minValidationScore: number; // NEW: Minimum validation score to proceed (0-1)
}

export interface ProjectDiscoveryResult {
  projectName: string;
  success: boolean;
  dataPoints: number;
  confidence: number;
  discoveredUrls: number;
  contractAddresses: number;
  dataQuality: 'low' | 'medium' | 'high';
  errors: string[];
  timestamp: string;
}

export interface BatchDiscoveryStats {
  totalProjects: number;
  successfulProjects: number;
  failedProjects: number;
  averageDataPoints: number;
  averageConfidence: number;
  totalUrls: number;
  totalContracts: number;
  startTime: string;
  lastUpdate: string;
  projectsPerHour: number;
}

export class BatchProjectDiscovery {
  private config: BatchDiscoveryConfig;
  private isRunning: boolean = false;
  private currentBatch: string[] = [];
  private processedProjects: Set<string> = new Set();
  private stats: BatchDiscoveryStats;
  private discoveryQueue: string[] = [];
  private validationQueue: Array<{
    projectName: string;
    aiResult: any;
    validationResult: any;
    validationScore: number;
    timestamp: string;
  }> = [];
  private isPausedForValidation: boolean = false;

  constructor(config: Partial<BatchDiscoveryConfig> = {}) {
    this.config = {
      maxConcurrentProjects: 3,
      delayBetweenProjects: 5000, // 5 seconds
      maxProjectsPerBatch: 50,
      autoRestart: true,
      discoverySources: ['coingecko', 'defillama', 'twitter', 'github', 'discord'],
      priorityChains: ['ethereum', 'bsc', 'polygon', 'avalanche', 'ronin'],
      minDataQuality: 'medium',
      enableValidation: true, // NEW: Enable validation by default
      pauseOnValidationIssues: true, // NEW: Pause on issues by default
      minValidationScore: 0.7, // NEW: Require 70% validation score
      ...config
    };

    this.stats = {
      totalProjects: 0,
      successfulProjects: 0,
      failedProjects: 0,
      averageDataPoints: 0,
      averageConfidence: 0,
      totalUrls: 0,
      totalContracts: 0,
      startTime: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      projectsPerHour: 0
    };
  }

  // Start the automated discovery process
  async startDiscovery(): Promise<void> {
    if (this.isRunning) {
      console.log('🔄 Batch discovery already running');
      return;
    }

    console.log('🚀 Starting automated batch project discovery...');
    this.isRunning = true;
    this.stats.startTime = new Date().toISOString();

    // Initialize discovery queue with trending projects
    await this.initializeDiscoveryQueue();

    // Start the main discovery loop
    this.runDiscoveryLoop();
  }

  // Stop the discovery process
  stopDiscovery(): void {
    console.log('⏹️ Stopping batch discovery...');
    this.isRunning = false;
  }

  // Get current discovery statistics
  getStats(): BatchDiscoveryStats {
    return { ...this.stats };
  }

  // Get current configuration
  getConfig(): BatchDiscoveryConfig {
    return { ...this.config };
  }

  // Update configuration
  updateConfig(newConfig: Partial<BatchDiscoveryConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuration updated:', this.config);
  }

  // Add specific projects to the discovery queue
  addProjectsToQueue(projectNames: string[]): void {
    const newProjects = projectNames.filter(name => !this.processedProjects.has(name));
    this.discoveryQueue.push(...newProjects);
    console.log(`📝 Added ${newProjects.length} new projects to discovery queue`);
  }

  // Initialize discovery queue with trending projects
  private async initializeDiscoveryQueue(): Promise<void> {
    console.log('🔍 Initializing discovery queue with trending projects...');
    
    // Add some known popular projects to start with
    const initialProjects = [
      'Axie Infinity', 'Decentraland', 'The Sandbox', 'Gala Games', 'Illuvium',
      'Big Time', 'Gods Unchained', 'Splinterlands', 'Alien Worlds', 'Upland',
      'Zerebro', 'Wagmi Defense', 'Avalanche', 'Polygon', 'Binance Smart Chain'
    ];

    this.discoveryQueue.push(...initialProjects);
    console.log(`📝 Discovery queue initialized with ${initialProjects.length} projects`);
  }



  // Process a batch of projects
  private async processBatch(): Promise<void> {
    const batchSize = Math.min(this.config.maxProjectsPerBatch, this.discoveryQueue.length);
    if (batchSize === 0) return;

    console.log(`📦 Processing batch of ${batchSize} projects...`);
    
    const batch = this.discoveryQueue.splice(0, batchSize);
    const results: ProjectDiscoveryResult[] = [];

    // Process projects concurrently (with limits)
    const chunks = this.chunkArray(batch, this.config.maxConcurrentProjects);
    
    for (const chunk of chunks) {
      const chunkPromises = chunk.map(projectName => this.processProject(projectName));
      const chunkResults = await Promise.allSettled(chunkPromises);
      
      // Process results
      chunkResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            projectName: chunk[index],
            success: false,
            dataPoints: 0,
            confidence: 0,
            discoveredUrls: 0,
            contractAddresses: 0,
            dataQuality: 'low',
            errors: [result.reason?.message || 'Unknown error'],
            timestamp: new Date().toISOString()
          });
        }
      });

      // Update stats
      this.updateStats(results);
      
      // Small delay between chunks to avoid overwhelming APIs
      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await this.delay(2000);
      }
    }

    console.log(`✅ Batch completed: ${results.filter(r => r.success).length}/${results.length} successful`);
  }

  // Process a single project
  private async processProject(projectName: string): Promise<ProjectDiscoveryResult> {
    console.log(`🔍 Processing project: ${projectName}`);
    
    try {
      // Check if we already have good data
      if (projectDatabase.hasGoodReferenceData(projectName)) {
        console.log(`✅ ${projectName} already has good reference data, skipping`);
        return {
          projectName,
          success: true,
          dataPoints: 0,
          confidence: 1,
          discoveredUrls: 0,
          contractAddresses: 0,
          dataQuality: 'high',
          errors: [],
          timestamp: new Date().toISOString()
        };
      }

      // Run AI research
      const aiResult = await conductAIOrchestratedResearch(projectName, process.env.ANTHROPIC_API_KEY || '');
      
      if (aiResult.success) {
        // NEW: Run validation if enabled
        let validationResult = null;
        let validationScore = 1.0;
        
        if (this.config.enableValidation) {
          console.log(`🔍 VALIDATION: Running validation for ${projectName}...`);
          
          try {
            // Test real data availability
            const realDataTest = await testRealDataAvailability(projectName);
            
            // Compare our findings with reality
            validationResult = await compareFindingsWithReality(aiResult, realDataTest);
            
            // Calculate validation score based on gaps and recommendations
            const totalSources = Object.keys(aiResult.findings || {}).length;
            const missingSources = validationResult.gaps?.length || 0;
            validationScore = totalSources > 0 ? Math.max(0, (totalSources - missingSources) / totalSources) : 1.0;
            
            console.log(`🔍 VALIDATION: ${projectName} score: ${(validationScore * 100).toFixed(1)}% (${missingSources} missing sources)`);
            
            // Check if we should pause due to validation issues
            if (this.config.pauseOnValidationIssues && validationScore < this.config.minValidationScore) {
              console.log(`⚠️ VALIDATION: ${projectName} has low score (${(validationScore * 100).toFixed(1)}%), pausing for review...`);
              
              // Add to validation queue for manual review
              this.addToValidationQueue(projectName, aiResult, validationResult, validationScore);
              
              // Pause the discovery process
              this.pauseForValidation();
              
              return {
                projectName,
                success: false,
                dataPoints: aiResult.totalDataPoints || 0,
                confidence: aiResult.confidence || 0,
                discoveredUrls: Object.keys(aiResult.findings || {}).length,
                contractAddresses: this.countContractAddresses(aiResult),
                dataQuality: 'low',
                errors: [`Validation failed: Score ${(validationScore * 100).toFixed(1)}% below threshold ${(this.config.minValidationScore * 100).toFixed(1)}%`],
                timestamp: new Date().toISOString()
              };
            }
            
          } catch (validationError) {
            console.error(`❌ VALIDATION: Error validating ${projectName}:`, validationError);
            validationResult = { error: 'Validation failed', details: validationError };
          }
        }
        
        // Extract discovered URLs for database storage
        const discoveredUrls = this.extractDiscoveredUrls(aiResult);
        
        // Store in database with validation results
        await projectDatabase.addProjectReference(projectName, aiResult, discoveredUrls);
        
        // Mark as processed
        this.processedProjects.add(projectName);
        
        const result: ProjectDiscoveryResult = {
          projectName,
          success: true,
          dataPoints: aiResult.totalDataPoints || 0,
          confidence: aiResult.confidence || 0,
          discoveredUrls: Object.keys(discoveredUrls).length,
          contractAddresses: this.countContractAddresses(aiResult),
          dataQuality: this.assessDataQuality(aiResult),
          errors: [],
          timestamp: new Date().toISOString()
        };

        console.log(`✅ ${projectName} processed successfully: ${result.dataPoints} data points, ${result.discoveredUrls} URLs`);
        
        // Log validation summary
        if (validationResult) {
          console.log(`🔍 VALIDATION: ${projectName} validation complete - Score: ${(validationScore * 100).toFixed(1)}%`);
        }
        
        return result;

      } else {
        console.log(`❌ AI research failed for ${projectName}: ${aiResult.reason}`);
        return {
          projectName,
          success: false,
          dataPoints: 0,
          confidence: 0,
          discoveredUrls: 0,
          contractAddresses: 0,
          dataQuality: 'low',
          errors: [aiResult.reason || 'AI research failed'],
          timestamp: new Date().toISOString()
        };
      }

    } catch (error) {
      console.error(`❌ Error processing ${projectName}:`, error);
      return {
        projectName,
        success: false,
        dataPoints: 0,
        confidence: 0,
        discoveredUrls: 0,
        contractAddresses: 0,
        dataQuality: 'low',
        errors: [error instanceof Error ? error.message : String(error)],
        timestamp: new Date().toISOString()
      };
    }
  }

  // Extract discovered URLs from AI research results
  private extractDiscoveredUrls(aiResult: any): { [key: string]: string } {
    const urls: { [key: string]: string } = {};
    
    // Extract URLs from findings if available
    if (aiResult.findings) {
      Object.entries(aiResult.findings).forEach(([source, finding]: [string, any]) => {
        if (finding && finding.found && finding.data) {
          // Try to extract URL from the finding data
          if (finding.data.url) {
            urls[source] = finding.data.url;
          } else if (finding.data.website) {
            urls[source] = finding.data.website;
          } else if (finding.data.source) {
            urls[source] = finding.data.source;
          }
        }
      });
    }
    
    // Also check if there are any direct discoveredUrls (for backward compatibility)
    if (aiResult.discoveredUrls) {
      Object.entries(aiResult.discoveredUrls).forEach(([source, url]) => {
        if (url && typeof url === 'string') {
          urls[source] = url;
        }
      });
    }

    return urls;
  }

  // Count contract addresses found
  private countContractAddresses(aiResult: any): number {
    let count = 0;
    
    if (aiResult.collectedData?.financial_data?.etherscanData?.address) count++;
    if (aiResult.collectedData?.financial_data?.bscData?.address) count++;
    if (aiResult.collectedData?.financial_data?.polygonData?.address) count++;
    if (aiResult.collectedData?.financial_data?.avalancheData?.address) count++;
    
    return count;
  }

  // Assess overall data quality
  private assessDataQuality(aiResult: any): 'low' | 'medium' | 'high' {
    const dataPoints = aiResult.totalDataPoints || 0;
    const confidence = aiResult.confidence || 0;
    const sources = aiResult.successfulSources || 0;

    if (dataPoints >= 20 && confidence >= 0.8 && sources >= 5) return 'high';
    if (dataPoints >= 10 && confidence >= 0.6 && sources >= 3) return 'medium';
    return 'low';
  }

  // Update discovery statistics
  private updateStats(results: ProjectDiscoveryResult[]): void {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    this.stats.totalProjects += results.length;
    this.stats.successfulProjects += successful.length;
    this.stats.failedProjects += failed.length;

    if (successful.length > 0) {
      this.stats.averageDataPoints = successful.reduce((sum, r) => sum + r.dataPoints, 0) / successful.length;
      this.stats.averageConfidence = successful.reduce((sum, r) => sum + r.confidence, 0) / successful.length;
      this.stats.totalUrls += successful.reduce((sum, r) => sum + r.discoveredUrls, 0);
      this.stats.totalContracts += successful.reduce((sum, r) => sum + r.contractAddresses, 0);
    }

    this.stats.lastUpdate = new Date().toISOString();
    
    // Calculate projects per hour
    const startTime = new Date(this.stats.startTime).getTime();
    const currentTime = Date.now();
    const hoursElapsed = (currentTime - startTime) / (1000 * 60 * 60);
    this.stats.projectsPerHour = hoursElapsed > 0 ? this.stats.totalProjects / hoursElapsed : 0;
  }

  // Utility: Split array into chunks
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // Utility: Delay function
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get current queue status
  getQueueStatus(): { queueLength: number; processedCount: number; isRunning: boolean } {
    return {
      queueLength: this.discoveryQueue.length,
      processedCount: this.processedProjects.size,
      isRunning: this.isRunning
    };
  }

  // Clear processed projects (useful for testing)
  clearProcessedProjects(): void {
    this.processedProjects.clear();
    console.log('🧹 Cleared processed projects list');
  }

  // Add trending projects from external sources
  async addTrendingProjects(): Promise<void> {
    console.log('📈 Adding trending projects to discovery queue...');
    
    // This would integrate with external APIs to find trending projects
    // For now, we'll add some manually curated projects
    
    const trendingProjects = [
      'Stepn', 'Alien Worlds', 'Illuvium', 'Big Time', 'Gods Unchained',
      'Splinterlands', 'Upland', 'The Sandbox', 'Gala Games', 'Axie Infinity'
    ];

    this.addProjectsToQueue(trendingProjects);
  }

  // NEW: Validation Queue Management Methods
  
  // Add project to validation queue
  private addToValidationQueue(projectName: string, aiResult: any, validationResult: any, validationScore: number): void {
    this.validationQueue.push({
      projectName,
      aiResult,
      validationResult,
      validationScore,
      timestamp: new Date().toISOString()
    });
    
    console.log(`📋 VALIDATION: Added ${projectName} to validation queue (${this.validationQueue.length} items)`);
  }

  // Get validation queue status
  getValidationQueueStatus(): {
    queueLength: number;
    isPaused: boolean;
    items: Array<{
      projectName: string;
      validationScore: number;
      timestamp: string;
    }>;
  } {
    return {
      queueLength: this.validationQueue.length,
      isPaused: this.isPausedForValidation,
      items: this.validationQueue.map(item => ({
        projectName: item.projectName,
        validationScore: item.validationScore,
        timestamp: item.timestamp
      }))
    };
  }

  // Pause discovery for validation review
  private pauseForValidation(): void {
    this.isPausedForValidation = true;
    console.log(`⏸️ VALIDATION: Discovery paused for validation review. ${this.validationQueue.length} projects need attention.`);
  }

  // Resume discovery after validation review
  resumeFromValidation(): void {
    this.isPausedForValidation = false;
    console.log(`▶️ VALIDATION: Discovery resumed from validation review.`);
  }

  // Remove project from validation queue (after manual review)
  removeFromValidationQueue(projectName: string): boolean {
    const index = this.validationQueue.findIndex(item => item.projectName === projectName);
    if (index !== -1) {
      this.validationQueue.splice(index, 1);
      console.log(`✅ VALIDATION: Removed ${projectName} from validation queue`);
      
      // If validation queue is empty, resume discovery
      if (this.validationQueue.length === 0 && this.isPausedForValidation) {
        this.resumeFromValidation();
      }
      
      return true;
    }
    return false;
  }

  // Get detailed validation item for review
  getValidationItem(projectName: string): any {
    return this.validationQueue.find(item => item.projectName === projectName) || null;
  }

  // Update discovery loop to respect validation pause
  private async runDiscoveryLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        // Check if paused for validation
        if (this.isPausedForValidation) {
          console.log(`⏸️ VALIDATION: Discovery paused, waiting for validation review...`);
          await this.delay(30000); // Wait 30 seconds before checking again
          continue;
        }

        // Process projects in batches
        await this.processBatch();
        
        // Add delay between batches
        if (this.isRunning) {
          console.log(`⏳ Waiting ${this.config.delayBetweenProjects / 1000}s before next batch...`);
          await this.delay(this.config.delayBetweenProjects);
        }

        // Auto-restart if enabled and queue is empty
        if (this.config.autoRestart && this.discoveryQueue.length === 0) {
          console.log('🔄 Discovery queue empty, restarting with new projects...');
          await this.initializeDiscoveryQueue();
        }

      } catch (error) {
        console.error('❌ Error in discovery loop:', error);
        if (this.isRunning) {
          await this.delay(10000); // Wait 10 seconds before retrying
        }
      }
    }
  }
}

// Export singleton instance
export const batchDiscovery = new BatchProjectDiscovery();
