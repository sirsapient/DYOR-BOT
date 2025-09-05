// Intelligent Alias Discovery System
// This system uses AI to analyze project websites and discover actual aliases, token names, and NFT collection names

import Anthropic from '@anthropic-ai/sdk';
import { freeSearchService } from './search-service';

interface AliasDiscoveryResult {
  projectAliases: string[];
  tokenNames: string[];
  nftCollections: string[];
  websiteContent: string;
  confidence: number;
  reasoning: string;
}

export class IntelligentAliasDiscovery {
  private anthropic: Anthropic;

  constructor(anthropicApiKey: string) {
    this.anthropic = new Anthropic({
      apiKey: anthropicApiKey,
    });
  }

  async discoverAliases(projectName: string): Promise<AliasDiscoveryResult> {
    console.log(`🧠 Starting intelligent alias discovery for: ${projectName}`);
    
    try {
      // Step 1: Find the project's official website
      const websiteUrl = await this.findOfficialWebsite(projectName);
      
      if (!websiteUrl) {
        console.log(`❌ No official website found for ${projectName}`);
        return this.getFallbackResult(projectName);
      }

      console.log(`🌐 Found official website: ${websiteUrl}`);

      // Step 2: Scrape and analyze website content
      const websiteContent = await this.scrapeWebsiteContent(websiteUrl);
      
      if (!websiteContent) {
        console.log(`❌ Failed to scrape website content`);
        return this.getFallbackResult(projectName);
      }

      console.log(`📄 Scraped ${websiteContent.length} characters of website content`);

      // Step 3: Use AI to analyze content and discover aliases
      const aiAnalysis = await this.analyzeContentWithAI(projectName, websiteContent, websiteUrl);
      
      console.log(`✅ AI analysis completed with confidence: ${aiAnalysis.confidence}`);
      
      return {
        projectAliases: aiAnalysis.projectAliases,
        tokenNames: aiAnalysis.tokenNames,
        nftCollections: aiAnalysis.nftCollections,
        websiteContent: websiteContent.substring(0, 1000), // Truncate for storage
        confidence: aiAnalysis.confidence,
        reasoning: aiAnalysis.reasoning
      };

    } catch (error) {
      console.error(`❌ Error in alias discovery:`, error);
      return this.getFallbackResult(projectName);
    }
  }

  private async findOfficialWebsite(projectName: string): Promise<string | null> {
    console.log(`🔍 Searching for official website of ${projectName}`);
    
    const searchTerms = [
      `${projectName} official website`,
      `${projectName} homepage`,
      `${projectName} main site`,
      `site:${projectName.toLowerCase().replace(/\s+/g, '')}.com`,
      `site:${projectName.toLowerCase().replace(/\s+/g, '')}.io`
    ];

    for (const term of searchTerms) {
      try {
        const results = await freeSearchService.search(term, 3);
        
        for (const result of results) {
          if (result.link && this.isLikelyOfficialWebsite(result.link, projectName)) {
            console.log(`✅ Found likely official website: ${result.link}`);
            return result.link;
          }
        }
      } catch (error) {
        console.log(`❌ Search failed for term: ${term}`);
      }
    }

    return null;
  }

  private isLikelyOfficialWebsite(url: string, projectName: string): boolean {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      const projectLower = projectName.toLowerCase().replace(/\s+/g, '');
      
      // Check if domain contains project name
      if (domain.includes(projectLower)) {
        return true;
      }
      
      // Check for common official website patterns
      const officialPatterns = [
        'official',
        'main',
        'home',
        'www'
      ];
      
      return officialPatterns.some(pattern => domain.includes(pattern));
    } catch {
      return false;
    }
  }

  private async scrapeWebsiteContent(url: string): Promise<string | null> {
    try {
      console.log(`📄 Scraping website content from: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'DYOR-BOT/1.0 (Research Bot)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log(`❌ HTTP error: ${response.status}`);
        return null;
      }

      const html = await response.text();
      
      // Extract text content (basic HTML parsing)
      const textContent = this.extractTextFromHTML(html);
      
      return textContent;
    } catch (error) {
      console.log(`❌ Error scraping website:`, error);
      return null;
    }
  }

  private extractTextFromHTML(html: string): string {
    // Basic HTML text extraction
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Limit content length to avoid token limits
    if (text.length > 8000) {
      text = text.substring(0, 8000) + '...';
    }

    return text;
  }

  private async analyzeContentWithAI(projectName: string, content: string, websiteUrl: string): Promise<{
    projectAliases: string[];
    tokenNames: string[];
    nftCollections: string[];
    confidence: number;
    reasoning: string;
  }> {
    console.log(`🤖 Analyzing website content with AI...`);

    const prompt = `You are an expert at analyzing cryptocurrency and Web3 project websites to discover aliases, token names, and NFT collection names.

PROJECT: ${projectName}
WEBSITE: ${websiteUrl}

WEBSITE CONTENT:
${content}

Please analyze this website content and extract:

1. PROJECT ALIASES: Alternative names, abbreviations, or variations of the project name mentioned on the website
2. TOKEN NAMES: Any cryptocurrency token names, symbols, or tickers mentioned
3. NFT COLLECTIONS: Any NFT collection names, character names, or asset names mentioned

IMPORTANT:
- Look for names that might be used on NFT marketplaces (like "Heroes of Elumia" for a project called "Elumia")
- Include character names, game asset names, or collection names
- Look for token symbols and full token names
- Be thorough - these names might be used in different contexts (websites, marketplaces, social media)

Respond in JSON format:
{
  "projectAliases": ["alias1", "alias2"],
  "tokenNames": ["TOKEN", "Full Token Name"],
  "nftCollections": ["Collection Name", "Character Name"],
  "confidence": 0.85,
  "reasoning": "Explanation of findings"
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: prompt
        }]
      });

      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
      
      // Parse JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const result = JSON.parse(jsonMatch[0]);
      
      return {
        projectAliases: result.projectAliases || [],
        tokenNames: result.tokenNames || [],
        nftCollections: result.nftCollections || [],
        confidence: result.confidence || 0.5,
        reasoning: result.reasoning || 'AI analysis completed'
      };

    } catch (error) {
      console.error(`❌ AI analysis failed:`, error);
      return {
        projectAliases: [],
        tokenNames: [],
        nftCollections: [],
        confidence: 0.1,
        reasoning: 'AI analysis failed'
      };
    }
  }

  private getFallbackResult(projectName: string): AliasDiscoveryResult {
    return {
      projectAliases: [projectName],
      tokenNames: [],
      nftCollections: [],
      websiteContent: '',
      confidence: 0.1,
      reasoning: 'Fallback result - no website found or analysis failed'
    };
  }
}

// Export a singleton instance
export const intelligentAliasDiscovery = new IntelligentAliasDiscovery(
  process.env.ANTHROPIC_API_KEY || ''
);
