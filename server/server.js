require('dotenv').config();             // access to hidden data

const http = require('http')            // http connection


const app = require('./index');         // callback to index
const server = http.createServer(app);       // create a server allocate app object

server.listen(process.env.SERVER_PORT); // start server at port SERVER_PORT

server.on('listening', () => { console.log('Server running at port ' + process.env.SERVER_PORT); }).on('error', (error) => { console.log('Error starting server\n' + error); });