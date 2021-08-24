// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FunctionComponent, useMemo, useContext } from 'react';
import { WidgetContainerProps } from '@bfc/extension-client';

import { GraphNode } from '../models/GraphNode';
import { OffsetContainer } from '../components/OffsetContainer';
import { ElementMeasurer } from '../components/ElementMeasurer';
import { SVGContainer } from '../components/SVGContainer';
import { GraphNodeMap, useSmartLayout } from '../hooks/useSmartLayout';
import { designerCache } from '../utils/visual/DesignerCache';
import { FlowEdges } from '../components/FlowEdges';
import { RendererContext } from '../contexts/RendererContext';
import { transformQuestion } from '../transformers/transformQuestion';
import { questionLayouter } from '../layouters/questionLayouter';

import { ActionGroup } from './ActionGroup';

enum QuestionNodes {
  Question = 'questionNode',
  Choice = 'choiceNode',
}

type CaseNodeKey = string;

const getCaseKey = (caseIndex: number): CaseNodeKey => `cases[${caseIndex}]`;
const parseCaseIndex = (caseKey: CaseNodeKey): number => parseInt(caseKey.replace(/cases\[(\d+)\]/, '$1'));

const calculateNodeMap = (path: string, data): GraphNodeMap<QuestionNodes | CaseNodeKey> => {
  const result = transformQuestion(data, path);
  if (!result)
    return {
      [QuestionNodes.Question]: new GraphNode(),
      [QuestionNodes.Choice]: new GraphNode(),
    };

  const { question, branches } = result;
  const nodeMap = {
    [QuestionNodes.Question]: GraphNode.fromIndexedJson(question),
  };

  branches.forEach((branch, index) => {
    const key = getCaseKey(index);
    const value = GraphNode.fromIndexedJson(branch);
    nodeMap[key] = value;
  });

  return nodeMap;
};

const calculateLayout = (nodeMap: GraphNodeMap<QuestionNodes | CaseNodeKey>) => {
  const { questionNode, ...cases } = nodeMap as GraphNodeMap<QuestionNodes>;
  const casesNodes = Object.keys(cases)
    .sort((a, b) => parseCaseIndex(a) - parseCaseIndex(b))
    .map((caseName) => nodeMap[caseName]);
  return questionLayouter(questionNode, casesNodes);
};

export interface QuestionWidgetProps extends WidgetContainerProps {
  question: JSX.Element;
}

export const QuestionWidget: FunctionComponent<QuestionWidgetProps> = ({ id, data, onEvent, onResize, question }) => {
  const { NodeWrapper } = useContext(RendererContext);
  const nodeMap = useMemo(() => calculateNodeMap(id, data), [id, data]);
  const { layout, updateNodeBoundary } = useSmartLayout<QuestionNodes | CaseNodeKey>(
    nodeMap,
    calculateLayout,
    onResize
  );

  const { boundary, edges } = layout;
  const { questionNode, ...cases } = nodeMap as GraphNodeMap<QuestionNodes>;
  const casesNodes = Object.keys(cases).map((x) => nodeMap[x]);

  return (
    <div css={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
      <SVGContainer height={boundary.height} width={boundary.width}>
        <FlowEdges edges={edges} />
      </SVGContainer>
      <OffsetContainer offset={questionNode.offset}>
        <NodeWrapper nodeData={data} nodeId={questionNode.id} onEvent={onEvent}>
          <ElementMeasurer
            onResize={(boundary) => {
              designerCache.cacheBoundary(questionNode.data, boundary);
              updateNodeBoundary(QuestionNodes.Question, boundary);
            }}
          >
            {/* replace with the question node */}
            {question}
          </ElementMeasurer>
        </NodeWrapper>
      </OffsetContainer>
      {/* <OffsetContainer css={{ zIndex: 100 }} offset={choiceNode.offset}>
        <Diamond
          data-testid="SwitchConditionDiamond"
          onClick={() => {
            onEvent(NodeEventTypes.Focus, { id });
          }}
        />
      </OffsetContainer> */}
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

QuestionWidget.defaultProps = {
  onResize: () => null,
};
