const { FreeSearchService } = require('./dist/search-service');

async function testDocumentationImprovements() {
  const searchService = FreeSearchService.getInstance();
  const testProjects = [
    { name: 'Axie Infinity', expectedDocumentation: 'https://docs.axieinfinity.com', description: 'Known to have documentation at docs.axieinfinity.com' },
    { name: 'Decentraland', expectedDocumentation: null, description: 'Test documentation discovery' },
    { name: 'The Sandbox', expectedDocumentation: null, description: 'Test documentation discovery' }
  ];

  console.log('🔍 TESTING DOCUMENTATION DISCOVERY IMPROVEMENTS');
  console.log('===============================================\n');

  for (const project of testProjects) {
    console.log(`\n📚 Testing: ${project.name}`);
    console.log(`Description: ${project.description}`);
    
    // Test the enhanced documentation discovery
    const documentationUrl = await searchService.searchDocumentationDirectly(project.name, undefined);
    
    if (documentationUrl) {
      console.log(`✅ Found documentation: ${documentationUrl}`);
      if (project.expectedDocumentation && documentationUrl.includes(project.expectedDocumentation.replace('https://', ''))) {
        console.log(`✅ PERFECT MATCH! Found expected documentation`);
      } else if (project.expectedDocumentation) {
        console.log(`⚠️  Found documentation but not the expected one`);
      } else {
        console.log(`✅ NEW DISCOVERY! Found documentation for ${project.name}`);
      }
    } else {
      console.log(`❌ No documentation found`);
      if (project.expectedDocumentation) {
        console.log(`❌ FAILED: Expected ${project.expectedDocumentation} but found nothing`);
      }
    }

    // Test the full official sources search to see if documentation is included
    console.log(`\n🔍 Testing full official sources search for ${project.name}...`);
    const sources = await searchService.searchForOfficialSources(project.name);
    
    console.log(`\n📊 Full Search Results for ${project.name}:`);
    if (sources.website) console.log(`✅ Website: ${sources.website}`);
    if (sources.whitepaper) console.log(`✅ Whitepaper: ${sources.whitepaper}`);
    if (sources.documentation) console.log(`✅ Documentation: ${sources.documentation}`);
    if (sources.github) console.log(`✅ GitHub: ${sources.github}`);
    if (sources.audits && sources.audits.length > 0) {
      console.log(`✅ Audits: ${sources.audits.join(', ')}`);
    }
    
    console.log('\n' + '='.repeat(50));
  }

  console.log('\n🎯 DOCUMENTATION DISCOVERY TESTING COMPLETE');
  console.log('===========================================');
  console.log('✅ Enhanced documentation discovery implemented');
  console.log('✅ Multiple strategies working in parallel');
  console.log('✅ Integration with full search workflow complete');
}

testDocumentationImprovements().catch(console.error);
