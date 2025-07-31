// Integration Example: AI Research Orchestrator with Existing Research System
// This shows how to integrate the AI-First Research Orchestration with your existing research pipeline

import { conductAIOrchestratedResearch, AIResearchOrchestrator } from './ai-research-orchestrator';
import { handleResearchWithQualityGates } from './quality-gates';

// Example: Enhanced research function that uses AI orchestration
export async function enhancedResearchWithAI(
  projectName: string,
  anthropicApiKey: string,
  basicInfo?: {
    name: string;
    website?: string;
    description?: string;
    socialLinks?: {
      twitter?: string;
      discord?: string;
      telegram?: string;
    };
    aliases?: string[];
  }
) {
  console.log(`🚀 Starting enhanced AI-orchestrated research for: ${projectName}`);

  try {
    // Step 1: Use AI to plan the research strategy
    const aiResult = await conductAIOrchestratedResearch(
      projectName,
      anthropicApiKey,
      basicInfo
    );

    if (!aiResult.success) {
      console.log('❌ AI research planning failed:', aiResult.reason);
      console.log('Falling back to traditional research method...');
      
      // Fallback to traditional research
      return await handleResearchWithQualityGates(projectName);
    }

    console.log('✅ AI research planning completed successfully');
    console.log(`📊 AI Research Summary:`);
    console.log(`   - Project Type: ${aiResult.researchPlan.projectClassification.type}`);
    console.log(`   - AI Confidence: ${aiResult.completeness?.confidence || 'N/A'}`);
    console.log(`   - Sources Collected: ${aiResult.meta?.sourcesCollected || 'N/A'}`);
    console.log(`   - Time Spent: ${aiResult.meta?.timeSpent || 'N/A'} minutes`);

    // Step 2: Use the AI-generated findings with quality gates
    const qualityGateResult = await handleResearchWithQualityGates(
      projectName,
      {
        type: aiResult.researchPlan.projectClassification.type,
        confidence: aiResult.researchPlan.projectClassification.confidence
      }
    );

    // Step 3: Combine AI insights with quality gate results
    return {
      success: qualityGateResult.success,
      aiResearch: aiResult,
      qualityGates: qualityGateResult,
      combinedInsights: {
        projectType: aiResult.researchPlan.projectClassification.type,
        aiConfidence: aiResult.completeness?.confidence || 0,
        qualityScore: qualityGateResult.success ? 'High' : 'Low',
        recommendations: [
          ...(aiResult.completeness?.recommendations || []),
          ...(qualityGateResult.recommendations || [])
        ],
        riskAreas: aiResult.researchPlan.riskAreas.map(risk => ({
          area: risk.area,
          priority: risk.priority,
          approach: risk.investigationApproach
        }))
      }
    };

  } catch (error) {
    console.error('❌ Error in enhanced research:', error);
    throw error;
  }
}

// Example: Research with custom data collection integration
export async function researchWithCustomDataCollection(
  projectName: string,
  anthropicApiKey: string,
  customDataCollector: (sourceName: string, searchTerms: string[]) => Promise<any>
) {
  const orchestrator = new AIResearchOrchestrator(anthropicApiKey);
  
  console.log(`🔍 Starting custom AI-orchestrated research for: ${projectName}`);

  // Step 1: Generate AI research plan
  const researchPlan = await orchestrator.generateResearchPlan(projectName);
  
  console.log(`📋 AI Research Plan Generated:`);
  console.log(`   - Project Type: ${researchPlan.projectClassification.type}`);
  console.log(`   - Priority Sources: ${researchPlan.prioritySources.length}`);
  console.log(`   - Estimated Time: ${researchPlan.estimatedResearchTime} minutes`);

  const findings: any = {};
  const startTime = Date.now();

  // Step 2: Execute research with custom data collection
  for (const prioritySource of researchPlan.prioritySources) {
    console.log(`🔍 Researching: ${prioritySource.source} (${prioritySource.priority} priority)`);
    
    try {
      // Use your custom data collector
      const sourceData = await customDataCollector(
        prioritySource.source,
        prioritySource.searchTerms
      );

      findings[prioritySource.source] = {
        found: sourceData.found || false,
        data: sourceData.data || {},
        quality: sourceData.quality || 'medium',
        timestamp: new Date(),
        dataPoints: sourceData.dataPoints || 0
      };

      console.log(`✅ Collected data from ${prioritySource.source}: ${findings[prioritySource.source].dataPoints} data points`);

    } catch (error) {
      console.error(`❌ Failed to collect from ${prioritySource.source}:`, error);
      findings[prioritySource.source] = {
        found: false,
        data: {},
        quality: 'low',
        timestamp: new Date(),
        dataPoints: 0
      };
    }

    // Check with AI if we should continue
    const timeElapsed = Math.floor((Date.now() - startTime) / 60000);
    
    if (Object.keys(findings).length % 2 === 0) {
      const adaptiveState = await orchestrator.adaptResearchStrategy(
        researchPlan,
        findings,
        timeElapsed
      );

      if (!adaptiveState.shouldContinue) {
        console.log('🎯 AI recommends stopping research - sufficient data collected');
        break;
      }
    }
  }

  // Step 3: Final assessment
  const completeness = await orchestrator.assessResearchCompleteness(researchPlan, findings);

  return {
    success: completeness.isComplete,
    researchPlan,
    findings,
    completeness,
    meta: {
      timeSpent: Math.floor((Date.now() - startTime) / 60000),
      sourcesCollected: Object.keys(findings).filter(k => findings[k]?.found).length,
      aiConfidence: completeness.confidence
    }
  };
}

