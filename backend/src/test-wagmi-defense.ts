// Test script to debug WAGMI Defense search
import { FreeSearchService } from './search-service';

async function testWagmiDefenseSearch() {
  console.log('🔍 Testing WAGMI Defense search...');
  
  const searchService = FreeSearchService.getInstance();
  
  // Test different search terms that should find WAGMI Defense data
  const searchTerms = [
    'WAGMI Defense',
    'WAGMI Defense whitepaper',
    'WAGMI Defense token',
    'WAGMI Defense website',
    'WAGMI Defense documentation',
    'WAGMI Defense github',
    'WAGMI Defense team',
    'WAGMI Defense security audit'
  ];
  
  for (const term of searchTerms) {
    console.log(`\n🔍 Testing search term: "${term}"`);
    try {
      const results = await searchService.search(term, 5);
      console.log(`✅ Found ${results.length} results:`);
      results.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.title}`);
        console.log(`     URL: ${result.link}`);
        console.log(`     Snippet: ${result.snippet.substring(0, 100)}...`);
      });
    } catch (error) {
      console.log(`❌ Search failed: ${error}`);
    }
    
    // Add delay between searches
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

// Test direct URL testing
async function testDirectUrls() {
  console.log('\n🔍 Testing direct URL patterns for WAGMI Defense...');
  
  const projectName = 'wagmidefense';
  const urlPatterns = [
    `https://${projectName}.com`,
    `https://www.${projectName}.com`,
    `https://${projectName}.org`,
    `https://${projectName}.io`,
    `https://${projectName}.app`,
    `https://${projectName}.xyz`,
    `https://docs.${projectName}.com`,
    `https://whitepaper.${projectName}.com`,
    `https://github.com/${projectName}`,
    `https://github.com/${projectName.replace(/[^a-z0-9]/g, '')}`
  ];
  
  for (const url of urlPatterns) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.ok) {
        console.log(`✅ URL exists: ${url}`);
      } else {
        console.log(`❌ URL failed (${response.status}): ${url}`);
      }
    } catch (error) {
      console.log(`❌ URL error: ${url} - ${error}`);
    }
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Test specific known URLs for WAGMI Defense
async function testKnownUrls() {
  console.log('\n🔍 Testing known WAGMI Defense URLs...');
  
  const knownUrls = [
    'https://wagmidefense.com',
    'https://www.wagmidefense.com',
    'https://docs.wagmidefense.com',
    'https://whitepaper.wagmidefense.com',
    'https://github.com/wagmidefense',
    'https://twitter.com/wagmidefense',
    'https://discord.gg/wagmidefense'
  ];
  
  for (const url of knownUrls) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.ok) {
        console.log(`✅ URL exists: ${url}`);
      } else {
        console.log(`❌ URL failed (${response.status}): ${url}`);
      }
    } catch (error) {
      console.log(`❌ URL error: ${url} - ${error}`);
    }
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting WAGMI Defense search debugging...\n');
  
  await testWagmiDefenseSearch();
  await testDirectUrls();
  await testKnownUrls();
  
  console.log('\n✅ WAGMI Defense search debugging completed');
}

// Run the tests
runAllTests().catch(console.error);

