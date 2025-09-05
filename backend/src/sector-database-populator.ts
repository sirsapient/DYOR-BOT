import { projectDatabase } from './project-database';

// Web3 Sector Definitions with Top Projects
export interface SectorDefinition {
  name: string;
  description: string;
  topProjects: string[];
  searchTerms: string[];
  dataPriorities: string[];
}

export const WEB3_SECTORS: SectorDefinition[] = [
  {
    name: 'Web3 Games',
    description: 'Gaming projects with blockchain integration, play-to-earn mechanics, and NFT assets',
    topProjects: [
      'Axie Infinity',
      'The Sandbox',
      'Decentraland',
      'Gala Games',
      'Illuvium',
      'Big Time',
      'Gods Unchained',
      'Splinterlands',
      'Alien Worlds',
      'Upland'
    ],
    searchTerms: ['web3 game', 'blockchain game', 'play to earn', 'NFT game', 'metaverse game'],
    dataPriorities: ['tokenomics', 'gameplay', 'community', 'market cap', 'team', 'partnerships']
  },
  {
    name: 'DeFi',
    description: 'Decentralized Finance protocols for lending, borrowing, trading, and yield farming',
    topProjects: [
      'Uniswap',
      'Aave',
      'Compound',
      'Curve Finance',
      'SushiSwap',
      'PancakeSwap',
      'MakerDAO',
      'Yearn Finance',
      'Balancer',
      '1inch'
    ],
    searchTerms: ['defi protocol', 'decentralized finance', 'yield farming', 'lending protocol', 'DEX'],
    dataPriorities: ['TVL', 'protocol revenue', 'tokenomics', 'security audits', 'governance', 'risk assessment']
  },
  {
    name: 'NFT',
    description: 'Non-Fungible Token projects, marketplaces, and collections',
    topProjects: [
      'OpenSea',
      'Bored Ape Yacht Club',
      'CryptoPunks',
      'Doodles',
      'Azuki',
      'CloneX',
      'Moonbirds',
      'Meebits',
      'Art Blocks',
      'Magic Eden'
    ],
    searchTerms: ['NFT collection', 'NFT marketplace', 'digital art', 'collectibles', 'generative art'],
    dataPriorities: ['floor price', 'volume', 'rarity', 'community', 'artists', 'utility']
  },
  {
    name: 'AI',
    description: 'Artificial Intelligence projects on blockchain, including AI agents and data marketplaces',
    topProjects: [
      'Fetch.ai',
      'SingularityNET',
      'Ocean Protocol',
      'Numerai',
      'Braintrust',
      'Injective Protocol',
      'Render Network',
      'Akash Network',
      'Golem Network',
      'iExec RLC'
    ],
    searchTerms: ['AI blockchain', 'machine learning', 'data marketplace', 'AI agents', 'decentralized AI'],
    dataPriorities: ['AI capabilities', 'data quality', 'use cases', 'team expertise', 'partnerships', 'adoption']
  },
  {
    name: 'Infrastructure',
    description: 'Blockchain infrastructure, Layer 2s, and development platforms',
    topProjects: [
      'Polygon',
      'Arbitrum',
      'Optimism',
      'StarkNet',
      'zkSync',
      'Base',
      'Scroll',
      'Mantle',
      'Linea',
      'Polygon zkEVM'
    ],
    searchTerms: ['layer 2', 'scaling solution', 'rollup', 'sidechain', 'blockchain infrastructure'],
    dataPriorities: ['TPS', 'fees', 'security', 'adoption', 'developer tools', 'ecosystem']
  },
  {
    name: 'DAO',
    description: 'Decentralized Autonomous Organizations and governance protocols',
    topProjects: [
      'Uniswap DAO',
      'MakerDAO',
      'Aragon',
      'Moloch DAO',
      'Compound DAO',
      'ENS DAO',
      'Gitcoin DAO',
      'Bankless DAO',
      'Friends with Benefits',
      'PleasrDAO'
    ],
    searchTerms: ['DAO', 'decentralized governance', 'governance token', 'voting protocol', 'community governance'],
    dataPriorities: ['governance structure', 'voting power', 'proposal activity', 'treasury', 'community engagement']
  },
  {
    name: 'MemeCoins',
    description: 'Community-driven token projects with viral marketing and social engagement',
    topProjects: [
      'Dogecoin',
      'Shiba Inu',
      'Pepe',
      'Floki Inu',
      'Bonk',
      'SafeMoon',
      'Baby Doge Coin',
      'Dogelon Mars',
      'Hoge Finance',
      'CateCoin'
    ],
    searchTerms: ['meme coin', 'community token', 'viral token', 'social token', 'trending coin'],
    dataPriorities: ['community size', 'social media presence', 'viral potential', 'utility', 'team transparency']
  },
  {
    name: 'Platforms',
    description: 'Multi-project platforms, aggregators, and ecosystem builders',
    topProjects: [
      'Binance Smart Chain',
      'Solana',
      'Avalanche',
      'Fantom',
      'Harmony',
      'Near Protocol',
      'Tezos',
      'Cardano',
      'Polkadot',
      'Cosmos'
    ],
    searchTerms: ['blockchain platform', 'ecosystem', 'smart contract platform', 'dApp platform', 'multi-chain'],
    dataPriorities: ['ecosystem size', 'developer activity', 'TVL', 'partnerships', 'governance', 'upgrades']
  }
];

export class SectorDatabasePopulator {
  private sectors: SectorDefinition[];
  private currentSectorIndex: number = 0;
  private currentProjectIndex: number = 0;
  private isRunning: boolean = false;
  private stats: {
    totalSectors: number;
    totalProjects: number;
    completedSectors: number;
    completedProjects: number;
    startTime: string;
    lastUpdate: string;
  };

