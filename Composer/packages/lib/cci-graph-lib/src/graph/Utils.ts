import { Coord2d } from './GraphSchemas';

export function equals(p0: Coord2d, p1: Coord2d): boolean {
  return p0.x === p1.x && p0.y === p1.y;
}

export function notEquals(p0: Coord2d, p1: Coord2d): boolean {
  return !equals(p0, p1);
}

export function getGlobalEdgeId(sourceNodeId: string, targetNodeId: string, localEdgeId: string): string {
  return [sourceNodeId, targetNodeId, localEdgeId].join('_');
}
