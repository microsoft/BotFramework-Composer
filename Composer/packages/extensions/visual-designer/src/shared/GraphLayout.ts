import { Boundary } from './Boundary';
import { GraphNode } from './GraphNode';
import { EdgeData } from './EdgeData';

export class GraphLayout {
  boundary: Boundary = new Boundary();
  nodes?: GraphNode[] = [];
  nodeMap?: { [id: string]: GraphNode } = {};
  edges?: EdgeData[] = [];
}
