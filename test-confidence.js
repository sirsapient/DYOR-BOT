const fetch = require('node-fetch');

async function testConfidence() {
  try {
    const response = await fetch('http://localhost:4000/api/research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        projectName: 'Axie Infinity'
      })
    });

    const data = await response.json();
    
    console.log('Response keys:', Object.keys(data));
    console.log('Has confidence:', 'confidence' in data);
    
    if (data.confidence) {
      console.log('Confidence data structure:');
      console.log('- Overall score:', data.confidence.overall?.score);
      console.log('- Overall grade:', data.confidence.overall?.grade);
      console.log('- Breakdown:', data.confidence.breakdown);
      console.log('- Source details count:', data.confidence.sourceDetails?.length);
    } else {
      console.log('No confidence data found in response');
    }
  } catch (error) {
    console.error('Error testing confidence:', error);
  }
}

testConfidence(); 