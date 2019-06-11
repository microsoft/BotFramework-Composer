import { measureNodeBoundary } from '../layouters/measureNodeBoundary';

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
}

GraphNode.fromIndexedJson = indexedJson => {
  if (!indexedJson) return null;
  const node = new GraphNode(indexedJson.id, indexedJson.json);
  node.boundary = measureNodeBoundary(indexedJson.json);
  return node;
};
