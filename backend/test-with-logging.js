const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testWithLogging() {
  console.log('=== Testing Backend with Logging ===');
  
  // Test 1: Simple health check
  try {
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:4000/api/health');
    console.log('Health status:', healthResponse.status);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('Health data:', healthData);
    }
  } catch (error) {
    console.error('Health check failed:', error);
  }
  
  // Test 2: Root endpoint
  try {
    console.log('\n2. Testing root endpoint...');
    const rootResponse = await fetch('http://localhost:4000/');
    console.log('Root status:', rootResponse.status);
    if (rootResponse.ok) {
      const rootData = await rootResponse.text();
      console.log('Root data:', rootData);
    }
  } catch (error) {
    console.error('Root check failed:', error);
  }
  
  // Test 3: Research endpoint with Axie Infinity
  try {
    console.log('\n3. Testing research endpoint with Axie Infinity...');
    console.log('This should trigger backend console logs if the server is running properly...');
    
    const researchResponse = await fetch('http://localhost:4000/api/research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ projectName: 'Axie Infinity' })
    });
    
    console.log('Research status:', researchResponse.status);
    const researchData = await researchResponse.json();
    console.log('Research data:', researchData);
    
    if (researchResponse.status === 404) {
      console.log('✅ Backend correctly returned 404 for Axie Infinity');
      console.log('This means the backend is processing requests but no data sources found results');
    }
  } catch (error) {
    console.error('Research test failed:', error);
  }
  
  // Test 4: Research endpoint with a simple test
  try {
    console.log('\n4. Testing research endpoint with "test"...');
    const testResponse = await fetch('http://localhost:4000/api/research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ projectName: 'test' })
    });
    
    console.log('Test status:', testResponse.status);
    const testData = await testResponse.json();
    console.log('Test data:', testData);
  } catch (error) {
    console.error('Test failed:', error);
  }
  
  console.log('\n=== Test Complete ===');
  console.log('If you see backend console logs in another terminal, the server is working correctly.');
  console.log('If you don\'t see backend logs, the server might not be running or logs are redirected.');
}

testWithLogging(); 