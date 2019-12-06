// http://perfectionkills.com/exploring-canvas-drawing-techniques/
const brushSize = 5;
const brushAngle = 1/2;

function distanceBetween(point1, point2) {
  //return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
  return Math.hypot(point2.x - point1.x, point2.y - point1.y)
}
function angleBetween(point1, point2) {
  return Math.atan2( point2.x - point1.x, point2.y - point1.y );
}

var el = document.getElementById('c');
var ctx = el.getContext('2d');
ctx.fillStyle = 'red';

var isDrawing = false;
var rect = el.getBoundingClientRect();

var currentStrokePoints = [];
var strokes = []

// TODO: make sure we can't draw before opened, or queue up drawings before opened
var socket;

var drawingEnabled = false;

const updateOffset = (e) => {
  rect = el.getBoundingClientRect();
}

const onMouseDown = function(e) {
  if(isDrawing) {
    stopDrawing(e);
  }
  startDrawing(e);
}
const onMouseUp = function(e) {
  stopDrawing(e);
}


const startDrawing = function(e) {
  if(!drawingEnabled){
    return;
  }
  currentStrokePoints = [];
  isDrawing = true;
};

const drawWithPen = (context, pointArray) => {
  if(pointArray.length < 2){
    return;
  }
  
  // stroke the points
  for (var pp = 1; pp < pointArray.length; pp+=1) {
    const currentPoint = pointArray[pp];
    const lastPoint = pointArray[pp-1];
    
    var dist = distanceBetween(lastPoint, currentPoint);
    var angle = angleBetween(lastPoint, currentPoint);
    
    // interpolate
    for (var i = 0; i < dist; i+=1) {
      x = lastPoint.x + (Math.sin(angle) * i);
      y = lastPoint.y + (Math.cos(angle) * i);
      context.fillRect(x,y,brushSize,brushSize * brushAngle)
    }
  }
}

// drawWithPen(ctx, [{x:1,y:1},{x:100,y:100},{x:200,y:1}]);

const onMouseMove = function(e) {
  if (!isDrawing) return;
  
  var currentPoint = { x: Math.round(e.clientX - rect.left), y: Math.round(e.clientY - rect.top) };
  currentStrokePoints.push(currentPoint);
};

const send = (stroke) => {
  if(!socket){
    throw new Error('Socket not connected')
  }
  if(stroke.length < 1) {
    return;
  }
  socket.send('DRAW', compressStroke('PEN','PINK',stroke))
}

const replay = (replayStrokes) => {
  const frameRate = 1000 / 60; // FPS
  let lastFrameTime = null;
  doReplay = () => {
    if(replayStrokes.length < 1) {
      return;
    }
    const now = new Date();
    if(lastFrameTime != null && now - lastFrameTime < frameRate) {
      window.requestAnimationFrame(doReplay);
      return;
    }
    lastFrameTime = now;

    strokes.push(replayStrokes.shift());
    window.requestAnimationFrame(doReplay);
  }
  window.requestAnimationFrame(doReplay);
}


const render = () => {
  ctx.clearRect(0, 0, el.width, el.height);
  
  // prev strokes
  strokes.forEach((stroke) => drawWithPen(ctx, stroke));
  // current stroke
  drawWithPen(ctx, currentStrokePoints);

  window.requestAnimationFrame(render);
}
window.requestAnimationFrame(render);


const stopDrawing = function() {
  if(!isDrawing) {
    return;
  }
  isDrawing = false;
  // save the stroke and start a new stroke
  strokes.push(currentStrokePoints);
  send(currentStrokePoints);
  currentStrokePoints = [];
};

const clear = () => {
   currentStrokePoints = [];
  strokes = []
}

const undo = () => {
  strokes.pop();
}

const compressStroke = (brush,color,points) => {
  const pointsStr = points.map(p => `${p.x},${p.y}`).join(',')
  return `${brush}:${color}:${pointsStr}`;
};
const decompressStroke = (str) => {
  const parts = str.split(':');
  return [
    parts[0],
    parts[1],
    parts[2].match(/[^,]+,[^,]+/g).map(p => {
      const [x,y] = p.split(',')
      return {x: parseFloat(x), y: parseFloat(y)}
    })
  ];
};


el.addEventListener('mousedown', onMouseDown);
el.addEventListener('mouseup', onMouseUp);
el.addEventListener('mousemove', onMouseMove);
//el.addEventListener('mouseout', stopDrawing);

document.getElementById('clear').addEventListener('click', clear)

document.getElementById('undo').addEventListener('click', undo)

window.addEventListener('scroll', updateOffset);
window.addEventListener('resize', updateOffset);

var connect = () => {
  if(socket && socket.conn.readyState === 1){
    console.log('already connected')
    return;
  }
  socket = new FancyWebSocket("ws://localhost:8081");



  //document.getElementById('restore').addEventListener('click', restore)

  // todo: max stroke length

  socket.bind('open', () => {
    console.log('websocket opened');
    drawingEnabled = true;
    el.classList.add('enabled');
  })
  socket.bind('DRAW', (data) => {
    strokes.push(decompressStroke(data)[2])
  })
  socket.bind('REMEMBER', (data) => {
    console.log('REMEMBERING');
    // strokes = data.map((s => decompressStroke(s)[2]));
    replay(data.map((s => decompressStroke(s)[2])));
  })
  socket.bind('close', () => {
    console.log('websocket closed');
    drawingEnabled = false;
    el.classList.remove('enabled');
    // alert('websocket closed');
  })


// socket.onopen = function (event) {
//   console.log('websocket opened')
//   // exampleSocket.send("Here's some text that the server is urgently awaiting!"); 
// };
// socket.onmessage = function (event) {
//   console.log('ws msg:', event.data)
//   strokes.push(decompressStroke(event.data)[2])
// }

} // end connect

connect();

window.addEventListener('focus', connect);

// todo: zip the message with http://pieroxy.net/blog/pages/lz-string/index.html