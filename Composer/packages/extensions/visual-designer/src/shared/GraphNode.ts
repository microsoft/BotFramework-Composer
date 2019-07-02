import { measureJsonBoundary } from '../layouters/measureJsonBoundary';

import { Boundary } from './Boundary';

export class GraphNode {
  id = '';
  data = {};
  boundary = new Boundary();
  offset = { x: 0, y: 0 };

  constructor(id = '', data = {}) {
    this.id = id;
    this.data = data;
  }

  static fromIndexedJson(indexedJson) {
    if (!indexedJson) return null;
    const node = new GraphNode(indexedJson.id, indexedJson.json);
    node.boundary = measureJsonBoundary(indexedJson.json);
    return node;
  }
}
