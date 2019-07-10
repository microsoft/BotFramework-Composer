import { Boundary } from '../shared/Boundary';
import {
  calculateSequenceBoundary,
  calculateSwitchCaseBoundary,
  calculateForeachBoundary,
} from '../layouters/calculateNodeBoundary';
import { DiamondSize, LoopIconSize } from '../shared/elementSizes';

import { FlowGroup, FlowBaseNode, FlowTypes, DecisionNode, LoopNode } from './models/LogicFlowNodes';

export const dfsVisitLogicFlow = (node: FlowBaseNode, visit: (node: FlowBaseNode) => void): void => {
  if (!node || !node['@']) return;

  switch (node['@']) {
    case FlowTypes.Flow:
      (node as FlowGroup).steps.forEach(x => dfsVisitLogicFlow(x, visit));
      break;
    case FlowTypes.Decision:
      (node as DecisionNode).branches.forEach(x => dfsVisitLogicFlow(x, visit));
      break;
    case FlowTypes.Loop:
      dfsVisitLogicFlow((node as LoopNode).flow, visit);
      break;
    case FlowTypes.Element:
    default:
      break;
  }
  visit(node);
};

export const calculateFlowNodeBoundary = (
  node: FlowBaseNode,
  measureBoundary: (id: string, nodeType: FlowTypes, data: any) => Boundary
): void => {
  if (!node || !node['@']) return;
  switch (node['@']) {
    case FlowTypes.Flow:
      node.boundary = calculateSequenceBoundary((node as FlowGroup).steps.map(x => x.boundary));
      break;
    case FlowTypes.Decision:
      node.boundary = calculateSwitchCaseBoundary(
        measureBoundary(node.id, node['@'], node.data),
        new Boundary(DiamondSize.width, DiamondSize.height),
        (node as DecisionNode).branches.map(x => x.boundary)
      );
      break;
    case FlowTypes.Loop:
      node.boundary = calculateForeachBoundary(
        measureBoundary(node.id, node['@'], node.data),
        (node as LoopNode).flow.boundary,
        new Boundary(LoopIconSize.width, LoopIconSize.height),
        new Boundary(LoopIconSize.width, LoopIconSize.height)
      );
      break;
    case FlowTypes.Element:
    default:
      node.boundary = measureBoundary(node.id, node['@'], node.data);
      break;
  }
};
