// Test script to crawl WAGMI Games website for WAGMI Defense information
import { FreeSearchService } from './search-service';

async function testWagmiGamesWebsite() {
  console.log('🎮 Testing WAGMI Games website for WAGMI Defense information...');
  
  const searchService = FreeSearchService.getInstance();
  
  // Test crawling the WAGMI Games website
  console.log('\n🔍 Crawling WAGMI Games website...');
  try {
    const response = await fetch('https://wagmigames.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (response.ok) {
      const html = await response.text();
      console.log(`✅ Successfully fetched WAGMI Games website (${html.length} characters)`);
      
      // Look for WAGMI Defense mentions
      const wagmiDefenseMentions = html.match(/WAGMI\s+Defense/gi);
      if (wagmiDefenseMentions) {
        console.log(`\n🎯 Found ${wagmiDefenseMentions.length} mentions of "WAGMI Defense" on the website`);
        wagmiDefenseMentions.forEach((mention, index) => {
          console.log(`  ${index + 1}. ${mention}`);
        });
      } else {
        console.log('\n❌ No direct mentions of "WAGMI Defense" found on the website');
      }
      
      // Look for game-related content
      const gameKeywords = ['game', 'games', 'play', 'download', 'steam', 'epic', 'blockchain', 'web3', 'nft'];
      const foundKeywords = gameKeywords.filter(keyword => 
        html.toLowerCase().includes(keyword.toLowerCase())
      );
      console.log(`\n🎮 Found game-related keywords: ${foundKeywords.join(', ')}`);
      
      // Look for links to other pages
      const linkMatches = html.match(/href="([^"]*)"/g);
      if (linkMatches) {
        console.log(`\n🔗 Found ${linkMatches.length} links on the website`);
        
        // Filter for interesting links
        const interestingLinks = linkMatches
          .map(match => match.match(/href="([^"]*)"/)?.[1])
          .filter(link => link && (
            link.includes('game') ||
            link.includes('defense') ||
            link.includes('play') ||
            link.includes('download') ||
            link.includes('steam') ||
            link.includes('epic') ||
            link.includes('whitepaper') ||
            link.includes('docs') ||
            link.includes('github') ||
            link.includes('discord') ||
            link.includes('twitter') ||
            link.includes('telegram')
          ))
          .slice(0, 10); // Show first 10 interesting links
        
        if (interestingLinks.length > 0) {
          console.log('\n🔗 Interesting links found:');
          interestingLinks.forEach((link, index) => {
            console.log(`  ${index + 1}. ${link}`);
          });
        }
      }
      
      // Look for social media links
      const socialLinks = {
        discord: html.match(/discord\.gg\/[^"'\s]+/gi),
        twitter: html.match(/twitter\.com\/[^"'\s]+/gi),
        telegram: html.match(/t\.me\/[^"'\s]+/gi),
        github: html.match(/github\.com\/[^"'\s]+/gi)
      };
      
      console.log('\n📱 Social media links found:');
      Object.entries(socialLinks).forEach(([platform, links]) => {
        if (links && links.length > 0) {
          console.log(`  ${platform}: ${links.join(', ')}`);
        }
      });
      
    } else {
      console.log(`❌ Failed to fetch website: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Error fetching website: ${(error as Error).message}`);
  }
  
  // Test searching for WAGMI Defense specifically on the website
  console.log('\n🔍 Testing search for WAGMI Defense information...');
  const wagmiDefenseSearches = [
    'WAGMI Defense',
    'WAGMI Defense game',
    'WAGMI Defense download',
    'WAGMI Defense steam',
    'WAGMI Defense whitepaper'
  ];
  
  for (const searchTerm of wagmiDefenseSearches) {
    console.log(`\n🔍 Searching: "${searchTerm}"`);
    try {
      const results = await searchService.search(searchTerm, 5);
      console.log(`✅ Found ${results.length} results:`);
      results.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.title}`);
        console.log(`     URL: ${result.link}`);
        if (result.snippet && result.snippet.length > 50) {
          console.log(`     Snippet: ${result.snippet.substring(0, 100)}...`);
        }
      });
    } catch (error) {
      console.log(`❌ Search failed: ${(error as Error).message}`);
    }
    
    // Add delay between searches
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🎮 WAGMI Games website test completed!');
}

// Run the test
testWagmiGamesWebsite().catch(console.error);

