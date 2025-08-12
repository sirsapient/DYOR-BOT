const { FreeSearchService } = require('./dist/search-service');

async function researchWhitepaperLocations() {
    const searchService = new FreeSearchService();
    
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

    console.log('🔍 Researching whitepaper locations for web3 game projects...\n');

    for (const project of projects) {
        console.log(`\n📋 Researching: ${project}`);
        console.log('=' .repeat(50));
        
        try {
            // Search for official sources to find website
            console.log('🔎 Searching for official sources...');
            const sources = await searchService.searchForOfficialSources(project);
            
            if (sources.website) {
                console.log(`✅ Found website: ${sources.website}`);
                
                // Try to find whitepaper directly
                console.log('📄 Searching for whitepaper...');
                const whitepaper = await searchService.searchWhitepaperDirectly(project, sources.website);
                
                if (whitepaper) {
                    console.log(`✅ Found whitepaper: ${whitepaper}`);
                } else {
                    console.log('❌ No whitepaper found via direct search');
                }
                
                // Check if GitHub was found
                if (sources.github) {
                    console.log(`✅ Found GitHub: ${sources.github}`);
                } else {
                    console.log('❌ No GitHub found');
                }
                
                // Check if documentation was found
                if (sources.documentation && Array.isArray(sources.documentation) && sources.documentation.length > 0) {
                    console.log(`✅ Found documentation: ${sources.documentation.join(', ')}`);
                } else if (sources.documentation && typeof sources.documentation === 'string') {
                    console.log(`✅ Found documentation: ${sources.documentation}`);
                } else {
                    console.log('❌ No documentation found');
                }
                
            } else {
                console.log('❌ No website found');
            }
            
        } catch (error) {
            console.log(`❌ Error researching ${project}:`, error.message);
        }
        
        // Add delay between projects to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n🎯 Research complete! Analyzing patterns...');
}

// Run the research
researchWhitepaperLocations().catch(console.error);
