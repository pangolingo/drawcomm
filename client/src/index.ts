import SocketCommunicator from './SocketCommunicator';
import Palette from './Palette';
import BrushLayer from './BrushLayer';
import Canvas from './Canvas';

import { Stroke } from './types';

const palette = new Palette(document.getElementById('palette'));
const brushLayer = new BrushLayer();

let socket: SocketCommunicator = new SocketCommunicator({
  socketOnOpen: () => {
    console.log('websocket opened');
    canvas.enable();
  },
  socketOnReceiveDraw: (stroke: Stroke) => {
    brushLayer.addStroke(stroke);
  },
  socketOnReceiveRemember: (strokes: Array<Stroke>) => {
    console.log('REMEMBERING');
    brushLayer.replay(strokes)
  },
  socketOnClose: () => {
    console.log('websocket closed');
    canvas.disable();
  },
});

window.addEventListener('focus', socket.connect);

const canvas: Canvas = new Canvas(<HTMLCanvasElement>document.getElementById('c'), palette, brushLayer, socket);




// todo: zip the message with http://pieroxy.net/blog/pages/lz-string/index.html