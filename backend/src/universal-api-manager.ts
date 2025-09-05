// Universal API Manager - Centralized API Rate Limiting and Coordination
// This system tracks all API usage, enforces rate limits, and provides intelligent coordination

interface APIConfig {
  name: string;
  baseUrl: string;
  rateLimit: {
    requests: number;
    window: number; // in milliseconds
    burst?: number; // optional burst limit
  };
  cost?: {
    perRequest: number; // in USD
    freeTier?: number; // free requests per day
  };
  priority: 'high' | 'medium' | 'low';
  fallbacks?: string[]; // fallback API names
  retryConfig?: {
    maxRetries: number;
    backoffMultiplier: number;
    baseDelay: number;
  };
  headers?: Record<string, string>;
  timeout?: number;
}

interface APIUsage {
  apiName: string;
  timestamp: number;
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  success: boolean;
  cost?: number;
  retryCount: number;
}

interface APILimits {
  apiName: string;
  currentUsage: number;
  limit: number;
  windowStart: number;
  windowEnd: number;
  remainingRequests: number;
  resetTime: number;
  isThrottled: boolean;
  lastRequestTime: number;
  averageResponseTime: number;
  successRate: number;
  totalCost: number;
}

interface APICoordinationPlan {
  primaryAPI: string;
  fallbackAPIs: string[];
  estimatedCost: number;
  estimatedTime: number;
  confidence: number;
}

export class UniversalAPIManager {
  private static instance: UniversalAPIManager;
  private apiConfigs: Map<string, APIConfig> = new Map();
  private usageHistory: APIUsage[] = [];
  private currentLimits: Map<string, APILimits> = new Map();
  private requestQueues: Map<string, Array<() => Promise<any>>> = new Map();
  private isProcessingQueues: Map<string, boolean> = new Map();

