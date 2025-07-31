// Test Quality Gates Implementation
// Demonstrates how the quality gates work with different research scenarios

import { QualityGatesEngine, ProjectType } from './quality-gates';
import { ResearchFindings } from './research-scoring';

// Test scenarios
const testScenarios = [
  {
    name: 'High Quality Research - Should Pass',
    findings: {
      whitepaper: {
        found: true,
        data: {
          comprehensive: true,
          technical_details: true,
          tokenomics: true
        },
        quality: 'high',
        timestamp: new Date(),
        dataPoints: 25
      },
      onchain_data: {
        found: true,
        data: {
          contracts_verified: true,
          token_deployed: true,
          token_distribution: true
        },
        quality: 'high',
        timestamp: new Date(),
        dataPoints: 20
      },
      team_info: {
        found: true,
        data: {
          team_members: ['John Doe', 'Jane Smith'],
          has_experience: true,
          previous_projects: ['Project A', 'Project B'],
          anonymous: false
        },
        quality: 'high',
        timestamp: new Date(),
        dataPoints: 15
      },
      community_health: {
        found: true,
        data: {
          discord_members: 5000,
          twitter_followers: 10000,
          telegram_members: 2000,
          engagement_rate: 0.05
        },
        quality: 'high',
        timestamp: new Date(),
        dataPoints: 10
      },
      financial_data: {
        found: true,
        data: {
          market_cap: 1000000,
          funding_rounds: ['Series A'],
          revenue_model: 'freemium'
        },
        quality: 'high',
        timestamp: new Date(),
        dataPoints: 12
      },
      product_data: {
        found: true,
        data: {
          game_exists: true,
          product_live: true,
          steam_listed: true
        },
        quality: 'high',
        timestamp: new Date(),
        dataPoints: 8
      }
    } as ResearchFindings,
    projectType: {
      type: 'web3_game' as const,
      confidence: 0.9
    }
  },
  {
    name: 'Insufficient Data - Should Fail',
    findings: {
      whitepaper: {
        found: false,
        data: null,
        quality: 'low',
        timestamp: new Date(),
        dataPoints: 0
      },
      onchain_data: {
        found: false,
        data: null,
        quality: 'low',
        timestamp: new Date(),
        dataPoints: 0
      },
      team_info: {
        found: false,
        data: null,
        quality: 'low',
        timestamp: new Date(),
        dataPoints: 0
      },
      community_health: {
        found: true,
        data: {
          discord_members: 50,
          twitter_followers: 100,
          telegram_members: 25
        },
        quality: 'medium',
        timestamp: new Date(),
        dataPoints: 5
      }
    } as ResearchFindings,
    projectType: {
      type: 'unknown' as const,
      confidence: 0.3
    }
  },
  {
    name: 'Anonymous Team - Should Fail',
    findings: {
      whitepaper: {
        found: true,
        data: {
          comprehensive: true,
          technical_details: true
        },
        quality: 'high',
        timestamp: new Date(),
        dataPoints: 15
      },
      onchain_data: {
        found: true,
        data: {
          contracts_verified: true,
          token_deployed: true
        },
        quality: 'high',
        timestamp: new Date(),
        dataPoints: 12
      },
      team_info: {
        found: true,
        data: {
          team_members: [],
          anonymous: true,
          has_experience: false
        },
        quality: 'low',
        timestamp: new Date(),
        dataPoints: 3
      },
      community_health: {
        found: true,
        data: {
          discord_members: 1000,
          twitter_followers: 2000,
          engagement_rate: 0.02
        },
        quality: 'medium',
        timestamp: new Date(),
        dataPoints: 8
      }
    } as ResearchFindings,
    projectType: {
      type: 'web3_game' as const,
      confidence: 0.7
    }
  },
  {
    name: 'Red Flags Detected - Should Block',
    findings: {
      whitepaper: {
        found: true,
        data: {
          comprehensive: true,
          technical_details: true
        },
        quality: 'high',
        timestamp: new Date(),
        dataPoints: 15
      },
      onchain_data: {
        found: true,
        data: {
          contracts_verified: true,
          token_deployed: true,
          contract_risks: ['honeypot']
        },
        quality: 'high',
        timestamp: new Date(),
        dataPoints: 12
      },
      team_info: {
        found: true,
        data: {
          team_members: ['John Doe'],
          anonymous: false,
          red_flags: ['scam_history']
        },
        quality: 'low',
        timestamp: new Date(),
        dataPoints: 5
      },
      community_health: {
        found: true,
        data: {
          discord_members: 5000,
          twitter_followers: 10000,
          bot_percentage: 0.7
        },
        quality: 'low',
        timestamp: new Date(),
        dataPoints: 8
      }
    } as ResearchFindings,
    projectType: {
      type: 'web3_game' as const,
      confidence: 0.8
    }
  }
];

async function runQualityGatesTests() {
  console.log('🧪 Running Quality Gates Tests\n');
  
  const qualityGates = new QualityGatesEngine();
  
  for (const scenario of testScenarios) {
    console.log(`\n📋 Testing: ${scenario.name}`);
    console.log('─'.repeat(50));
    
    const result = qualityGates.checkQualityGates(scenario.findings, scenario.projectType);
    
    console.log(`✅ Passed: ${result.passed}`);
    console.log(`📊 Score: ${qualityGates['scoringEngine'].calculateResearchScore(scenario.findings).totalScore}/100`);
    console.log(`💬 Message: ${result.userMessage}`);
    
    if (!result.passed) {
      console.log(`❌ Failed Gates: ${result.gatesFailed.join(', ')}`);
      console.log(`🔧 Recommendations: ${result.recommendations.join('; ')}`);
      console.log(`💡 Manual Suggestions: ${result.manualResearchSuggestions.join('; ')}`);
      if (result.retryAfter) {
        console.log(`⏰ Suggested retry: ${result.retryAfter} minutes`);
      }
    }
    
    console.log('');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runQualityGatesTests().catch(console.error);
}

export { runQualityGatesTests }; 