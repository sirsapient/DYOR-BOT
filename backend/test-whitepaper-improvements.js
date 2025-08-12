const { FreeSearchService } = require('./dist/search-service');

async function testWhitepaperImprovements() {
    const searchService = new FreeSearchService();
    
    // Test projects with known whitepaper locations
    const testProjects = [
        {
            name: 'Axie Infinity',
            expectedWebsite: 'axieinfinity.com',
            expectedWhitepaper: 'whitepaper.axieinfinity.com'
        },
        {
            name: 'Decentraland',
            expectedWebsite: 'decentraland.org',
            expectedWhitepaper: null // Unknown
        },
        {
            name: 'The Sandbox',
            expectedWebsite: 'sandbox.game',
            expectedWhitepaper: null // Unknown
        }
    ];

    console.log('🔧 Testing whitepaper discovery improvements...\n');

    for (const project of testProjects) {
        console.log(`\n📋 Testing: ${project.name}`);
        console.log('=' .repeat(50));
        
        try {
            // Test 1: Better website discovery
            console.log('🔎 Testing improved website discovery...');
            const sources = await searchService.searchForOfficialSources(project.name);
            
            if (sources.website) {
                console.log(`✅ Found website: ${sources.website}`);
                
                // Check if it's the expected website
                if (project.expectedWebsite && sources.website.includes(project.expectedWebsite)) {
                    console.log(`✅ Website matches expected domain: ${project.expectedWebsite}`);
                } else if (project.expectedWebsite) {
                    console.log(`⚠️  Website doesn't match expected domain. Expected: ${project.expectedWebsite}`);
                }
                
                // Test 2: Common path testing for whitepaper
                console.log('📄 Testing common whitepaper paths...');
                const commonPaths = [
                    '/whitepaper',
                    '/docs/whitepaper',
                    '/resources/whitepaper',
                    '/whitepaper.pdf',
                    '/docs/whitepaper.pdf',
                    '/white-paper',
                    '/white-paper.pdf'
                ];
                
                for (const path of commonPaths) {
                    try {
                        const testUrl = new URL(path, sources.website);
                        console.log(`🔍 Testing: ${testUrl.href}`);
                        
                        // Simple HEAD request to check if path exists
                        const response = await fetch(testUrl.href, { 
                            method: 'HEAD',
                            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
                        });
                        
                        if (response.ok) {
                            console.log(`✅ Found whitepaper at: ${testUrl.href}`);
                            break;
                        } else {
                            console.log(`❌ Path not found: ${path} (${response.status})`);
                        }
                    } catch (error) {
                        console.log(`❌ Error testing path ${path}: ${error.message}`);
                    }
                }
                
                // Test 3: Dedicated subdomain testing
                if (project.expectedWhitepaper) {
                    console.log('🌐 Testing dedicated whitepaper subdomain...');
                    try {
                        const subdomainUrl = `https://${project.expectedWhitepaper}`;
                        const response = await fetch(subdomainUrl, { 
                            method: 'HEAD',
                            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
                        });
                        
                        if (response.ok) {
                            console.log(`✅ Whitepaper subdomain accessible: ${subdomainUrl}`);
                        } else {
                            console.log(`❌ Whitepaper subdomain not accessible: ${subdomainUrl} (${response.status})`);
                        }
                    } catch (error) {
                        console.log(`❌ Error testing subdomain: ${error.message}`);
                    }
                }
                
            } else {
                console.log('❌ No website found');
            }
            
        } catch (error) {
            console.log(`❌ Error testing ${project.name}:`, error.message);
        }
        
        // Add delay between projects
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n🎯 Improvement testing complete!');
}

// Run the improvements test
testWhitepaperImprovements().catch(console.error);
