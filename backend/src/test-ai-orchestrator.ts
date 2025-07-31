// Test file for AI Research Orchestrator
// Demonstrates how to use the AI-First Research Orchestration system

import { conductAIOrchestratedResearch, AIResearchOrchestrator } from './ai-research-orchestrator';

// Example usage function
export async function testAIOrchestratedResearch() {
  // You'll need to provide your Anthropic API key
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'your-api-key-here';
  
  if (ANTHROPIC_API_KEY === 'your-api-key-here') {
    console.log('⚠️  Please set ANTHROPIC_API_KEY environment variable');
    return;
  }

  console.log('🚀 Testing AI Research Orchestrator...\n');

  // Test with a sample project
  const projectName = 'Axie Infinity';
  const basicInfo = {
    name: 'Axie Infinity',
    website: 'https://axieinfinity.com',
    description: 'A blockchain-based game where players collect, breed, and battle digital pets called Axies',
    socialLinks: {
      twitter: 'https://twitter.com/AxieInfinity',
      discord: 'https://discord.gg/axie',
      telegram: 'https://t.me/AxieInfinity'
    },
    aliases: ['AXS', 'Axie', 'AxieInfinity']
  };

  try {
    console.log(`📋 Starting AI-orchestrated research for: ${projectName}`);
    
    const result = await conductAIOrchestratedResearch(
      projectName,
      ANTHROPIC_API_KEY,
      basicInfo
    );

    if (result.success) {
      console.log('\n✅ Research completed successfully!');
      console.log(`📊 Research Summary:`);
      console.log(`   - Project Type: ${result.researchPlan.projectClassification.type}`);
      console.log(`   - Confidence: ${result.researchPlan.projectClassification.confidence}`);
      console.log(`   - Sources Collected: ${result.meta?.sourcesCollected || 'N/A'}`);
      console.log(`   - Time Spent: ${result.meta?.timeSpent || 'N/A'} minutes`);
      console.log(`   - AI Confidence: ${result.completeness?.confidence || 'N/A'}`);
      
      console.log(`\n🔍 Priority Sources:`);
      result.researchPlan.prioritySources.forEach((source, index) => {
        console.log(`   ${index + 1}. ${source.source} (${source.priority})`);
        console.log(`      Reasoning: ${source.reasoning}`);
      });

      console.log(`\n⚠️  Risk Areas:`);
      result.researchPlan.riskAreas.forEach((risk, index) => {
        console.log(`   ${index + 1}. ${risk.area} (${risk.priority})`);
        console.log(`      Approach: ${risk.investigationApproach}`);
      });

      if (result.adaptiveState) {
        console.log(`\n🎯 Adaptive Research State:`);
        console.log(`   - Current Score: ${result.adaptiveState.currentScore}`);
        console.log(`   - Should Continue: ${result.adaptiveState.shouldContinue}`);
        console.log(`   - Sources Completed: ${result.adaptiveState.sourcesCompleted.join(', ')}`);
      }

      console.log(`\n📈 Completeness Assessment:`);
      console.log(`   - Is Complete: ${result.completeness?.isComplete || 'N/A'}`);
      console.log(`   - Confidence: ${result.completeness?.confidence || 'N/A'}`);
      console.log(`   - Gaps: ${result.completeness?.gaps?.join(', ') || 'None'}`);
      console.log(`   - Recommendations: ${result.completeness?.recommendations?.join(', ') || 'None'}`);

    } else {
      console.log('\n❌ Research failed to meet quality standards');
      console.log(`Reason: ${result.reason}`);
      console.log(`Gaps: ${result.gaps?.join(', ') || 'None'}`);
      console.log(`Recommendations: ${result.recommendations?.join(', ') || 'None'}`);
    }

  } catch (error) {
    console.error('❌ Error during AI research orchestration:', error);
  }
}

// Test individual orchestrator methods
export async function testIndividualOrchestratorMethods() {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'your-api-key-here';
  
  if (ANTHROPIC_API_KEY === 'your-api-key-here') {
    console.log('⚠️  Please set ANTHROPIC_API_KEY environment variable');
    return;
  }

  const orchestrator = new AIResearchOrchestrator(ANTHROPIC_API_KEY);

  console.log('\n🧪 Testing individual orchestrator methods...\n');

  // Test 1: Generate research plan
  console.log('1️⃣ Testing research plan generation...');
  try {
    const plan = await orchestrator.generateResearchPlan('Illuvium', {
      name: 'Illuvium',
      website: 'https://illuvium.io',
      description: 'A blockchain-based game with NFT creatures and land'
    });

    console.log(`✅ Plan generated for ${plan.projectClassification.type} project`);
    console.log(`   Confidence: ${plan.projectClassification.confidence}`);
    console.log(`   Priority Sources: ${plan.prioritySources.length}`);
    console.log(`   Estimated Time: ${plan.estimatedResearchTime} minutes`);

    // Test 2: Adaptive research strategy
    console.log('\n2️⃣ Testing adaptive research strategy...');
    
    const mockFindings = {
      whitepaper: {
        found: true,
        data: { tokenomics: 'found', roadmap: 'found' },
        quality: 'high' as const,
        timestamp: new Date(),
        dataPoints: 15
      },
      team_info: {
        found: false,
        data: {},
        quality: 'low' as const,
        timestamp: new Date(),
        dataPoints: 0
      }
    };

    const adaptiveState = await orchestrator.adaptResearchStrategy(
      plan,
      mockFindings,
      10 // 10 minutes elapsed
    );

    console.log(`✅ Adaptive state calculated`);
    console.log(`   Current Score: ${adaptiveState.currentScore}`);
    console.log(`   Should Continue: ${adaptiveState.shouldContinue}`);
    console.log(`   Next Priority: ${adaptiveState.nextPriority.join(', ')}`);

    // Test 3: Research completeness assessment
    console.log('\n3️⃣ Testing research completeness assessment...');
    
    const finalFindings = {
      ...mockFindings,
      team_info: {
        found: true,
        data: { team_members: 'found', experience: 'found' },
        quality: 'medium' as const,
        timestamp: new Date(),
        dataPoints: 8
      },
      community_health: {
        found: true,
        data: { discord_members: 'found', twitter_followers: 'found' },
        quality: 'medium' as const,
        timestamp: new Date(),
        dataPoints: 6
      }
    };

    const completeness = await orchestrator.assessResearchCompleteness(plan, finalFindings);

    console.log(`✅ Completeness assessment completed`);
    console.log(`   Is Complete: ${completeness.isComplete}`);
    console.log(`   Confidence: ${completeness.confidence}`);
    console.log(`   Gaps: ${completeness.gaps?.join(', ') || 'None'}`);

  } catch (error) {
    console.error('❌ Error testing individual methods:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAIOrchestratedResearch()
    .then(() => testIndividualOrchestratorMethods())
    .then(() => {
      console.log('\n🎉 All tests completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
} 