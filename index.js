const express = require('express');
const WebSocket = require('ws');
const redis = require("redis")
const {promisify} = require('util');

const rClient = redis.createClient();

// promisify redis
const redisGet = promisify(rClient.get).bind(rClient);
const redisLpush = promisify(rClient.lpush).bind(rClient);
const redisLTrim = promisify(rClient.ltrim).bind(rClient);
const redisLRange = promisify(rClient.lrange).bind(rClient);

rClient.on("error", function (err) {
  console.log("Error " + err);
});

// const server = https.createServer({
//   cert: fs.readFileSync('/path/to/cert.pem'),
//   key: fs.readFileSync('/path/to/key.pem')
// }), handleRequest;


const app = new express();

const port = 8080;
var inMemoryStrokes = [];
const maxSavedStrokes = 200;

// LRANGE STROKES 0 -1
redisLRange('STROKES', 0, maxSavedStrokes - 1).then(r => {
  console.log(r);
  inMemoryStrokes = r;
})



app.get('/', function(req, res){
    res.sendFile('/index.html', {root: 'client'});
});
app.use(express.static('client/public'))

app.listen(port, () => console.log(`Listening on port ${port}!`))


const wss = new WebSocket.Server({
  port: 8081
});

wss.on('connection', function connection(ws) {

  ws.on('message', function incoming(rawMessage) {
    const message = JSON.parse(rawMessage);
    if(message.event === 'DRAW') {
      inMemoryStrokes.push(message.data);

      // push and limit to a max number of strokes
      redisLpush('STROKES', message.data).then(() => redisLTrim('STROKES', 0, maxSavedStrokes - 1));
    
      wss.clients.forEach(function each(client) {
        // send to all excluding self
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(rawMessage);
        }
      });
    }
  });

  ws.send(JSON.stringify({event:'REMEMBER', data:inMemoryStrokes.slice(0 - maxSavedStrokes)}));
});

// todo: ws rate limit?
