const { freeSearchService } = require('./dist/search-service');

async function testSimpleWhitepaperDiscovery() {
  console.log('🧪 Testing Improved Whitepaper Discovery...\n');

  const testProjects = [
    'Axie Infinity',
    'Decentraland'
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
      
    } catch (error) {
      console.log(`❌ Error testing ${project}: ${error.message}`);
    }
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n✅ Whitepaper discovery testing completed!');
}

testSimpleWhitepaperDiscovery().catch(console.error);
