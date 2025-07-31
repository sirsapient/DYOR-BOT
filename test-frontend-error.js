const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testFrontendErrorHandling() {
  console.log('=== Testing Frontend Error Handling ===');
  
  try {
    console.log('Making request to: http://localhost:4000/api/research');
    console.log('Request body:', { projectName: 'Axie Infinity' });
    
    const res = await fetch('http://localhost:4000/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectName: 'Axie Infinity' }),
    });
    
    console.log('Response status:', res.status);
    console.log('Response headers:', Object.fromEntries(res.headers.entries()));
    
    const data = await res.json();
    console.log('Raw API response:', data);
    console.log('Response keys:', Object.keys(data));
    console.log('Has confidence in response:', 'confidence' in data);
    
    if (!res.ok) {
      console.log('Response not OK. Status:', res.status);
      console.log('Response data for error handling:', data);
      console.log('Data has error property:', 'error' in data);
      console.log('Error message:', data.error);
      
      if (res.status === 404 && data.error) {
        console.log('✅ Would set error message to:', data.error);
        console.log('This should appear in the frontend UI');
      } else {
        console.log('❌ Would set generic error message');
      }
    } else {
      console.log('✅ Response is OK, would set research data');
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testFrontendErrorHandling(); 