import { Point, Brush, Color, BrushSize, PointList, StrokeList, Stroke, ColorId } from './types';
import Palette from './Palette';
import BrushLayer from './BrushLayer';
import SocketCommunicator from './SocketCommunicator';

export default class Canvas {
  private canvas: HTMLCanvasElement;
  private canvasCtx: CanvasRenderingContext2D;

  public isDrawing: Boolean = false;
  private drawingEnabled: Boolean = false;
  rect: ClientRect | DOMRect;

  private palette: Palette;
  private brushLayer: BrushLayer
  private socket: SocketCommunicator

  constructor(canvasEl: HTMLCanvasElement, palette: Palette, brushLayer: BrushLayer, socket: SocketCommunicator) {
    this.canvas = canvasEl;
    this.canvasCtx = this.canvas.getContext('2d');
    this.rect = this.canvas.getBoundingClientRect();
    this.palette =  palette;

    this.brushLayer = brushLayer;
    this.socket = socket;

    this.render = this.render.bind(this);
    this.updateOffset = this.updateOffset.bind(this);

    this.initEvents();
    window.requestAnimationFrame(this.render);
  }

  initEvents() {
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));

    window.addEventListener('scroll', this.updateOffset);
    window.addEventListener('resize', this.updateOffset);
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
  getCanvasCtx(): CanvasRenderingContext2D {
    return this.canvasCtx;
  }

  updateOffset (e: Event){
    this.rect = this.canvas.getBoundingClientRect();
  }

  onMouseDown(e: Event) {
    if(this.isDrawing) {
      this.stopDrawing();
    }
    this.startDrawing();
  }
  onMouseUp(e: MouseEvent) {
    this.stopDrawing();
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isDrawing) return;
    
    var currentPoint = { x: Math.round(e.clientX - this.rect.left), y: Math.round(e.clientY - this.rect.top) };
    this.brushLayer.addCurrentStrokePoint(currentPoint);
  };

  render (): void {
    this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // prev strokes
    this.brushLayer.strokes.forEach((stroke) => {
      const [, colorId, pointList, brushSize]: [ Brush, ColorId, PointList, BrushSize ] = stroke;
      this.brushLayer.drawWithPen(this.canvasCtx, this.palette, pointList, colorId, brushSize);
    });
    // current stroke
    this.brushLayer.drawWithPen(this.canvasCtx, this.palette, this.brushLayer.currentStrokePoints);
  
    window.requestAnimationFrame(this.render.bind(this));
  }

  enable(): void {
    this.drawingEnabled = true;
    this.canvas.classList.add('enabled');
  }

  disable(): void {
    this.drawingEnabled = false;
    this.canvas.classList.remove('enabled');
  }

  stopDrawing() {
    if(!this.isDrawing) {
      return;
    }
    this.isDrawing = false;

    const newStroke: Stroke = this.brushLayer.endDrawing(this.palette);

    if(this.socket){
      this.socket.send(newStroke);
    } else {
      throw new Error('Socket connection not initialized');
    }
  };

  startDrawing() {
    if(!this.drawingEnabled){
      return;
    }
    this.isDrawing = true;
    this.brushLayer.startDrawing();
  }
  
}