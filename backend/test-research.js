// Simple test script for the research endpoint using built-in http module
const http = require('http');

async function testResearch() {
  try {
    console.log('Testing research endpoint with shorter timeout...');
    
    const postData = JSON.stringify({
      projectName: 'Test Game' // Using a simpler project name
    });

    const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/research',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 15000 // 15 second timeout
    };

    const req = http.request(options, (res) => {
      console.log('Response status:', res.statusCode);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log('Response data:', JSON.stringify(jsonData, null, 2));
        } catch (e) {
          console.log('Raw response:', data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error.message);
    });

    req.on('timeout', () => {
      console.error('Request timed out after 15 seconds');
      req.destroy();
    });

    req.write(postData);
    req.end();
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testResearch(); 