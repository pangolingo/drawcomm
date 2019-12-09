import { Point } from './types';

export function distanceBetween(point1: Point, point2: Point): number {
  return Math.hypot(point2.x - point1.x, point2.y - point1.y);
}
export function angleBetween(point1: Point, point2: Point): number {
  return Math.atan2(point2.x - point1.x, point2.y - point1.y);
}
