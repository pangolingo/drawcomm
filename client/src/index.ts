import SocketCommunicator from './SocketCommunicator';

import Palette from './Palette';
import BrushLayer from './BrushLayer';
import Canvas from './Canvas';

import { Point, Brush, Color, BrushSize, PointList, StrokeList, Stroke } from './types';

const palette = new Palette();
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

window.addEventListener('focus', socket.connect);;

document.getElementById('clear').addEventListener('click', brushLayer.clear)
document.getElementById('undo').addEventListener('click', brushLayer.undo)

const canvas: Canvas = new Canvas(<HTMLCanvasElement>document.getElementById('c'), palette, brushLayer, socket);




// todo: zip the message with http://pieroxy.net/blog/pages/lz-string/index.html