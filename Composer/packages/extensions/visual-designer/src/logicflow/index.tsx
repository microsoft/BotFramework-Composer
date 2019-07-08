import React from 'react';

import { Boundary } from '../shared/Boundary';
import { OffsetContainer } from '../shared/OffsetContainer';
import { measureJsonBoundary } from '../layouters/measureJsonBoundary';

import { FlowGroup, ElementNode, FlowBaseNode, DecisionNode, LoopNode } from './LogicFlowNodes';

export interface LogicFlowProps {
  flow: FlowGroup;
  onEvent: (id: string, event: any) => any;
}

const NodeContainer: React.SFC<{ boundary: Boundary }> = ({ boundary, children }) => (
  <div style={{ width: boundary.width, height: boundary.height, border: '1px solid grey', overflow: 'hidden' }}>
    {children}
  </div>
);

const renderNode = (flowNode: FlowBaseNode): JSX.Element => {
  if (flowNode instanceof FlowGroup) return renderFlowGroup(flowNode);
  if (flowNode instanceof ElementNode) return renderElementNode(flowNode);
  if (flowNode instanceof DecisionNode) return renderDecisionNode(flowNode);
  if (flowNode instanceof LoopNode) return renderLoopNode(flowNode);

  return renderElementNode(flowNode);
};

const renderFlowGroup = (flowGroup: FlowGroup): JSX.Element => {
  const flowBoxes = flowGroup.flow.map(x => {
    return {
      boundary: measureJsonBoundary(x.data),
      offset: { x: 0, y: 0 },
    };
  });
  const axisX = Math.max(...flowBoxes.map(x => x.boundary.axisX));

  flowBoxes.forEach(x => {
    x.offset.x = axisX - x.boundary.axisX;
  });
  flowBoxes.reduce((sumOffsetY, x: any, index: number) => {
    x.offset.y = sumOffsetY + 20;
    return x.offset.y + x.boundary.height;
  }, 0);

  return (
    <div style={{ position: 'relative' }}>
      {flowGroup.flow.map((x: any, index: number) => (
        <OffsetContainer key={x.id} offset={flowBoxes[index].offset}>
          <NodeContainer boundary={flowBoxes[index].boundary}>{renderNode(x)}</NodeContainer>
        </OffsetContainer>
      ))}
    </div>
  );
};

const renderElementNode = (elementNode: ElementNode): JSX.Element => <p>{JSON.stringify(elementNode.data)}</p>;

const renderDecisionNode = (decisionNode: DecisionNode): JSX.Element => <p>{JSON.stringify(decisionNode.data)}</p>;

const renderLoopNode = (loopNode: LoopNode): JSX.Element => <p>{JSON.stringify(loopNode.data)}</p>;

export const LogicFlow: React.SFC<LogicFlowProps> = ({ flow, onEvent }) => {
  console.log('flow', flow);
  return <div>{renderFlowGroup(flow)}</div>;
};
