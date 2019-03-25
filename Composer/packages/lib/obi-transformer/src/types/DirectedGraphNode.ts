import { GraphNodeTypes } from './GraphNodeTypes';

export class DirectedGraphNode<IdType, PayloadType> {
  id: IdType;
  type: GraphNodeTypes;
  payload: PayloadType;
}
