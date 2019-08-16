const express = require('express');
const WebSocket = require('ws');


// const server = https.createServer({
//   cert: fs.readFileSync('/path/to/cert.pem'),
//   key: fs.readFileSync('/path/to/key.pem')
// }), handleRequest;


const app = new express();
const port = 8080;
const strokes = [];

app.get('/', function(req, res){
    res.sendFile('/index.html', {root: 'client'});
});
app.use(express.static('client/public'))

app.listen(port, () => console.log(`Listening on port ${port}!`))


const wss = new WebSocket.Server({
  port: 8081
});

wss.on('connection', function connection(ws) {

  ws.on('message', function incoming(message) {
    // console.log('received: %s', message);
    strokes.push({timestamp: new Date(), message})
    // ws.send(message)
    wss.clients.forEach(function each(client) {
      // send to all excluding self
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.send(JSON.stringify(strokes));

  // ws.send('something');
});

// todo: ws rate limit?
