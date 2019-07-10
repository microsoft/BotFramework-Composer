import { measureJsonBoundary } from '../layouters/measureJsonBoundary';
import { IndexedNode } from '../transformers/models/IndexedNode';

import { Boundary } from './Boundary';

class CoordPoint {
  x: number;
  y: number;
  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }
}

export class GraphNode {
  id = '';
  data: any = {};
  boundary: Boundary;
  offset: CoordPoint = new CoordPoint();

  constructor(id = '', data = {}, boundary = new Boundary()) {
    this.id = id;
    this.data = data;
    this.boundary = boundary;
  }

  static fromIndexedJson(indexedJson: IndexedNode): GraphNode {
    if (!indexedJson) throw new Error('Invalid input json');
    const node = new GraphNode(indexedJson.id, indexedJson.json);
    node.boundary = measureJsonBoundary(indexedJson.json);
    return node;
  }
}
