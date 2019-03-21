import { DirectedGraphNode } from './models/graph/DirectedGraphNode';
import { ObiSchema } from './models/obi/ObiSchema';
import { GraphNodeTypes } from './models/graph/types/NodeTypes';

type NumberIndexedNode = DirectedGraphNode<number, any>;

export class ObiTransformer {
  public toDirectedGraphSchema(obiJson: ObiSchema): NumberIndexedNode[] {
    const { rules } = obiJson;
    const nodes = rules.map((rule, index) => {
      return {
        id: index,
        type: GraphNodeTypes.Process,
        payload: rule,
        neighborIds: [],
      } as NumberIndexedNode;
    });

    for (let i = 0; i < nodes.length - 1; i++) {
      nodes[i].neighborIds.push(nodes[i + 1].id);
    }
    return nodes;
  }
}
