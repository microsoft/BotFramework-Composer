import React from 'react';

import { Boundary } from '../shared/Boundary';
import { OffsetContainer } from '../shared/OffsetContainer';
import { measureJsonBoundary } from '../layouters/measureJsonBoundary';
import { Diamond } from '../components/nodes/templates/Diamond';
import { ObiTypes } from '../shared/ObiTypes';
import { sequentialLayouter } from '../layouters/sequentialLayouter';
import { Edge } from '../components/shared/EdgeComponents';
import { DiamondSize } from '../shared/elementSizes';
import { switchCaseLayouter } from '../layouters/switchCaseLayouter';

import { FlowGroup, ElementNode, FlowBaseNode, DecisionNode, LoopNode, FlowTypes } from './LogicFlowNodes';
import { GraphBox } from './GraphBox';

export interface LogicFlowProps {
  flow: FlowGroup;
  onEvent: (id: string, event: any) => any;
}

const renderNode = (flowNode: FlowBaseNode): JSX.Element => {
  if (flowNode['@'] === FlowTypes.Flow) return renderFlowGroup(flowNode as FlowGroup);
  if (flowNode['@'] === FlowTypes.Element) return renderElementNode(flowNode as ElementNode);
  if (flowNode['@'] === FlowTypes.Decision) return renderDecisionNode(flowNode as DecisionNode);
  if (flowNode['@'] === FlowTypes.Loop) return renderLoopNode(flowNode as LoopNode);

  return <div>{JSON.stringify(flowNode)}</div>;
};

const renderFlowGroup = (flowGroup: FlowGroup): JSX.Element => {
  let flowBoxes = flowGroup.flow.map(
    (x, index) => new GraphBox(`${flowGroup.id}[${index}]`, measureJsonBoundary(x.data))
  );
  const layout = sequentialLayouter(flowBoxes);
  flowBoxes = layout.nodes;

  return (
    <div style={{ position: 'relative', width: layout.boundary.width, height: layout.boundary.height }}>
      {(layout.edges || []).map(x => (
        <Edge key={x.id} {...x} />
      ))}
      {flowGroup.flow.map((x: any, index: number) => (
        <OffsetContainer key={`FlowGroup/${x.id}[${index}]/node/offset`} offset={flowBoxes[index].offset}>
          {renderNode(x)}
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

const renderDecisionNode = (decisionNode: DecisionNode): JSX.Element => {
  const conditionBox = new GraphBox(decisionNode.id, measureJsonBoundary(decisionNode.condition.data));
  const diamondBox = new GraphBox(decisionNode.id, new Boundary(DiamondSize.width, DiamondSize.height));
  const branchBoxes = decisionNode.branches.map(x => {
    const box = new GraphBox(`${x.id}`, measureJsonBoundary({ $type: ObiTypes.StepGroup, children: x.data }));
    box.data = x;
    return box;
  });

  const layout = switchCaseLayouter(conditionBox, diamondBox, branchBoxes);
  const { conditionNode, choiceNode, branchNodes } = layout.nodeMap as any;

  return (
    <div
      className="LogicflowNode--decision"
      style={{ width: layout.boundary.width, height: layout.boundary.height, position: 'relative' }}
    >
      {(layout.edges || []).map(x => (
        <Edge key={x.id} {...x} />
      ))}
      <OffsetContainer offset={conditionNode.offset}>{renderNode(decisionNode.condition)}</OffsetContainer>
      <OffsetContainer offset={choiceNode.offset}>
        <Diamond onClick={() => {}} />
      </OffsetContainer>
      {decisionNode.branches.map((x, index) => {
        return (
          <OffsetContainer key={`Decision/${x.id}/offset`} offset={branchNodes[index].offset}>
            {renderFlowGroup(x)}
          </OffsetContainer>
        );
      })}
    </div>
  );
};

const renderLoopNode = (loopNode: LoopNode): JSX.Element => <p>{JSON.stringify(loopNode.data)}</p>;

export const LogicFlow: React.SFC<LogicFlowProps> = ({ flow, onEvent }) => {
  console.log('flow', flow);
  return <div>{renderFlowGroup(flow)}</div>;
};
