import React from 'react';

import { Boundary } from '../shared/Boundary';
import { OffsetContainer } from '../shared/OffsetContainer';
import { measureJsonBoundary } from '../layouters/measureJsonBoundary';
import { Diamond } from '../components/nodes/templates/Diamond';
import { ObiTypes } from '../shared/ObiTypes';

import { FlowGroup, ElementNode, FlowBaseNode, DecisionNode, LoopNode, FlowTypes } from './LogicFlowNodes';

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
  if (flowNode['@'] === FlowTypes.Flow) return renderFlowGroup(flowNode as FlowGroup);
  if (flowNode['@'] === FlowTypes.Element) return renderElementNode(flowNode as ElementNode);
  if (flowNode['@'] === FlowTypes.Decision) return renderDecisionNode(flowNode as DecisionNode);
  if (flowNode['@'] === FlowTypes.Loop) return renderLoopNode(flowNode as LoopNode);

  return <div>{JSON.stringify(flowNode)}</div>;
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

const defaultElementBoundary = new Boundary(100, 100);

const renderElementNode = (elementNode: ElementNode): JSX.Element => {
  const boundary = elementNode.boundary || defaultElementBoundary;
  return (
    <div
      style={{
        width: boundary.width,
        height: boundary.height,
        overflow: 'hidden',
      }}
    >
      {elementNode.element || JSON.stringify(elementNode)}
    </div>
  );
};

const renderDecisionNode = (decisionNode: DecisionNode): JSX.Element => (
  <div>
    <p style={{ width: 200, height: 50, border: '1px solid blue', overflow: 'hidden' }}>
      {JSON.stringify(decisionNode.data)}
    </p>
    <Diamond onClick={() => {}} />
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      {decisionNode.branches.map(x => {
        const boundary = measureJsonBoundary({ $type: ObiTypes.StepGroup, children: x.data });
        return (
          <NodeContainer key={x.id} boundary={boundary}>
            {renderFlowGroup(x)}
          </NodeContainer>
        );
      })}
    </div>
  </div>
);

const renderLoopNode = (loopNode: LoopNode): JSX.Element => <p>{JSON.stringify(loopNode.data)}</p>;

export const LogicFlow: React.SFC<LogicFlowProps> = ({ flow, onEvent }) => {
  console.log('flow', flow);
  return <div>{renderFlowGroup(flow)}</div>;
};
