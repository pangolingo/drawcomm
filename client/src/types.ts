export type Point = {
  x: number,
  y: number
}

export enum Brush {
  Pen = 'pen'
}
export type BrushSize = number;
export type PointList = Array<Point>;
export type ColorId = number;

export type Stroke = [
  Brush,
  ColorId,
  PointList,
  BrushSize,
]
export type StrokeList = Array<Stroke>
