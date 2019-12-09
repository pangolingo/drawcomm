import { Point } from './types';

export function distanceBetween(point1: Point, point2: Point): number {
  //return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
  return Math.hypot(point2.x - point1.x, point2.y - point1.y)
}
export function angleBetween(point1: Point, point2: Point): number {
  return Math.atan2( point2.x - point1.x, point2.y - point1.y );
}