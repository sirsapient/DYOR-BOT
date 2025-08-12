const { FreeSearchService } = require('./dist/search-service');

async function researchAuditDiscovery() {
  const searchService = FreeSearchService.getInstance();
  
  // List of popular web3 game projects to research
  const projects = [
    'Axie Infinity',
    'Decentraland', 
    'The Sandbox',
    'Enjin',
    'Gala Games',
    'Illuvium',
    'Gods Unchained',
    'Splinterlands',
    'Alien Worlds',
    'Upland'
  ];

  console.log('🔍 RESEARCHING AUDIT DISCOVERY PATTERNS');
  console.log('=====================================\n');

  for (const project of projects) {
    console.log(`\n📋 Researching: ${project}`);
    console.log('─'.repeat(50));

    try {
      // Test different audit search strategies
      const auditSearchTerms = [
        `${project} security audit`,
        `${project} audit report`,
        `${project} CertiK audit`,
        `${project} smart contract audit`,
        `${project} audit findings`,
        `${project} security review`,
        `${project} audit verification`,
        `${project} audit firm`,
        `${project} audit completed`,
        `${project} audit status`
      ];

      let foundAudits = [];
      
      for (const term of auditSearchTerms) {
        try {
          console.log(`  🔍 Searching: "${term}"`);
          const results = await searchService.search(term, 3);
          
          if (results.length > 0) {
            console.log(`    ✅ Found ${results.length} results:`);
            for (const result of results) {
              console.log(`      - ${result.title}`);
              console.log(`        ${result.link}`);
              
              // Check if this looks like a real audit
              const isAuditRelated = (
                result.title.toLowerCase().includes('audit') ||
                result.title.toLowerCase().includes('security') ||
                result.title.toLowerCase().includes('certik') ||
                result.title.toLowerCase().includes('verification') ||
                result.link.toLowerCase().includes('certik') ||
                result.link.toLowerCase().includes('audit') ||
                result.link.toLowerCase().includes('security')
              );
              
              if (isAuditRelated) {
                foundAudits.push({
                  title: result.title,
                  url: result.link,
                  searchTerm: term
                });
                console.log(`        ✅ AUDIT-RELATED`);
              } else {
                console.log(`        ❌ Not audit-related`);
              }
            }
          } else {
            console.log(`    ❌ No results`);
          }
        } catch (error) {
          console.log(`    ❌ Search failed: ${error.message}`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Summary for this project
      console.log(`\n  📊 SUMMARY for ${project}:`);
      if (foundAudits.length > 0) {
        console.log(`    ✅ Found ${foundAudits.length} audit-related results:`);
        for (const audit of foundAudits) {
          console.log(`      - ${audit.title} (via "${audit.searchTerm}")`);
          console.log(`        ${audit.url}`);
        }
      } else {
        console.log(`    ❌ No audit-related results found`);
      }

    } catch (error) {
      console.log(`  ❌ Research failed for ${project}: ${error.message}`);
    }

    // Delay between projects
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n🎯 AUDIT RESEARCH COMPLETE');
  console.log('========================');
  console.log('\nNext steps:');
  console.log('1. Analyze which search terms work best');
  console.log('2. Identify common audit firm patterns');
  console.log('3. Look for audit platform patterns');
  console.log('4. Implement direct audit firm API searches');
}

// Run the research
researchAuditDiscovery().catch(console.error);
