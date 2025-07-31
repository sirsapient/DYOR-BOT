const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testProductionConfidence() {
  try {
    console.log('Testing production API for confidence data...');
    const response = await fetch('https://dyor-bot.onrender.com/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectName: 'bitcoin' })
    });
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response keys:', Object.keys(data));
      console.log('Has confidence field:', 'confidence' in data);
      
      if (data.confidence) {
        console.log('✅ Confidence data found!');
        console.log('Confidence structure:', Object.keys(data.confidence));
        console.log('Overall score:', data.confidence.overall?.score);
        console.log('Overall grade:', data.confidence.overall?.grade);
      } else {
        console.log('❌ No confidence data in response');
        console.log('Available fields:', Object.keys(data));
      }
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testProductionConfidence(); 