  // API Configuration Database
  private readonly API_CONFIGURATIONS: { [key: string]: APIConfig } = {
    // Blockchain APIs
    etherscan: {
      name: 'Etherscan',
      baseUrl: 'https://api.etherscan.io/api',
      rateLimit: { requests: 5, window: 1000 }, // 5 requests per second
      cost: { perRequest: 0.0001, freeTier: 100000 },
      priority: 'high',
      fallbacks: ['bscscan', 'polygonscan'],
      retryConfig: { maxRetries: 3, backoffMultiplier: 2, baseDelay: 1000 },
      timeout: 10000
    },
    
    bscscan: {
      name: 'BSCScan',
      baseUrl: 'https://api.bscscan.com/api',
      rateLimit: { requests: 5, window: 1000 },
      cost: { perRequest: 0.0001, freeTier: 100000 },
      priority: 'high',
      fallbacks: ['etherscan', 'polygonscan'],
      retryConfig: { maxRetries: 3, backoffMultiplier: 2, baseDelay: 1000 },
      timeout: 10000
    },
    
    polygonscan: {
      name: 'PolygonScan',
      baseUrl: 'https://api.polygonscan.com/api',
      rateLimit: { requests: 5, window: 1000 },
      cost: { perRequest: 0.0001, freeTier: 100000 },
      priority: 'high',
      fallbacks: ['etherscan', 'bscscan'],
      retryConfig: { maxRetries: 3, backoffMultiplier: 2, baseDelay: 1000 },
      timeout: 10000
    },
    
    snowtrace: {
      name: 'Snowtrace',
      baseUrl: 'https://api.snowtrace.io/api',
      rateLimit: { requests: 5, window: 1000 },
      cost: { perRequest: 0.0001, freeTier: 100000 },
      priority: 'medium',
      fallbacks: ['etherscan'],
      retryConfig: { maxRetries: 3, backoffMultiplier: 2, baseDelay: 1000 },
      timeout: 10000
    },

    // NFT APIs
    opensea: {
      name: 'OpenSea',
      baseUrl: 'https://api.opensea.io/api/v1',
      rateLimit: { requests: 1, window: 2000 }, // 1 request per 2 seconds
      cost: { perRequest: 0.001, freeTier: 1000 },
      priority: 'high',
      fallbacks: ['magiceden'],
      retryConfig: { maxRetries: 2, backoffMultiplier: 3, baseDelay: 2000 },
      timeout: 15000
    },
    
    magiceden: {
      name: 'Magic Eden',
      baseUrl: 'https://api-mainnet.magiceden.io/v2',
      rateLimit: { requests: 10, window: 1000 }, // 10 requests per second
      cost: { perRequest: 0.0005, freeTier: 5000 },
      priority: 'high',
      fallbacks: ['opensea'],
      retryConfig: { maxRetries: 3, backoffMultiplier: 2, baseDelay: 1000 },
      timeout: 10000
    },

    // Search APIs
    duckduckgo: {
      name: 'DuckDuckGo',
      baseUrl: 'https://api.duckduckgo.com',
      rateLimit: { requests: 20, window: 1000 }, // 20 requests per second
      cost: { perRequest: 0, freeTier: 1000000 },
      priority: 'high',
      fallbacks: ['searx', 'brave'],
      retryConfig: { maxRetries: 2, backoffMultiplier: 2, baseDelay: 500 },
      timeout: 5000
    },
    
    searx: {
      name: 'SearX',
      baseUrl: 'https://searx.be/search',
      rateLimit: { requests: 5, window: 1000 },
      cost: { perRequest: 0, freeTier: 1000000 },
      priority: 'medium',
      fallbacks: ['brave', 'duckduckgo'],
      retryConfig: { maxRetries: 2, backoffMultiplier: 2, baseDelay: 1000 },
      timeout: 5000
    },
    
    brave: {
      name: 'Brave Search',
      baseUrl: 'https://search.brave.com/search',
      rateLimit: { requests: 10, window: 1000 },
      cost: { perRequest: 0, freeTier: 1000000 },
      priority: 'medium',
      fallbacks: ['duckduckgo', 'searx'],
      retryConfig: { maxRetries: 2, backoffMultiplier: 2, baseDelay: 1000 },
      timeout: 5000
    },

    // Financial APIs
    coingecko: {
      name: 'CoinGecko',
      baseUrl: 'https://api.coingecko.com/api/v3',
      rateLimit: { requests: 50, window: 60000 }, // 50 requests per minute
      cost: { perRequest: 0, freeTier: 10000 },
      priority: 'high',
      fallbacks: ['coinmarketcap'],
      retryConfig: { maxRetries: 3, backoffMultiplier: 2, baseDelay: 2000 },
      timeout: 10000
    },
    
    coinmarketcap: {
      name: 'CoinMarketCap',
      baseUrl: 'https://pro-api.coinmarketcap.com/v1',
      rateLimit: { requests: 10, window: 60000 }, // 10 requests per minute
      cost: { perRequest: 0.001, freeTier: 1000 },
      priority: 'medium',
      fallbacks: ['coingecko'],
      retryConfig: { maxRetries: 3, backoffMultiplier: 2, baseDelay: 2000 },
      timeout: 10000
    },

    // Social Media APIs
    twitter: {
      name: 'Twitter API',
      baseUrl: 'https://api.twitter.com/2',
      rateLimit: { requests: 300, window: 900000 }, // 300 requests per 15 minutes
      cost: { perRequest: 0.01, freeTier: 100 },
      priority: 'medium',
      fallbacks: ['reddit'],
      retryConfig: { maxRetries: 2, backoffMultiplier: 3, baseDelay: 5000 },
      timeout: 15000
    },
    
    reddit: {
      name: 'Reddit API',
      baseUrl: 'https://oauth.reddit.com',
      rateLimit: { requests: 60, window: 60000 }, // 60 requests per minute
      cost: { perRequest: 0, freeTier: 1000000 },
      priority: 'medium',
      fallbacks: ['twitter'],
      retryConfig: { maxRetries: 3, backoffMultiplier: 2, baseDelay: 2000 },
      timeout: 10000
    },

    // AI APIs
    anthropic: {
      name: 'Anthropic Claude',
      baseUrl: 'https://api.anthropic.com/v1',
      rateLimit: { requests: 5, window: 60000 }, // 5 requests per minute
      cost: { perRequest: 0.01, freeTier: 0 },
      priority: 'high',
      fallbacks: [],
      retryConfig: { maxRetries: 2, backoffMultiplier: 3, baseDelay: 5000 },
      timeout: 30000
    },

    // Gaming APIs
    steam: {
      name: 'Steam API',
      baseUrl: 'https://api.steampowered.com',
      rateLimit: { requests: 10, window: 1000 },
      cost: { perRequest: 0, freeTier: 1000000 },
      priority: 'medium',
      fallbacks: ['steamcharts'],
      retryConfig: { maxRetries: 3, backoffMultiplier: 2, baseDelay: 1000 },
      timeout: 10000
    },
    
    steamcharts: {
      name: 'Steam Charts',
      baseUrl: 'https://steamcharts.com/api/v1',
      rateLimit: { requests: 5, window: 1000 },
      cost: { perRequest: 0, freeTier: 1000000 },
      priority: 'low',
      fallbacks: ['steam'],
      retryConfig: { maxRetries: 2, backoffMultiplier: 2, baseDelay: 2000 },
      timeout: 10000
    },

    // Development APIs
    github: {
      name: 'GitHub API',
      baseUrl: 'https://api.github.com',
      rateLimit: { requests: 60, window: 3600000 }, // 60 requests per hour (unauthenticated)
      cost: { perRequest: 0, freeTier: 5000 },
      priority: 'high',
      fallbacks: [],
      retryConfig: { maxRetries: 3, backoffMultiplier: 2, baseDelay: 2000 },
      timeout: 10000
    }
  };

