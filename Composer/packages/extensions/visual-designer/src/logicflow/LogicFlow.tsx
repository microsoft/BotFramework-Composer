import React, { Fragment } from 'react';

import { Boundary } from '../shared/Boundary';
import { OffsetContainer } from '../shared/OffsetContainer';
import { Diamond } from '../components/nodes/templates/Diamond';
import { sequentialLayouter } from '../layouters/sequentialLayouter';
import { Edge } from '../components/shared/EdgeComponents';
import { DiamondSize, LoopIconSize, EdgeAddButtonSize, ElementInterval } from '../shared/elementSizes';
import { switchCaseLayouter } from '../layouters/switchCaseLayouter';
import { foreachLayouter } from '../layouters/foreachLayouter';
import { LoopIndicator } from '../components/nodes/templates/LoopIndicator';

import { FlowGroup, FlowBaseNode, DecisionNode, LoopNode, FlowTypes } from './models/LogicFlowNodes';
import { GraphBox } from './models/GraphBox';

export interface LogicFlowProps {
  flow: FlowGroup;
  measureData: (id: string, nodeType: FlowTypes, nodeData: any) => Boundary;
  renderData: (id: string, nodeType: FlowTypes, nodeData: any) => JSX.Element;
  renderStepInsertionPoint: (arrayId: string, index: number) => JSX.Element;
  onEvent: (id: string, event: any) => any;
}

export const LogicFlow: React.SFC<LogicFlowProps> = ({
  flow,
  renderData,
  measureData,
  renderStepInsertionPoint,
  onEvent,
}) => {
  const renderNode = (flowNode: FlowBaseNode): JSX.Element => {
    if (flowNode['@'] === FlowTypes.Flow) return renderFlowGroup(flowNode as FlowGroup);
    if (flowNode['@'] === FlowTypes.Decision) return renderDecisionNode(flowNode as DecisionNode);
    if (flowNode['@'] === FlowTypes.Loop) return renderLoopNode(flowNode as LoopNode);

    return renderData(flowNode.id, flowNode['@'], flowNode.data);
  };

  const renderFlowGroup = (flowGroup: FlowGroup): JSX.Element => {
    const flowSteps = flowGroup.steps || [];
    let flowBoxes = flowSteps.map(
      (x, index) => new GraphBox(`${flowGroup.id}[${index}]`, measureData(x.id, x['@'], x.data))
    );
    const layout = sequentialLayouter(flowBoxes);
    flowBoxes = layout.nodes;

    return (
      <div style={{ position: 'relative', width: layout.boundary.width, height: layout.boundary.height }}>
        {(layout.edges || []).map(x => (
          <Edge key={x.id} {...x} />
        ))}
        {flowSteps.map((x: any, index: number) => (
          <OffsetContainer key={`FlowGroup/${x.id}[${index}]/node/offset`} offset={flowBoxes[index].offset}>
            {renderNode(x)}
          </OffsetContainer>
        ))}
        {renderStepInsertionPoint ? (
          <Fragment>
            <OffsetContainer
              offset={{ x: layout.boundary.axisX - EdgeAddButtonSize.width / 2, y: 0 - EdgeAddButtonSize.height / 2 }}
              styles={{ zIndex: 100 }}
            >
              {renderStepInsertionPoint(flowGroup.id, 0)}
            </OffsetContainer>
            {flowSteps.map((x: any, index: number) => {
              const box = flowBoxes[index];
              return (
                <OffsetContainer
                  key={`FlowGroup/offset/${flowGroup.id}/footer/${x.id}`}
                  offset={{
                    x: layout.boundary.axisX - EdgeAddButtonSize.width / 2,
                    y: box.offset.y + box.boundary.height + ElementInterval.y / 2 - EdgeAddButtonSize.height / 2,
                  }}
                  styles={{ zIndex: 100 }}
                >
                  {renderStepInsertionPoint(flowGroup.id, index + 1)}
                </OffsetContainer>
              );
            })}
          </Fragment>
        ) : null}
      </div>
    );
  };

  const renderDecisionNode = (decisionNode: DecisionNode): JSX.Element => {
    const conditionBox = new GraphBox(
      decisionNode.id,
      measureData(decisionNode.id, FlowTypes.Element, decisionNode.data)
    );
    const diamondBox = new GraphBox(decisionNode.id, new Boundary(DiamondSize.width, DiamondSize.height));
    const branchBoxes = decisionNode.branches.map(x => {
      const box = new GraphBox(`${x.id}`, measureData(x.id, x['@'], x.data));
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
        <OffsetContainer offset={conditionNode.offset}>
          {renderData(decisionNode.id, decisionNode['@'], decisionNode.data)}
        </OffsetContainer>
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

  const renderLoopNode = (loopNode: LoopNode): JSX.Element => {
    const loopFlow = loopNode.flow || new FlowGroup(loopNode.id, [], '', []);
    const loopStepBox = new GraphBox(loopFlow.id, measureData(loopFlow.id, loopFlow['@'], loopFlow.data));

    const detailBox = new GraphBox(loopNode.id, measureData(loopNode.id, FlowTypes.Element, loopNode.data));
    const loopBeginBox = new GraphBox(loopNode.id, new Boundary(LoopIconSize.width, LoopIconSize.height));
    const loopEndBox = new GraphBox(loopNode.id, new Boundary(LoopIconSize.width, LoopIconSize.height));

    const layout = foreachLayouter(detailBox, loopStepBox, loopBeginBox, loopEndBox);
    const { foreachNode, stepsNode, loopBeginNode, loopEndNode } = layout.nodeMap as any;

    return (
      <div
        className="LogicflowNode--loop"
        style={{ width: layout.boundary.width, height: layout.boundary.height, position: 'relative' }}
      >
        {(layout.edges || []).map(x => (
          <Edge key={x.id} {...x} />
        ))}
        <OffsetContainer offset={foreachNode.offset}>
          {renderData(loopNode.id, loopNode['@'], loopNode.data)}
        </OffsetContainer>
        <OffsetContainer offset={stepsNode.offset}>{renderFlowGroup(loopFlow)}</OffsetContainer>
        {[loopBeginNode, loopEndNode]
          .filter(x => !!x)
          .map((x, index) => (
            <OffsetContainer key={`${loopNode.id}/loopicon-${index}/offset`} offset={x.offset}>
              <LoopIndicator onClick={() => {}} />
            </OffsetContainer>
          ))}
      </div>
    );
  };

  console.log('flow', flow);
  return <div>{renderFlowGroup(flow)}</div>;
};
