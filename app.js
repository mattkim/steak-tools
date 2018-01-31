var fs = require('fs');
var https = require('https');
var cors = require('cors');
const http = require('http');
const express = require('express');

const app = express();
const port = 3000;
const httpsPort = 3443;

// Load modules
var modules = [];

const TransactionBot = require('./transactionBot.js');

modules.push(new TransactionBot());

// cors
app.use(cors());
app.options('*', cors());

app.get('/', (request, response) => {
  response.send('Hello from Express!');
})

const server = http.createServer(app);

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }

  console.log(`server is listening on ${port}`);
});

// // https creds
// var privateKey  = fs.readFileSync('certificates/key.pem', 'utf8');
// var certificate = fs.readFileSync('certificates/cert.pem', 'utf8');
// var credentials = {key: privateKey, cert: certificate};
// var httpsServer = https.createServer(credentials, app);

// httpsServer.listen(httpsPort, (err) => {
//   if (err) {
//     return console.log('something bad happened https', err);
//   }

//   console.log(`https server is listening on ${port}`);
// });
