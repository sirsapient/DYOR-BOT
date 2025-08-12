const { freeSearchService } = require('./dist/search-service');

async function testWhitepaperDiscovery() {
  console.log('🧪 Testing Enhanced Whitepaper Discovery...\n');

  const testProjects = [
    'Axie Infinity',
    'Decentraland', 
    'The Sandbox',
    'Enjin',
    'Gala Games'
  ];

  for (const project of testProjects) {
    console.log(`\n🔍 Testing whitepaper discovery for: ${project}`);
    
    try {
      // Test direct whitepaper search
      const whitepaperUrl = await freeSearchService.searchWhitepaperDirectly(project, undefined);
      
      if (whitepaperUrl) {
        console.log(`✅ Found whitepaper: ${whitepaperUrl}`);
      } else {
        console.log(`❌ No whitepaper found`);
      }
      
      // Test official sources search (which includes whitepaper)
      const sources = await freeSearchService.searchForOfficialSources(project);
      
      console.log('Sources found:');
      Object.entries(sources).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          console.log(`  ${key}: ${value.join(', ')}`);
        } else {
          console.log(`  ${key}: ${value || 'None'}`);
        }
      });
      
    } catch (error) {
      console.log(`❌ Error testing ${project}: ${error.message}`);
    }
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n✅ Whitepaper discovery testing completed!');
}

testWhitepaperDiscovery().catch(console.error);
