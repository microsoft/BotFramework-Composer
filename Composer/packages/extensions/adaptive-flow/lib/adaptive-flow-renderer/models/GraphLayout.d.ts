import { Boundary } from './Boundary';
import { GraphNode } from './GraphNode';
import { Edge } from './EdgeData';
export declare class GraphLayout {
  boundary: Boundary;
  nodes: GraphNode[];
  nodeMap: {
    [id: string]: GraphNode;
  };
  edges: Edge[];
}
//# sourceMappingURL=GraphLayout.d.ts.map
