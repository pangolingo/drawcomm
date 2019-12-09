type Point = {
  x: number,
  y: number
}

enum Brush {
  Pen = "pen"
};
enum Color {
  Red = "red",
  Blue = "blue",
  Green = "green",
  White = "white"
};
type BrushSize = number;
type PointList = Array<Point>;
type ColorId = number;

type Stroke = [
  Brush,
  ColorId,
  PointList,
  BrushSize,
]
type StrokeList = Array<Stroke>

// http://perfectionkills.com/exploring-canvas-drawing-techniques/
// const brushSize = 5;
const brushAngle: number = 1/2;

function distanceBetween(point1: Point, point2: Point): number {
  //return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
  return Math.hypot(point2.x - point1.x, point2.y - point1.y)
}
function angleBetween(point1: Point, point2: Point): number {
  return Math.atan2( point2.x - point1.x, point2.y - point1.y );
}

const colors: Array<Color> = [Color.Red, Color.Green, Color.Blue, Color.White];
const brushSizes: Array<BrushSize> = [2, 5, 30];
let currentColor: ColorId = 0;
let currentBrushSize: number = 1;

const colorButtons = document.querySelectorAll('.color-button');
const brushSizeButtons = document.querySelectorAll('.size-button');

let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('c');
let canvasCtx: CanvasRenderingContext2D = canvas.getContext('2d');

let isDrawing: Boolean = false;
let rect = canvas.getBoundingClientRect();

let currentStrokePoints: PointList = [];
let strokes: StrokeList = []

// TODO: make sure we can't draw before opened, or queue up drawings before opened
let socket: any; // TODO: type

let drawingEnabled = false;

const updateOffset = (e: Event) => {
  rect = canvas.getBoundingClientRect();
}

const onColorSelect = (e: Event) => {
  const target = <HTMLElement>e.currentTarget;
  const colorId = parseInt(target.dataset.color);
  setColor(colorId);
}

const onBrushSizeSelect = (e: Event) => {
  const target = <HTMLElement>e.currentTarget;
  const brushSizeId: number = parseInt(target.dataset.size);
  setBrushSize(brushSizeId);
}

const onMouseDown = function(e: Event) {
  if(isDrawing) {
    stopDrawing();
  }
  startDrawing();
}
const onMouseUp = function(e: MouseEvent) {
  stopDrawing();
}

const setColor = (colorId: ColorId) => {
  console.log('setting color', colorId, colors[colorId])
  if(colorId < 0 || colorId >= colors.length) {
    throw new Error(`Invalid color id ${colorId}`)
  }
  currentColor = colorId;
}

const setBrushSize = (brushSizeId: number) => {
  console.log('setting brush size', brushSizeId, brushSizes[brushSizeId])
  if(brushSizeId < 0 || brushSizeId >= brushSizes.length) {
    throw new Error(`Invalid brush size id ${brushSizeId}`)
  }
  currentBrushSize = brushSizeId;
}

const startDrawing = function() {
  if(!drawingEnabled){
    return;
  }
  currentStrokePoints = [];
  isDrawing = true;
};

const drawWithPen = (context: CanvasRenderingContext2D, pointArray: PointList, color: Color, brushSize: BrushSize) => {
  if(pointArray.length < 2){
    return;
  }

  // set color
  canvasCtx.fillStyle = color;
  
  // stroke the points
  for (var pp = 1; pp < pointArray.length; pp+=1) {
    const currentPoint: Point = pointArray[pp];
    const lastPoint: Point = pointArray[pp-1];
    
    var dist = distanceBetween(lastPoint, currentPoint);
    var angle = angleBetween(lastPoint, currentPoint);
    
    // interpolate
    for (var i = 0; i < dist; i+=1) {
      var x = lastPoint.x + (Math.sin(angle) * i);
      var y = lastPoint.y + (Math.cos(angle) * i);
      context.fillRect(x,y,brushSize,brushSize * brushAngle)
    }
  }
}

