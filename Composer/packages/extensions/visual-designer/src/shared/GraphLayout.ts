import { Boundary } from './Boundary';
import { GraphNode } from './GraphNode';

export class GraphLayout {
  boundary: Boundary = new Boundary();
  nodes?: GraphNode[] = [];
  nodeMap?: any = {};
  edges?: any[] = [];
}
