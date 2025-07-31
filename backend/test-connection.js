const net = require('net');

const client = new net.Socket();

client.connect(4001, 'localhost', () => {
  console.log('✅ Connected to server on port 4001');
  client.destroy();
});

client.on('error', (err) => {
  console.log('❌ Could not connect to server:', err.message);
});

setTimeout(() => {
  console.log('Connection test completed');
  process.exit(0);
}, 2000); 