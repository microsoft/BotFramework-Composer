import { Boundary } from '../shared/Boundary';
import {
  calculateSequenceBoundary,
  calculateSwitchCaseBoundary,
  calculateForeachBoundary,
} from '../layouters/calculateNodeBoundary';
import { DiamondSize, LoopIconSize } from '../shared/elementSizes';
import { GraphNode } from '../shared/GraphNode';

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
      node.boundary = calculateSequenceBoundary(
        (node as FlowGroup).steps.map(x => new GraphNode(x.id, x.data, x.boundary))
      );
      break;
    case FlowTypes.Decision:
      node.boundary = calculateSwitchCaseBoundary(
        new GraphNode(node.id, node.data, measureBoundary(node.id, node['@'], node.data)),
        new GraphNode(node.id, {}, new Boundary(DiamondSize.width, DiamondSize.height)),
        (node as DecisionNode).branches.map(x => new GraphNode(x.id, x.data, x.boundary))
      );
      break;
    case FlowTypes.Loop:
      node.boundary = calculateForeachBoundary(
        new GraphNode(node.id, node.data, measureBoundary(node.id, node['@'], node.data)),
        new GraphNode(node.id, {}, (node as LoopNode).flow.boundary),
        new GraphNode(node.id, {}, new Boundary(LoopIconSize.width, LoopIconSize.height)),
        new GraphNode(node.id, {}, new Boundary(LoopIconSize.width, LoopIconSize.height))
      );
      break;
    case FlowTypes.Element:
    default:
      node.boundary = measureBoundary(node.id, node['@'], node.data);
      break;
  }
};
