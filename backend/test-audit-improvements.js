const { FreeSearchService } = require('./dist/search-service');

async function testAuditImprovements() {
  const searchService = FreeSearchService.getInstance();
  
  // Test projects with known audit information
  const testProjects = [
    {
      name: 'Axie Infinity',
      expectedAudit: 'https://skynet.certik.com/projects/axie-infinity',
      description: 'Known to have CertiK audit'
    },
    {
      name: 'Decentraland',
      expectedAudit: null, // Unknown
      description: 'Test audit discovery'
    },
    {
      name: 'The Sandbox',
      expectedAudit: null, // Unknown
      description: 'Test audit discovery'
    }
  ];

  console.log('🔍 TESTING AUDIT DISCOVERY IMPROVEMENTS');
  console.log('======================================\n');

  for (const project of testProjects) {
    console.log(`\n📋 Testing: ${project.name}`);
    console.log(`📝 ${project.description}`);
    console.log('─'.repeat(60));

    try {
      // Test the enhanced audit discovery
      console.log(`🔍 Testing direct audit discovery for: ${project.name}`);
      const auditUrl = await searchService.searchAuditDirectly(project.name, undefined);
      
      if (auditUrl) {
        console.log(`✅ AUDIT FOUND: ${auditUrl}`);
        
        if (project.expectedAudit && auditUrl.includes(project.expectedAudit)) {
          console.log(`🎯 PERFECT MATCH with expected audit!`);
        } else if (project.expectedAudit) {
          console.log(`⚠️  Found audit but doesn't match expected: ${project.expectedAudit}`);
        } else {
          console.log(`🎉 NEW AUDIT DISCOVERED!`);
        }
      } else {
        console.log(`❌ No audit found`);
        if (project.expectedAudit) {
          console.log(`⚠️  Expected audit not found: ${project.expectedAudit}`);
        }
      }

      // Test the full official sources search to see if audit is included
      console.log(`\n🔍 Testing full official sources search for: ${project.name}`);
      const sources = await searchService.searchForOfficialSources(project.name);
      
      console.log(`📊 Full search results:`);
      if (sources.website) console.log(`  ✅ Website: ${sources.website}`);
      if (sources.whitepaper) console.log(`  ✅ Whitepaper: ${sources.whitepaper}`);
      if (sources.github) console.log(`  ✅ GitHub: ${sources.github}`);
      if (sources.documentation) console.log(`  ✅ Documentation: ${sources.documentation}`);
      if (sources.audits && sources.audits.length > 0) {
        console.log(`  ✅ Audits (${sources.audits.length}):`);
        for (const audit of sources.audits) {
          console.log(`    - ${audit}`);
        }
      } else {
        console.log(`  ❌ No audits found`);
      }

    } catch (error) {
      console.log(`❌ Test failed for ${project.name}: ${error.message}`);
    }

    // Delay between projects
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log('\n🎯 AUDIT IMPROVEMENT TESTING COMPLETE');
  console.log('====================================');
  console.log('\nAnalysis:');
  console.log('- Direct audit discovery should find audits via audit firm platforms');
  console.log('- Full search should include audit discovery in the workflow');
  console.log('- Results should show improvement over previous 0-result searches');
}

// Run the test
testAuditImprovements().catch(console.error);
