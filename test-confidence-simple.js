// Simple test to check if confidence data is being generated
// Run this in the browser console on localhost:3000

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
    
    console.log('=== CONFIDENCE TEST RESULTS ===');
    console.log('Response keys:', Object.keys(data));
    console.log('Has confidence field:', 'confidence' in data);
    
    if (data.confidence) {
      console.log('✅ Confidence data found!');
      console.log('Overall score:', data.confidence.overall?.score);
      console.log('Overall grade:', data.confidence.overall?.grade);
      console.log('Source details count:', data.confidence.sourceDetails?.length);
      console.log('Breakdown:', data.confidence.breakdown);
    } else {
      console.log('❌ No confidence data found in response');
      console.log('Available fields:', Object.keys(data));
    }
  } catch (error) {
    console.error('Error testing confidence:', error);
  }
}

// Run the test
testConfidence(); 