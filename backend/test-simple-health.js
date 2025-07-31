const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testHealth() {
  try {
    console.log('Testing production API health...');
    const response = await fetch('https://dyor-bot.onrender.com/api/health');
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.text();
      console.log('Health response:', data);
    } else {
      console.log('Health check failed');
    }
  } catch (error) {
    console.error('Health test failed:', error.message);
  }
}

testHealth(); 