// Example: Batch research with AI optimization
export async function batchResearchWithAI(
  projectNames: string[],
  anthropicApiKey: string
) {
  const orchestrator = new AIResearchOrchestrator(anthropicApiKey);
  const results = [];

  console.log(`📦 Starting batch research for ${projectNames.length} projects`);

  for (const projectName of projectNames) {
    console.log(`\n🔍 Researching: ${projectName}`);
    
    try {
      const result = await conductAIOrchestratedResearch(
        projectName,
        anthropicApiKey
      );

      results.push({
        projectName,
        success: result.success,
        projectType: result.researchPlan?.projectClassification?.type || 'unknown',
        aiConfidence: result.completeness?.confidence || 0,
        timeSpent: result.meta?.timeSpent || 0,
        sourcesCollected: result.meta?.sourcesCollected || 0
      });

      console.log(`✅ ${projectName}: ${result.success ? 'Success' : 'Failed'}`);

    } catch (error) {
      console.error(`❌ ${projectName}: Error -`, error);
      results.push({
        projectName,
        success: false,
        projectType: 'unknown',
        aiConfidence: 0,
        timeSpent: 0,
        sourcesCollected: 0,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // Generate batch summary
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\n📊 Batch Research Summary:`);
  console.log(`   - Total Projects: ${results.length}`);
  console.log(`   - Successful: ${successful.length}`);
  console.log(`   - Failed: ${failed.length}`);
  console.log(`   - Average AI Confidence: ${(successful.reduce((sum, r) => sum + r.aiConfidence, 0) / successful.length || 0).toFixed(2)}`);
  console.log(`   - Average Time Spent: ${(results.reduce((sum, r) => sum + r.timeSpent, 0) / results.length).toFixed(1)} minutes`);

  return {
    results,
    summary: {
      total: results.length,
      successful: successful.length,
      failed: failed.length,
      averageConfidence: successful.length > 0 ? 
        successful.reduce((sum, r) => sum + r.aiConfidence, 0) / successful.length : 0,
      averageTime: results.reduce((sum, r) => sum + r.timeSpent, 0) / results.length
    }
  };
}

// Example usage functions
export async function exampleUsage() {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  
  if (!ANTHROPIC_API_KEY) {
    console.log('⚠️  Please set ANTHROPIC_API_KEY environment variable');
    return;
  }

  // Example 1: Enhanced research with AI
  console.log('\n=== Example 1: Enhanced Research with AI ===');
  const enhancedResult = await enhancedResearchWithAI(
    'Axie Infinity',
    ANTHROPIC_API_KEY,
    {
      name: 'Axie Infinity',
      website: 'https://axieinfinity.com',
      description: 'A blockchain-based game where players collect, breed, and battle digital pets',
      socialLinks: {
        twitter: 'https://twitter.com/AxieInfinity',
        discord: 'https://discord.gg/axie'
      },
      aliases: ['AXS', 'Axie']
    }
  );

  console.log('Enhanced Research Result:', enhancedResult.success ? 'Success' : 'Failed');

  // Example 2: Custom data collection
  console.log('\n=== Example 2: Custom Data Collection ===');
  const customResult = await researchWithCustomDataCollection(
    'Illuvium',
    ANTHROPIC_API_KEY,
    async (sourceName: string, searchTerms: string[]) => {
      // Your custom data collection logic here
      console.log(`Custom collection for ${sourceName} with terms: ${searchTerms.join(', ')}`);
      
      // Simulate data collection
      return {
        found: Math.random() > 0.3,
        data: { example: 'data' },
        quality: 'medium',
        dataPoints: Math.floor(Math.random() * 10) + 5
      };
    }
  );

  console.log('Custom Research Result:', customResult.success ? 'Success' : 'Failed');

  // Example 3: Batch research
  console.log('\n=== Example 3: Batch Research ===');
  const batchResult = await batchResearchWithAI(
    ['Axie Infinity', 'Illuvium', 'The Sandbox'],
    ANTHROPIC_API_KEY
  );

  console.log('Batch Research Summary:', batchResult.summary);
}

// Run example if this file is executed directly
if (require.main === module) {
  exampleUsage()
    .then(() => {
      console.log('\n🎉 Integration examples completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Integration example failed:', error);
      process.exit(1);
    });
} 