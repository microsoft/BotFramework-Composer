import { GraphNodeTypes } from './types/NodeTypes';

export class DirectedGraphNode<IdType, PayloadType> {
  id: IdType;
  type: GraphNodeTypes;
  payload: PayloadType;
}
