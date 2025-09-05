// Project Database System
// Stores only reference data (URLs, addresses, aliases) - research data remains dynamic

export interface ProjectReference {
  projectName: string;
  aliases: string[]; // Alternative names, tickers, etc.
  contractAddresses: {
    ethereum?: string;
    bsc?: string;
    polygon?: string;
    avalanche?: string;
    [chain: string]: string | undefined;
  };
  knownUrls: {
    official_website?: string;
    whitepaper?: string;
    github?: string;
    twitter?: string;
    discord?: string;
    telegram?: string;
    medium?: string;
    reddit?: string;
    [source: string]: string | undefined;
  };
  projectType: string;
  firstDiscovered: string;
  lastUpdated: string;
  searchCount: number;
  dataQuality: 'high' | 'medium' | 'low';
  tags: string[];
  notes: string[];
}

export interface DatabaseStats {
  totalProjects: number;
  totalContractAddresses: number;
  totalKnownUrls: number;
  averageUrlsPerProject: number;
  topSearchedProjects: Array<{
    projectName: string;
    searchCount: number;
    lastUpdated: string;
  }>;
  recentAdditions: Array<{
    projectName: string;
    addedDate: string;
    urlCount: number;
  }>;
}

export class ProjectDatabase {
  private projects: Map<string, ProjectReference> = new Map();
  private databasePath: string;

  constructor(databasePath: string = './project-database.json') {
    this.databasePath = databasePath;
    this.loadDatabase();
  }

  // Add or update project reference data
  async addProjectReference(
    projectName: string, 
    researchData: any,
    discoveredUrls: { [key: string]: string }
  ): Promise<void> {
    const existing = this.projects.get(projectName);
    const now = new Date().toISOString();
    
    // Extract contract addresses from research data
    const contractAddresses = this.extractContractAddresses(researchData);
    
    // Extract aliases from research data
    const aliases = this.extractAliases(researchData, projectName);
    
    // Merge discovered URLs with existing ones
    const mergedUrls = {
      ...existing?.knownUrls,
      ...discoveredUrls
    };

    const entry: ProjectReference = {
      projectName,
      aliases: Array.from(new Set([...(existing?.aliases || []), ...aliases])),
      contractAddresses: {
        ...existing?.contractAddresses,
        ...contractAddresses
      },
      knownUrls: mergedUrls,
      projectType: researchData.projectType || existing?.projectType || 'Unknown',
      firstDiscovered: existing?.firstDiscovered || now,
      lastUpdated: now,
      searchCount: (existing?.searchCount || 0) + 1,
      dataQuality: this.calculateReferenceQuality(mergedUrls as { [key: string]: string }, contractAddresses),
      tags: this.extractTags(researchData, existing?.tags || []),
      notes: existing?.notes || []
    };

    this.projects.set(projectName, entry);
    await this.saveDatabase();
    
    const urlCount = Object.values(mergedUrls).filter(url => !!url).length;
    console.log(`💾 DATABASE: Updated ${projectName} with ${urlCount} URLs and ${Object.keys(contractAddresses).length} contract addresses`);
  }

