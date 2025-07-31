const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
  try {
    // Test health endpoint
    console.log('Testing health endpoint...');
    const healthRes = await fetch('http://localhost:4000/api/health');
    console.log('Health status:', healthRes.status);
    
    // Test research endpoint
    console.log('\nTesting research endpoint...');
    const researchRes = await fetch('http://localhost:4000/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectName: 'test' })
    });
    console.log('Research status:', researchRes.status);
    
    if (researchRes.ok) {
      const data = await researchRes.json();
      console.log('Response received:', Object.keys(data));
    } else {
      const errorText = await researchRes.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAPI(); 