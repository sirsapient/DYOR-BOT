const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testEnvCheck() {
  try {
    console.log('🔍 Testing environment variables in production...');
    
    // First, test the health endpoint to make sure the server is running
    const healthResponse = await fetch('https://dyor-bot.onrender.com/api/health');
    console.log('Health status:', healthResponse.status);
    
    if (healthResponse.ok) {
      console.log('✅ Server is running');
      
      // Now test with a simple request that should trigger environment variable checks
      const response = await fetch('https://dyor-bot.onrender.com/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectName: 'test-env-check',
          debug: true  // Add a debug flag if the backend supports it
        })
      });
      
      console.log('Research endpoint status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Success! Response:', data);
      } else {
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
        
        // The error message should give us clues about what's missing
        if (errorText.includes('No data found')) {
          console.log('\n🔍 Analysis: The error suggests that all data sources failed.');
          console.log('This could mean:');
          console.log('1. API keys are missing or incorrect');
          console.log('2. API keys are not being loaded properly');
          console.log('3. API calls are failing due to network issues');
          console.log('4. Environment variables have different names than expected');
        }
      }
    } else {
      console.log('❌ Server health check failed');
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testEnvCheck(); 