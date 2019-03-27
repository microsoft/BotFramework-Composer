export interface StringMap<T> {
  [key: string]: T;
}

export interface Coord2d {
  x: number;
  y: number;
}

export interface BoundingBox {
  topLeft: Coord2d;
  bottomRight: Coord2d;
}

export interface NodeSize {
  width: number;
  height: number;
}

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EdgeOptions {
  isAnchorVisible?: boolean;
  isReceptorVisible?: boolean;
  customPathClassName?: string;

  // NOTE(lin): The edge segment near an anchor can optionally start with a straight line instead of immediately a Bezier curve.
  anchorAttachmentStraightlineLength?: number;
}

// NOTE(lin): In a multi-graph, two nodes may share more than one edge in the same direction.
// So we need an edge Id to differentiate among these parallel edges.
// The edgeId doesn't have to be unique outside of the source-target node pairs.
// We need all three id properties to uniquely identify an edge in the whole graph.
export interface GraphEdge {
  sourceNodeId: string;
  targetNodeId: string;
  localEdgeId: string;
  options?: EdgeOptions;
}

export interface EdgeTargetChangedData {
  sourceNodeId: string;
  localEdgeId: string;
  newTargetNodeId: string;
}

export type GraphFlexDirection = 'Horizontal' | 'Vertical';

export type EdgeDragAndDropTargetType = 'Anchor' | 'Receptor';

export interface EdgeDragData {
  edgeId: string;
  localEdgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  dragTargetType: EdgeDragAndDropTargetType;
  startAnchorPoint: Coord2d;
  startReceptorPoint: Coord2d;
  startPosition: Coord2d;
  currentPosition: Coord2d;
}

export interface EdgeDropData {
  edgeId: string;
  receivingNodeId: string;
  receivingLocalEdgeId?: string;
  dropTargetType: EdgeDragAndDropTargetType;
}
