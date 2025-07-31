const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testEndpoint() {
  try {
    console.log('Testing /api/research endpoint...');
    const response = await fetch('http://localhost:4000/api/research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ projectName: 'test' })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', data);
    } else {
      console.log('Error response:', await response.text());
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testEndpoint(); 