  private constructor() {
    this.initializeAPIConfigs();
    this.startCleanupTimer();
  }

  static getInstance(): UniversalAPIManager {
    if (!UniversalAPIManager.instance) {
      UniversalAPIManager.instance = new UniversalAPIManager();
    }
    return UniversalAPIManager.instance;
  }

  private initializeAPIConfigs(): void {
    for (const [name, config] of Object.entries(this.API_CONFIGURATIONS)) {
      this.apiConfigs.set(name, config);
      this.currentLimits.set(name, {
        apiName: name,
        currentUsage: 0,
        limit: config.rateLimit.requests,
        windowStart: Date.now(),
        windowEnd: Date.now() + config.rateLimit.window,
        remainingRequests: config.rateLimit.requests,
        resetTime: Date.now() + config.rateLimit.window,
        isThrottled: false,
        lastRequestTime: 0,
        averageResponseTime: 0,
        successRate: 100,
        totalCost: 0
      });
    }
  }

  // Main API call method with automatic rate limiting and fallbacks
  async makeAPICall(
    apiName: string,
    endpoint: string,
    options: RequestInit = {},
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<Response> {
    const config = this.apiConfigs.get(apiName);
    if (!config) {
      throw new Error(`API configuration not found for: ${apiName}`);
    }

    // Check if we can make the request immediately
    if (this.canMakeRequest(apiName)) {
      return this.executeRequest(apiName, endpoint, options);
    }

    // Queue the request if we're rate limited
    return new Promise((resolve, reject) => {
      const queuedRequest = async () => {
        try {
          const response = await this.executeRequest(apiName, endpoint, options);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      };

      if (!this.requestQueues.has(apiName)) {
        this.requestQueues.set(apiName, []);
      }
      this.requestQueues.get(apiName)!.push(queuedRequest);

      // Process queue if not already processing
      if (!this.isProcessingQueues.get(apiName)) {
        this.processRequestQueue(apiName);
      }
    });
  }

  private canMakeRequest(apiName: string): boolean {
    const limits = this.currentLimits.get(apiName);
    if (!limits) return false;

    const now = Date.now();
    
    // Reset window if needed
    if (now >= limits.windowEnd) {
      this.resetAPILimits(apiName);
      return true;
    }

    // Check if we have remaining requests
    return limits.remainingRequests > 0 && !limits.isThrottled;
  }

  private async executeRequest(
    apiName: string,
    endpoint: string,
    options: RequestInit
  ): Promise<Response> {
    const config = this.apiConfigs.get(apiName)!;
    const limits = this.currentLimits.get(apiName)!;
    const startTime = Date.now();

    try {
      // Update usage tracking
      limits.currentUsage++;
      limits.remainingRequests--;
      limits.lastRequestTime = startTime;

      // Make the actual request
      const url = `${config.baseUrl}${endpoint}`;
      const requestOptions: RequestInit = {
        ...options,
        headers: {
          ...config.headers,
          ...options.headers
        },
        signal: AbortSignal.timeout(config.timeout || 10000)
      };

      const response = await fetch(url, requestOptions);
      const responseTime = Date.now() - startTime;

      // Record usage
      this.recordAPIUsage({
        apiName,
        timestamp: startTime,
        endpoint,
        method: options.method || 'GET',
        responseTime,
        statusCode: response.status,
        success: response.ok,
        cost: config.cost?.perRequest,
        retryCount: 0
      });

      // Update performance metrics
      this.updatePerformanceMetrics(apiName, responseTime, response.ok);

      // Handle rate limiting responses
      if (response.status === 429) {
        this.handleRateLimitExceeded(apiName);
        throw new Error(`Rate limit exceeded for ${apiName}`);
      }

      return response;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Record failed usage
      this.recordAPIUsage({
        apiName,
        timestamp: startTime,
        endpoint,
        method: options.method || 'GET',
        responseTime,
        statusCode: 0,
        success: false,
        cost: config.cost?.perRequest,
        retryCount: 0
      });

      // Update performance metrics
      this.updatePerformanceMetrics(apiName, responseTime, false);

      throw error;
    }
  }

  private handleRateLimitExceeded(apiName: string): void {
    const limits = this.currentLimits.get(apiName);
    if (limits) {
      limits.isThrottled = true;
      limits.remainingRequests = 0;
      
      // Set throttling duration based on API type
      const config = this.apiConfigs.get(apiName)!;
      const throttleDuration = config.rateLimit.window * 2; // Double the window
      
      setTimeout(() => {
        limits.isThrottled = false;
        this.resetAPILimits(apiName);
      }, throttleDuration);
    }
  }

  private resetAPILimits(apiName: string): void {
    const limits = this.currentLimits.get(apiName);
    const config = this.apiConfigs.get(apiName);
    
    if (limits && config) {
      const now = Date.now();
      limits.currentUsage = 0;
      limits.remainingRequests = config.rateLimit.requests;
      limits.windowStart = now;
      limits.windowEnd = now + config.rateLimit.window;
      limits.resetTime = limits.windowEnd;
      limits.isThrottled = false;
    }
  }

  private updatePerformanceMetrics(apiName: string, responseTime: number, success: boolean): void {
    const limits = this.currentLimits.get(apiName);
    if (!limits) return;

    // Update average response time (exponential moving average)
    const alpha = 0.1; // Smoothing factor
    limits.averageResponseTime = limits.averageResponseTime === 0 
      ? responseTime 
      : (alpha * responseTime) + ((1 - alpha) * limits.averageResponseTime);

    // Update success rate (exponential moving average)
    const successValue = success ? 100 : 0;
    limits.successRate = limits.successRate === 100 && limits.currentUsage === 1
      ? successValue
      : (alpha * successValue) + ((1 - alpha) * limits.successRate);

    // Update total cost
    const config = this.apiConfigs.get(apiName);
    if (config?.cost?.perRequest) {
      limits.totalCost += config.cost.perRequest;
    }
  }

  private recordAPIUsage(usage: APIUsage): void {
    this.usageHistory.push(usage);
    
    // Keep only last 10000 usage records to prevent memory issues
    if (this.usageHistory.length > 10000) {
      this.usageHistory = this.usageHistory.slice(-5000);
    }
  }

  private async processRequestQueue(apiName: string): Promise<void> {
    this.isProcessingQueues.set(apiName, true);
    
    const queue = this.requestQueues.get(apiName);
    if (!queue || queue.length === 0) {
      this.isProcessingQueues.set(apiName, false);
      return;
    }

    while (queue.length > 0) {
      if (this.canMakeRequest(apiName)) {
        const request = queue.shift()!;
        try {
          await request();
        } catch (error) {
          console.error(`Queued request failed for ${apiName}:`, error);
        }
      } else {
        // Wait for rate limit window to reset
        const limits = this.currentLimits.get(apiName);
        if (limits) {
          const waitTime = limits.resetTime - Date.now();
          if (waitTime > 0) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }
    }

    this.isProcessingQueues.set(apiName, false);
  }

  // Intelligent API coordination - choose best API for a task
  getOptimalAPICoordination(
    taskType: 'blockchain' | 'nft' | 'search' | 'financial' | 'social' | 'ai' | 'gaming' | 'development',
    requirements: {
      maxCost?: number;
      maxLatency?: number;
      minSuccessRate?: number;
      priority?: 'high' | 'medium' | 'low';
    } = {}
  ): APICoordinationPlan {
    const availableAPIs = this.getAPIsForTaskType(taskType);
    const { maxCost = 1.0, maxLatency = 10000, minSuccessRate = 80, priority = 'medium' } = requirements;

    // Score each API based on requirements
    const scoredAPIs = availableAPIs.map(apiName => {
      const config = this.apiConfigs.get(apiName)!;
      const limits = this.currentLimits.get(apiName)!;
      
      let score = 0;
      
      // Cost score (lower is better)
      const costScore = config.cost?.perRequest ? (1 - (config.cost.perRequest / 0.01)) * 30 : 30;
      score += costScore;
      
      // Latency score (lower is better)
      const latencyScore = limits.averageResponseTime > 0 
        ? Math.max(0, (maxLatency - limits.averageResponseTime) / maxLatency) * 25
        : 25;
      score += latencyScore;
      
      // Success rate score
      const successScore = (limits.successRate / 100) * 25;
      score += successScore;
      
      // Availability score (remaining requests)
      const availabilityScore = (limits.remainingRequests / limits.limit) * 20;
      score += availabilityScore;
      
      // Priority bonus
      if (config.priority === priority) score += 10;
      else if (config.priority === 'high') score += 5;
      
      return { apiName, score, config, limits };
    });

    // Sort by score (highest first)
    scoredAPIs.sort((a, b) => b.score - a.score);

    // Filter by requirements
    const validAPIs = scoredAPIs.filter(api => 
      (!api.config.cost?.perRequest || api.config.cost.perRequest <= maxCost) &&
      (api.limits.averageResponseTime === 0 || api.limits.averageResponseTime <= maxLatency) &&
      api.limits.successRate >= minSuccessRate &&
      !api.limits.isThrottled
    );

    if (validAPIs.length === 0) {
      // Fallback to best available API even if it doesn't meet all requirements
      const fallbackAPI = scoredAPIs[0];
      return {
        primaryAPI: fallbackAPI.apiName,
        fallbackAPIs: fallbackAPI.config.fallbacks || [],
        estimatedCost: fallbackAPI.config.cost?.perRequest || 0,
        estimatedTime: fallbackAPI.limits.averageResponseTime || 5000,
        confidence: Math.max(0.3, fallbackAPI.score / 100)
      };
    }

    const primaryAPI = validAPIs[0];
    return {
      primaryAPI: primaryAPI.apiName,
      fallbackAPIs: primaryAPI.config.fallbacks || [],
      estimatedCost: primaryAPI.config.cost?.perRequest || 0,
      estimatedTime: primaryAPI.limits.averageResponseTime || 5000,
      confidence: primaryAPI.score / 100
    };
  }

  private getAPIsForTaskType(taskType: string): string[] {
    const taskAPIMap: { [key: string]: string[] } = {
      blockchain: ['etherscan', 'bscscan', 'polygonscan', 'snowtrace'],
      nft: ['opensea', 'magiceden'],
      search: ['duckduckgo', 'searx', 'brave'],
      financial: ['coingecko', 'coinmarketcap'],
      social: ['twitter', 'reddit'],
      ai: ['anthropic'],
      gaming: ['steam', 'steamcharts'],
      development: ['github']
    };

    return taskAPIMap[taskType] || [];
  }

  // Get comprehensive API status and statistics
  getAPIStatus(): {
    apis: APILimits[];
    totalUsage: number;
    totalCost: number;
    averageResponseTime: number;
    overallSuccessRate: number;
    throttledAPIs: string[];
    recommendations: string[];
  } {
    const apis = Array.from(this.currentLimits.values());
    const totalUsage = apis.reduce((sum, api) => sum + api.currentUsage, 0);
    const totalCost = apis.reduce((sum, api) => sum + api.totalCost, 0);
    const averageResponseTime = apis.reduce((sum, api) => sum + api.averageResponseTime, 0) / apis.length;
    const overallSuccessRate = apis.reduce((sum, api) => sum + api.successRate, 0) / apis.length;
    const throttledAPIs = apis.filter(api => api.isThrottled).map(api => api.apiName);

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (overallSuccessRate < 90) {
      recommendations.push('Overall success rate is below 90%. Consider implementing better error handling and retry logic.');
    }
    
    if (averageResponseTime > 5000) {
      recommendations.push('Average response time is high. Consider using faster APIs or implementing caching.');
    }
    
    if (throttledAPIs.length > 0) {
      recommendations.push(`APIs currently throttled: ${throttledAPIs.join(', ')}. Consider using fallback APIs.`);
    }
    
    if (totalCost > 10) {
      recommendations.push('Daily API costs are high. Consider optimizing API usage or switching to free alternatives.');
    }

    return {
      apis,
      totalUsage,
      totalCost,
      averageResponseTime,
      overallSuccessRate,
      throttledAPIs,
      recommendations
    };
  }

  // Get usage statistics for a specific time period
  getUsageStatistics(
    apiName?: string,
    startTime?: number,
    endTime?: number
  ): {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    totalCost: number;
    requestsByAPI: { [apiName: string]: number };
    requestsByHour: { [hour: string]: number };
  } {
    const now = Date.now();
    const start = startTime || (now - 24 * 60 * 60 * 1000); // Default: last 24 hours
    const end = endTime || now;

    let filteredUsage = this.usageHistory.filter(usage => 
      usage.timestamp >= start && usage.timestamp <= end
    );

    if (apiName) {
      filteredUsage = filteredUsage.filter(usage => usage.apiName === apiName);
    }

    const totalRequests = filteredUsage.length;
    const successfulRequests = filteredUsage.filter(usage => usage.success).length;
    const failedRequests = totalRequests - successfulRequests;
    const averageResponseTime = filteredUsage.reduce((sum, usage) => sum + usage.responseTime, 0) / totalRequests;
    const totalCost = filteredUsage.reduce((sum, usage) => sum + (usage.cost || 0), 0);

    // Group by API
    const requestsByAPI: { [apiName: string]: number } = {};
    filteredUsage.forEach(usage => {
      requestsByAPI[usage.apiName] = (requestsByAPI[usage.apiName] || 0) + 1;
    });

    // Group by hour
    const requestsByHour: { [hour: string]: number } = {};
    filteredUsage.forEach(usage => {
      const hour = new Date(usage.timestamp).toISOString().substring(0, 13);
      requestsByHour[hour] = (requestsByHour[hour] || 0) + 1;
    });

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      totalCost,
      requestsByAPI,
      requestsByHour
    };
  }

  // Cleanup old usage data
  private startCleanupTimer(): void {
    setInterval(() => {
      const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // Keep 7 days
      this.usageHistory = this.usageHistory.filter(usage => usage.timestamp > cutoffTime);
    }, 60 * 60 * 1000); // Run every hour
  }

  // Emergency API reset (for testing or recovery)
  resetAPI(apiName: string): void {
    this.resetAPILimits(apiName);
    if (this.requestQueues.has(apiName)) {
      this.requestQueues.get(apiName)!.length = 0;
    }
    this.isProcessingQueues.set(apiName, false);
  }

  // Get API configuration
  getAPIConfig(apiName: string): APIConfig | undefined {
    return this.apiConfigs.get(apiName);
  }

  // Update API configuration (for dynamic rate limit adjustments)
  updateAPIConfig(apiName: string, updates: Partial<APIConfig>): void {
    const config = this.apiConfigs.get(apiName);
    if (config) {
      Object.assign(config, updates);
      this.apiConfigs.set(apiName, config);
    }
  }
}

// Export singleton instance
export const universalAPIManager = UniversalAPIManager.getInstance();
