import { FlowTypes } from '../logicflow/models/LogicFlowNodes';
import { Boundary } from '../shared/Boundary';
import { InitNodeSize } from '../shared/elementSizes';

export const measureObiData = (id: string, type: FlowTypes, data: any) => {
  return new Boundary(InitNodeSize.width, InitNodeSize.height);
};
