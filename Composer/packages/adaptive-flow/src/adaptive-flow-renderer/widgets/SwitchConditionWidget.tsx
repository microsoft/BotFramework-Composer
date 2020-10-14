// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FunctionComponent, useMemo, useContext } from 'react';
import { WidgetContainerProps } from '@bfc/extension-client';

import { NodeEventTypes } from '../constants/NodeEventTypes';
import { transformSwitchCondition } from '../transformers/transformSwitchCondition';
import { switchCaseLayouter } from '../layouters/switchCaseLayouter';
import { GraphNode } from '../models/GraphNode';
import { OffsetContainer } from '../components/OffsetContainer';
import { Diamond } from '../components/Diamond';
import { ElementMeasurer } from '../components/ElementMeasurer';
import { SVGContainer } from '../components/SVGContainer';
import { GraphNodeMap, useSmartLayout } from '../hooks/useSmartLayout';
import { designerCache } from '../utils/visual/DesignerCache';
import { FlowEdges } from '../components/FlowEdges';
import { RendererContext } from '../contexts/RendererContext';

import { ActionGroup } from './ActionGroup';

enum SwitchNodes {
  Switch = 'switchNode',
  Choice = 'choiceNode',
}

type CaseNodeKey = string;

const getCaseKey = (caseIndex: number): CaseNodeKey => `cases[${caseIndex}]`;
const parseCaseIndex = (caseKey: CaseNodeKey): number => parseInt(caseKey.replace(/cases\[(\d+)\]/, '$1'));

const calculateNodeMap = (path: string, data): GraphNodeMap<SwitchNodes | CaseNodeKey> => {
  const result = transformSwitchCondition(data, path);
  if (!result)
    return {
      [SwitchNodes.Switch]: new GraphNode(),
      [SwitchNodes.Choice]: new GraphNode(),
    };

  const { condition, choice, branches } = result;
  const nodeMap = {
    [SwitchNodes.Switch]: GraphNode.fromIndexedJson(condition),
    [SwitchNodes.Choice]: GraphNode.fromIndexedJson(choice),
  };

  branches.forEach((branch, index) => {
    const key = getCaseKey(index);
    const value = GraphNode.fromIndexedJson(branch);
    nodeMap[key] = value;
  });

  return nodeMap;
};

const calculateLayout = (nodeMap: GraphNodeMap<SwitchNodes | CaseNodeKey>) => {
  const { switchNode, choiceNode, ...cases } = nodeMap as GraphNodeMap<SwitchNodes>;
  const casesNodes = Object.keys(cases)
    .sort((a, b) => parseCaseIndex(a) - parseCaseIndex(b))
    .map((caseName) => nodeMap[caseName]);
  return switchCaseLayouter(switchNode, choiceNode, casesNodes);
};

export interface SwitchConditionWidgetProps extends WidgetContainerProps {
  judgement: JSX.Element;
}

export const SwitchConditionWidget: FunctionComponent<SwitchConditionWidgetProps> = ({
  id,
  data,
  onEvent,
  onResize,
  judgement,
}) => {
  const { NodeWrapper } = useContext(RendererContext);
  const nodeMap = useMemo(() => calculateNodeMap(id, data), [id, data]);
  const { layout, updateNodeBoundary } = useSmartLayout<SwitchNodes | CaseNodeKey>(nodeMap, calculateLayout, onResize);

  const { boundary, edges } = layout;
  const { switchNode, choiceNode, ...cases } = nodeMap as GraphNodeMap<SwitchNodes>;
  const casesNodes = Object.keys(cases).map((x) => nodeMap[x]);

  return (
    <div css={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
      <SVGContainer height={boundary.height} width={boundary.width}>
        <FlowEdges edges={edges} />
      </SVGContainer>
      <OffsetContainer offset={switchNode.offset}>
        <NodeWrapper nodeData={data} nodeId={switchNode.id} onEvent={onEvent}>
          <ElementMeasurer
            onResize={(boundary) => {
              designerCache.cacheBoundary(switchNode.data, boundary);
              updateNodeBoundary(SwitchNodes.Switch, boundary);
            }}
          >
            {judgement}
          </ElementMeasurer>
        </NodeWrapper>
      </OffsetContainer>
      <OffsetContainer css={{ zIndex: 100 }} offset={choiceNode.offset}>
        <Diamond
          data-testid="SwitchConditionDiamond"
          onClick={() => {
            onEvent(NodeEventTypes.Focus, { id });
          }}
        />
      </OffsetContainer>
      {(casesNodes as any).map((x, index) => (
        <OffsetContainer key={`${x.id}/offset`} offset={x.offset}>
          <ActionGroup
            key={x.id}
            data={x.data}
            id={x.id}
            onEvent={onEvent}
            onResize={(size) => {
              updateNodeBoundary(getCaseKey(index), size);
            }}
          />
        </OffsetContainer>
      ))}
    </div>
  );
};

SwitchConditionWidget.defaultProps = {
  onResize: () => null,
};
