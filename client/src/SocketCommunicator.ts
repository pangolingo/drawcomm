import { Brush, ColorId, BrushSize, PointList, Stroke } from 'types';

type socketCommunicatorConfig = {
  socketOnOpen: () => void,
  socketOnReceiveDraw: (stroke: Stroke) => void,
  socketOnReceiveRemember: (strokes: Array<Stroke>) => void,
  socketOnClose: () => void,
}

export default class SocketCommunicator {
  private socket: any; // TODO: type
  public config: socketCommunicatorConfig;

  constructor(config: socketCommunicatorConfig){
    if(!('socketOnOpen' in config) || !('socketOnReceiveDraw' in config) || !('socketOnReceiveRemember' in config) || !('socketOnClose' in config)) {
      throw new Error('SocketCommunictor missing initialization options')
    }
    this.config = config;
    this.connect = this.connect.bind(this);
    this.initEvents = this.initEvents.bind(this);
    this.send = this.send.bind(this);
  }

  public connect() {
    if(this.socket && this.socket.conn.readyState === 1){
      console.log('already connected')
      return;
    }
    this.socket = new FancyWebSocket("ws://localhost:8081");
    this.initEvents();
  }
  
  private initEvents() {
      if(!this.socket) {
        throw new Error('Socket has not been initialized yet.');
      }
    
    
    
      //document.getElementById('restore').addEventListener('click', restore)
    
      // todo: max stroke length
    
      this.socket.bind('open', this.config.socketOnOpen)
      this.socket.bind('DRAW', (data: string) => {
        this.config.socketOnReceiveDraw(this.decompressStroke(data));
      })
      this.socket.bind('REMEMBER', (data: Array<string>) => {
        this.config.socketOnReceiveRemember(data.map((s => this.decompressStroke(s))));
      })
      this.socket.bind('close', this.config.socketOnClose)
    
    
    // this.socket.onopen = function (event) {
    //   console.log('websocket opened')
    //   // exampleSocket.send("Here's some text that the server is urgently awaiting!"); 
    // };
    // this.socket.onmessage = function (event) {
    //   console.log('ws msg:', event.data)
    //   strokes.push(decompressStroke(event.data)[2])
    // }
    
  }

  public send(stroke: Stroke) {
    if(!this.socket){
      throw new Error('Socket not connected')
    }
    if(stroke.length < 1) {
      return;
    }
    this.socket.send('DRAW', this.compressStroke(stroke))
  }

  // private compressStroke(brush: Brush,color: ColorId,points: PointList,size: BrushSize): string {
  private compressStroke(stroke: Stroke): string {
    const [ brush, color, points, brushSize ]: [ Brush, ColorId, PointList, BrushSize ] = stroke;
    const pointsStr = points.map(p => `${p.x},${p.y}`).join(',')
    return `${brush}:${color}:${pointsStr}:${brushSize}`;
  };
  private decompressStroke(str: string): Stroke {
    const parts = str.split(':');
    const [ brush, color, pointlist, brushSize ]  = parts;
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
}