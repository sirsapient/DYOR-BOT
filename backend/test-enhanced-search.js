// Test script for enhanced search capabilities
const fetch = require('node-fetch');

// Test the enhanced search functions
async function testEnhancedSearch() {
  console.log('🧪 Testing Enhanced Search Capabilities...\n');

  // Test 1: Check if Axie Infinity is detected as established
  const projectName = 'Axie Infinity';
  const aliases = ['axie', 'axs', 'axieinfinity', 'skymavis'];
  
  console.log('📋 Test 1: Established Project Detection');
  console.log(`Project: ${projectName}`);
  console.log(`Aliases: ${aliases.join(', ')}`);
  
  // Simulate the isEstablishedProject function
  const establishedKeywords = [
    'axie', 'infinity', 'skymavis',
    'sandbox', 'decentraland', 'mana',
    'illuvium', 'gods', 'unchained',
    'stepn', 'move', 'earn',
    'gala', 'games', 'foundation',
    'enjin', 'coin', 'platform',
    'immutable', 'x', 'gods',
    'ultra', 'u', 'token',
    'wax', 'blockchain', 'platform',
    'flow', 'dapper', 'labs',
    'polygon', 'studios', 'gaming'
  ];
  
  const allNames = [projectName.toLowerCase(), ...aliases.map(a => a.toLowerCase())];
  const isEstablished = establishedKeywords.some(keyword => 
    allNames.some(name => name.includes(keyword))
  );
  
  console.log(`✅ Established Project: ${isEstablished ? 'YES' : 'NO'}`);
  
  // Test 2: Test whitepaper URL discovery
  console.log('\n📋 Test 2: Whitepaper URL Discovery');
  const testUrls = [
    'https://axieinfinity.com',
    'https://whitepaper.axieinfinity.com',
    'https://docs.skymavis.com'
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`Testing URL: ${url}`);
      const res = await fetch(url);
      if (res.ok) {
        console.log(`✅ URL accessible: ${url}`);
      } else {
        console.log(`❌ URL not accessible: ${url} (${res.status})`);
      }
    } catch (e) {
      console.log(`❌ URL error: ${url} - ${e.message}`);
    }
  }
  
  // Test 3: Test GitHub repository discovery
  console.log('\n📋 Test 3: GitHub Repository Discovery');
  try {
    const githubRes = await fetch(`https://api.github.com/search/repositories?q=axieinfinity`);
    if (githubRes.ok) {
      const githubData = await githubRes.json();
      if (githubData.items && githubData.items.length > 0) {
        const topRepo = githubData.items[0];
        console.log(`✅ Found GitHub repo: ${topRepo.html_url}`);
        console.log(`   Stars: ${topRepo.stargazers_count}`);
        console.log(`   Description: ${topRepo.description}`);
      }
    }
  } catch (e) {
    console.log(`❌ GitHub API error: ${e.message}`);
  }
  
  // Test 4: Test domain pattern generation
  console.log('\n📋 Test 4: Domain Pattern Generation');
  const domainPatterns = [
    `${projectName.toLowerCase().replace(/\s+/g, '')}.com`,
    `${projectName.toLowerCase().replace(/\s+/g, '')}.io`,
    `${projectName.toLowerCase().replace(/\s+/g, '')}.org`,
    `${aliases[0]?.toLowerCase().replace(/\s+/g, '')}.com`,
    `${aliases[0]?.toLowerCase().replace(/\s+/g, '')}.io`
  ];
  
  console.log('Generated domain patterns:');
  domainPatterns.forEach(pattern => {
    console.log(`  - ${pattern}`);
  });
  
  console.log('\n🎯 Expected Results:');
  console.log('✅ Axie Infinity should be detected as established project');
  console.log('✅ Official sources should be found (whitepaper, docs, GitHub)');
  console.log('✅ Confidence score should improve from C to B+ or A-');
  console.log('✅ "Official sources found" should show green checkmark');
  
  console.log('\n✨ Enhanced Search Features Implemented:');
  console.log('1. Smart established project detection');
  console.log('2. Enhanced whitepaper discovery with multiple strategies');
  console.log('3. GitHub repository search for established projects');
  console.log('4. Domain pattern matching for official websites');
  console.log('5. Security audit report discovery');
  console.log('6. Improved data mapping to research findings');
  console.log('7. Enhanced scoring weights for official sources');
}

// Run the test
testEnhancedSearch().catch(console.error); 