  // Check if we have good reference data for a project
  hasGoodReferenceData(projectName: string): boolean {
    const entry = this.projects.get(projectName);
    if (!entry) return false;
    
    // Consider reference data good if:
    // - Has multiple URLs (at least 3)
    // - Has contract addresses
    // - Recent update (<30 days old)
    const urlCount = Object.values(entry.knownUrls).filter(url => !!url).length;
    const hasContracts = Object.values(entry.contractAddresses).some(addr => !!addr);
    const daysSinceUpdate = (Date.now() - new Date(entry.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
    
    return urlCount >= 3 && hasContracts && daysSinceUpdate < 30;
  }

  // Get stored reference data for a project
  getProjectReference(projectName: string): ProjectReference | null {
    const entry = this.projects.get(projectName);
    if (!entry) return null;
    
    // Update search count
    entry.searchCount++;
    entry.lastUpdated = new Date().toISOString();
    
    return entry;
  }

  // Search projects by name, alias, or contract address
  searchProjects(query: string): ProjectReference[] {
    const projects = Array.from(this.projects.values());
    const lowerQuery = query.toLowerCase();
    
    return projects.filter(project => 
      // Match project name
      project.projectName.toLowerCase().includes(lowerQuery) ||
      // Match aliases
      project.aliases.some(alias => alias.toLowerCase().includes(lowerQuery)) ||
      // Match contract addresses
      Object.values(project.contractAddresses).some(addr => 
        addr && addr.toLowerCase().includes(lowerQuery)
      ) ||
      // Match tags
      project.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Get projects by contract address
  getProjectByContractAddress(address: string): ProjectReference | null {
    const projects = Array.from(this.projects.values());
    const lowerAddress = address.toLowerCase();
    
    return projects.find(project => 
      Object.values(project.contractAddresses).some(addr => 
        addr && addr.toLowerCase() === lowerAddress
      )
    ) || null;
  }

  // Get database statistics for frontend display
  getDatabaseStats(): DatabaseStats {
    const projects = Array.from(this.projects.values());
    const totalContractAddresses = projects.reduce((sum, p) => 
      sum + Object.values(p.contractAddresses).filter(addr => !!addr).length, 0
    );
    const totalKnownUrls = projects.reduce((sum, p) => 
      sum + Object.values(p.knownUrls).filter(url => !!url).length, 0
    );
    
    const topSearchedProjects = projects
      .sort((a, b) => b.searchCount - a.searchCount)
      .slice(0, 10)
      .map(p => ({
        projectName: p.projectName,
        searchCount: p.searchCount,
        lastUpdated: p.lastUpdated
      }));

    const recentAdditions = projects
      .sort((a, b) => new Date(b.firstDiscovered).getTime() - new Date(a.firstDiscovered).getTime())
      .slice(0, 10)
      .map(p => ({
        projectName: p.projectName,
        addedDate: p.firstDiscovered,
        urlCount: Object.values(p.knownUrls).filter(url => !!url).length
      }));

    return {
      totalProjects: projects.length,
      totalContractAddresses,
      totalKnownUrls,
      averageUrlsPerProject: projects.length > 0 ? totalKnownUrls / projects.length : 0,
      topSearchedProjects,
      recentAdditions
    };
  }

  // Add note to project
  addProjectNote(projectName: string, note: string): void {
    const entry = this.projects.get(projectName);
    if (entry) {
      entry.notes.push(`${new Date().toISOString()}: ${note}`);
      this.saveDatabase();
    }
  }

  // Update contract addresses
  updateContractAddresses(projectName: string, chain: string, address: string): void {
    const entry = this.projects.get(projectName);
    if (entry) {
      entry.contractAddresses[chain] = address;
      entry.lastUpdated = new Date().toISOString();
      this.saveDatabase();
    }
  }

  // Update known URLs
  updateKnownUrls(projectName: string, source: string, url: string): void {
    const entry = this.projects.get(projectName);
    if (entry) {
      entry.knownUrls[source] = url;
      entry.lastUpdated = new Date().toISOString();
      this.saveDatabase();
    }
  }

  // Private helper methods
  private extractContractAddresses(researchData: any): { [chain: string]: string } {
    const addresses: { [chain: string]: string } = {};
    
    // Extract from various sources
    if (researchData.collectedData?.financial_data?.etherscanData?.address) {
      addresses.ethereum = researchData.collectedData.financial_data.etherscanData.address;
    }
    
    // Add more chain extraction logic as needed
    return addresses;
  }

  private extractAliases(researchData: any, projectName: string): string[] {
    const aliases: string[] = [];
    
    // Extract from project type
    if (researchData.projectType && researchData.projectType !== 'Unknown') {
      aliases.push(researchData.projectType);
    }
    
    // Extract from discovered URLs (domain names)
    if (researchData.discoveredUrls) {
      Object.values(researchData.discoveredUrls).forEach((url: unknown) => {
        if (typeof url === 'string' && url.includes('://')) {
          const domain = new URL(url).hostname.replace('www.', '');
          if (domain !== projectName.toLowerCase()) {
            aliases.push(domain);
          }
        }
      });
    }
    
    return aliases;
  }

  private calculateReferenceQuality(urls: { [key: string]: string }, contracts: { [chain: string]: string }): 'high' | 'medium' | 'low' {
    const urlCount = Object.values(urls).filter(url => !!url).length;
    const contractCount = Object.values(contracts).filter(addr => !!addr).length;
    
    if (urlCount >= 5 && contractCount >= 2) return 'high';
    if (urlCount >= 3 && contractCount >= 1) return 'medium';
    return 'low';
  }

  private extractTags(researchData: any, existingTags: string[]): string[] {
    const tags: string[] = [...existingTags];
    
    // Extract tags from project type
    if (researchData.projectType) {
      tags.push(researchData.projectType);
    }
    
    // Extract tags from discovered URLs
    if (researchData.discoveredUrls) {
      Object.keys(researchData.discoveredUrls).forEach(source => {
        tags.push(source);
      });
    }
    
    return Array.from(new Set(tags)).slice(0, 15); // Remove duplicates, limit to 15
  }

  // Database persistence
  private async loadDatabase(): Promise<void> {
    try {
      const fs = require('fs').promises;
      const data = await fs.readFile(this.databasePath, 'utf8');
      const parsed = JSON.parse(data);
      
      // Convert array back to Map
      if (Array.isArray(parsed)) {
        parsed.forEach(entry => {
          this.projects.set(entry.projectName, entry);
        });
      }
      
      console.log(`💾 DATABASE: Loaded ${this.projects.size} projects from ${this.databasePath}`);
    } catch (error) {
      console.log(`💾 DATABASE: No existing database found, starting fresh`);
    }
  }

  private async saveDatabase(): Promise<void> {
    try {
      const fs = require('fs').promises;
      const data = Array.from(this.projects.values());
      await fs.writeFile(this.databasePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`❌ DATABASE: Failed to save database:`, error);
    }
  }
}

// Export singleton instance
export const projectDatabase = new ProjectDatabase();
