const fetch = require('node-fetch');

async function testAPI() {
  try {
    const response = await fetch('http://localhost:4000/api/research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectName: 'Axie Infinity'
      })
    });

    const data = await response.json();
    console.log('API Response keys:', Object.keys(data));
    console.log('Has confidence:', 'confidence' in data);
    console.log('Confidence data:', data.confidence);
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI(); 