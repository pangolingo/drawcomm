import SocketCommunicator from './SocketCommunicator';
import Palette from './Palette';
import BrushLayer from './BrushLayer';
import Canvas from './Canvas';

import { Stroke } from './types';

const palette = new Palette(document.getElementById('palette'));
const brushLayer = new BrushLayer();

// TODO: fix scoping problems in this config
const socket: SocketCommunicator = new SocketCommunicator({
  socketOnOpen: () => {
    console.log('websocket opened');
    canvas.enable();
  },
  socketOnReceiveDraw: (stroke: Stroke) => {
    brushLayer.addStroke(stroke);
  },
  socketOnReceiveRemember: (strokes: Array<Stroke>) => {
    console.log('REMEMBERING');
    brushLayer.replay(strokes);
  },
  socketOnClose: () => {
    console.log('websocket closed');
    canvas.disable();
  },
});
const canvas: Canvas = new Canvas(<HTMLCanvasElement>document.getElementById('c'), palette, brushLayer, socket);

window.addEventListener('focus', socket.connect);


// todo: zip the message with http://pieroxy.net/blog/pages/lz-string/index.html
