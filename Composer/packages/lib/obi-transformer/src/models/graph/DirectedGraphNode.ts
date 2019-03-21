import { GraphNodeTypes } from './types/NodeTypes';

export class DirectedGraphNode<IdType, PayloadType> {
  id: IdType;
  neighborIds: IdType[];

  type: GraphNodeTypes;
  payload: PayloadType;
}