// drawWithPen(ctx, [{x:1,y:1},{x:100,y:100},{x:200,y:1}]);

const onMouseMove = function(e: MouseEvent) {
  if (!isDrawing) return;
  
  var currentPoint = { x: Math.round(e.clientX - rect.left), y: Math.round(e.clientY - rect.top) };
  currentStrokePoints.push(currentPoint);
};

const send = (stroke: Stroke) => {
  if(!socket){
    throw new Error('Socket not connected')
  }
  if(stroke.length < 1) {
    return;
  }
  const [ brush, color, strokePoints, brushSize ] = stroke;
  socket.send('DRAW', compressStroke(brush,color,strokePoints, brushSize))
}

const replay = (replayStrokes: StrokeList) => {
  const frameRate: number = 1000 / 60; // FPS
  let lastFrameTime: number = null;
  const doReplay = (): void => {
    if(replayStrokes.length < 1) {
      return;
    }
    const now: number = Date.now();
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


const render = (): void => {
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  
  // prev strokes
  strokes.forEach((stroke) => drawWithPen(canvasCtx, stroke[2], colors[stroke[1]], stroke[3] == null ? brushSizes[0] : stroke[3]));
  // current stroke
  drawWithPen(canvasCtx, currentStrokePoints, colors[currentColor], brushSizes[currentBrushSize]);

  window.requestAnimationFrame(render);
}
window.requestAnimationFrame(render);


const stopDrawing = function() {
  if(!isDrawing) {
    return;
  }
  isDrawing = false;
  // save the stroke and start a new stroke
  // strokes.push(currentStrokePoints);
  const newStroke: Stroke = [
    Brush.Pen,
    currentColor,
    currentStrokePoints,
    brushSizes[currentBrushSize]
  ]
  strokes.push(newStroke)
  send(newStroke);
  currentStrokePoints = [];
};

const clear = () => {
   currentStrokePoints = [];
  strokes = []
}

const undo = () => {
  strokes.pop();
}

const compressStroke = (brush: Brush,color: ColorId,points: PointList,size: BrushSize): string => {
  const pointsStr = points.map(p => `${p.x},${p.y}`).join(',')
  return `${brush}:${color}:${pointsStr}:${size}`;
};
const decompressStroke = (str: string): Stroke => {
  const parts = str.split(':');
  const [ brush, color, pointlist, brushSize ] = parts;
  return [
    <Brush>brush,
    parseInt(color),
    pointlist.match(/[^,]+,[^,]+/g).map(p => {
      const [x,y] = p.split(',')
      return {x: parseFloat(x), y: parseFloat(y)}
    }),
    parseFloat(brushSize)
  ];
};


canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mouseup', onMouseUp);
canvas.addEventListener('mousemove', onMouseMove);
//el.addEventListener('mouseout', stopDrawing);

document.getElementById('clear').addEventListener('click', clear)

document.getElementById('undo').addEventListener('click', undo)

window.addEventListener('scroll', updateOffset);
window.addEventListener('resize', updateOffset);

colorButtons.forEach(item => {
  item.addEventListener('click', onColorSelect)
});
brushSizeButtons.forEach(item => {
  item.addEventListener('click', onBrushSizeSelect)
});

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
    canvas.classList.add('enabled');
  })
  socket.bind('DRAW', (data: string) => {
    // strokes.push(decompressStroke(data)[2])
    strokes.push(decompressStroke(data));
  })
  socket.bind('REMEMBER', (data: Array<string>) => {
    console.log('REMEMBERING');
    // strokes = data.map((s => decompressStroke(s)[2]));
    // replay(data.map((s => decompressStroke(s)[2])));
    replay(data.map((s => decompressStroke(s))));
  })
  socket.bind('close', () => {
    console.log('websocket closed');
    drawingEnabled = false;
    canvas.classList.remove('enabled');
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