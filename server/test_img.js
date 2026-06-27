const http = require('http');

http.get('http://localhost:5000/uploads/products/d87e7daa73227fb8e4d4757172797c30.jpg', (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log('Headers:', res.headers);
}).on('error', (e) => {
  console.error(`Error: ${e.message}`);
});
