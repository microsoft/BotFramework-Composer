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
  return new GraphNode(indexedJson.id, indexedJson.json);
};