  constructor() {
    this.sectors = WEB3_SECTORS;
    this.stats = {
      totalSectors: this.sectors.length,
      totalProjects: this.sectors.reduce((sum, sector) => sum + sector.topProjects.length, 0),
      completedSectors: 0,
      completedProjects: 0,
      startTime: '',
      lastUpdate: ''
    };
  }

  // Start the sector-based database population
  async startPopulation(): Promise<void> {
    if (this.isRunning) {
      console.log('🔄 Sector database population already running');
      return;
    }

    console.log('🚀 Starting sector-based database population...');
    console.log(`📊 Total: ${this.stats.totalSectors} sectors, ${this.stats.totalProjects} projects`);
    
    this.isRunning = true;
    this.stats.startTime = new Date().toISOString();
    this.currentSectorIndex = 0;
    this.currentProjectIndex = 0;

    await this.processNextSector();
  }

  // Stop the population process
  stopPopulation(): void {
    console.log('⏹️ Stopping sector database population...');
    this.isRunning = false;
  }

  // Get current statistics
  getStats() {
    return { ...this.stats };
  }

  // Get current progress
  getProgress() {
    if (this.stats.totalProjects === 0) return 0;
    return (this.stats.completedProjects / this.stats.totalProjects) * 100;
  }

  // Get current sector and project being processed
  getCurrentStatus() {
    if (this.currentSectorIndex >= this.sectors.length) {
      return { sector: 'Completed', project: 'All projects processed' };
    }

    const currentSector = this.sectors[this.currentSectorIndex];
    const currentProject = currentSector.topProjects[this.currentProjectIndex] || 'Sector completed';
    
    return {
      sector: currentSector.name,
      project: currentProject,
      sectorProgress: `${this.currentProjectIndex + 1}/${currentSector.topProjects.length}`,
      overallProgress: `${this.stats.completedProjects}/${this.stats.totalProjects}`
    };
  }

  // Process the next sector
  private async processNextSector(): Promise<void> {
    if (!this.isRunning || this.currentSectorIndex >= this.sectors.length) {
      this.isRunning = false;
      console.log('✅ Sector database population completed!');
      return;
    }

    const currentSector = this.sectors[this.currentSectorIndex];
    console.log(`\n🏭 Processing sector: ${currentSector.name}`);
    console.log(`📋 Projects in sector: ${currentSector.topProjects.length}`);
    console.log(`🎯 Data priorities: ${currentSector.dataPriorities.join(', ')}`);

    // Process all projects in this sector
    for (let i = 0; i < currentSector.topProjects.length; i++) {
      if (!this.isRunning) break;

      this.currentProjectIndex = i;
      const projectName = currentSector.topProjects[i];
      
      console.log(`\n🔍 Processing project ${i + 1}/${currentSector.topProjects.length}: ${projectName}`);
      
      try {
        // Add sector metadata to project reference
        const sectorMetadata = {
          sector: currentSector.name,
          sectorDescription: currentSector.description,
          searchTerms: currentSector.searchTerms,
          dataPriorities: currentSector.dataPriorities,
          sectorRank: i + 1
        };

        // Store in database with sector context
        await projectDatabase.addProjectReference(projectName, {
          sector: currentSector.name,
          sectorRank: i + 1,
          searchTerms: currentSector.searchTerms,
          dataPriorities: currentSector.dataPriorities,
          category: 'top_project',
          priority: 'high'
        }, {});

        this.stats.completedProjects++;
        console.log(`✅ ${projectName} added to database (${this.stats.completedProjects}/${this.stats.totalProjects})`);

        // Small delay between projects
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Error processing ${projectName}:`, error);
      }
    }

    // Sector completed
    this.stats.completedSectors++;
    this.currentSectorIndex++;
    this.currentProjectIndex = 0;

    console.log(`\n✅ Sector ${currentSector.name} completed!`);
    console.log(`📊 Progress: ${this.stats.completedSectors}/${this.stats.totalSectors} sectors, ${this.stats.completedProjects}/${this.stats.totalProjects} projects`);

    // Continue to next sector
    if (this.isRunning) {
      await this.processNextSector();
    }
  }

  // Get sector information
  getSectorInfo(sectorName: string): SectorDefinition | null {
    return this.sectors.find(s => s.name === sectorName) || null;
  }

  // Get all sectors
  getAllSectors(): SectorDefinition[] {
    return [...this.sectors];
  }

  // Get projects for a specific sector
  getSectorProjects(sectorName: string): string[] {
    const sector = this.getSectorInfo(sectorName);
    return sector ? [...sector.topProjects] : [];
  }

  // Add custom project to a sector
  addProjectToSector(sectorName: string, projectName: string, rank?: number): boolean {
    const sector = this.sectors.find(s => s.name === sectorName);
    if (!sector) return false;

    if (rank !== undefined && rank >= 0 && rank < sector.topProjects.length) {
      sector.topProjects.splice(rank, 0, projectName);
    } else {
      sector.topProjects.push(projectName);
    }

    // Update total count
    this.stats.totalProjects++;
    return true;
  }

  // Remove project from sector
  removeProjectFromSector(sectorName: string, projectName: string): boolean {
    const sector = this.sectors.find(s => s.name === sectorName);
    if (!sector) return false;

    const index = sector.topProjects.indexOf(projectName);
    if (index === -1) return false;

    sector.topProjects.splice(index, 1);
    this.stats.totalProjects--;
    return true;
  }
}

// Export singleton instance
export const sectorDatabasePopulator = new SectorDatabasePopulator();
