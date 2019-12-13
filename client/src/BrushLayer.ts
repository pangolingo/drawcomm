import { distanceBetween, angleBetween } from './utilities';

import {
  Point, Brush, PointList, StrokeList, Stroke, ColorId,
} from './types';

import Palette from './Palette';

export default class BrushLayer {
  public currentStrokePoints: PointList = [];

  public strokes: StrokeList = [];

  constructor() {
    this.clear = this.clear.bind(this);
    this.undo = this.undo.bind(this);
    this.drawWithPen = this.drawWithPen.bind(this);
    this.replay = this.replay.bind(this);
    this.addStroke = this.addStroke.bind(this);
    this.resetCurrentStroke = this.resetCurrentStroke.bind(this);
    this.addCurrentStrokePoint = this.addCurrentStrokePoint.bind(this);
  }

  public drawWithPen(
    context: CanvasRenderingContext2D,
    palette: Palette,
    pointArray: PointList,
    colorId: ColorId = null,
    _brushSize: number = null,
  ) {
    const color: string = colorId != null ? palette.getColorValue(colorId) : palette.getCurrentColorValue();
    const brushSize: number = _brushSize != null ? _brushSize : palette.getCurrentBrushSize();
    const { brushAngle } = palette;

    if (pointArray.length < 2) {
      return;
    }

    // set color
    context.fillStyle = color;

    // stroke the points
    for (let pp = 1; pp < pointArray.length; pp += 1) {
      const currentPoint: Point = pointArray[pp];
      const lastPoint: Point = pointArray[pp - 1];

      const dist = distanceBetween(lastPoint, currentPoint);
      const angle = angleBetween(lastPoint, currentPoint);

      // interpolate
      for (let i = 0; i < dist; i += 1) {
        const x = lastPoint.x + (Math.sin(angle) * i);
        const y = lastPoint.y + (Math.cos(angle) * i);
        context.fillRect(x, y, brushSize, brushSize * brushAngle);
      }
    }
  }

  public replay(replayStrokes: StrokeList) {
    const frameRate: number = 1000 / 60; // FPS
    let lastFrameTime: number = null;
    const doReplay = (): void => {
      if (replayStrokes.length < 1) {
        return;
      }
      const now: number = Date.now();
      if (lastFrameTime != null && now - lastFrameTime < frameRate) {
        window.requestAnimationFrame(doReplay);
        return;
      }
      lastFrameTime = now;

      this.strokes.push(replayStrokes.shift());
      window.requestAnimationFrame(doReplay);
    };
    window.requestAnimationFrame(doReplay);
  }

  public clear() {
    this.resetCurrentStroke();
    this.strokes = [];
  }

  public undo() {
    this.strokes.pop();
  }

  public addStroke(stroke: Stroke) {
    this.strokes.push(stroke);
  }

  public addCurrentStrokePoint(point: Point) {
    this.currentStrokePoints.push(point);
  }

  public resetCurrentStroke() {
    this.currentStrokePoints = [];
  }

  public startDrawing() {
    this.resetCurrentStroke();
  }

  public endDrawing(palette: Palette): Stroke {
    // save the stroke and start a new stroke
    // strokes.push(currentStrokePoints);
    const newStroke: Stroke = [
      Brush.Pen,
      palette.getCurrentColorId(),
      this.currentStrokePoints,
      palette.getCurrentBrushSize(),
    ];
    this.addStroke(newStroke);
    this.resetCurrentStroke();

    return newStroke;
  }
}
