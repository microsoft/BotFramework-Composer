// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, FunctionComponent, useContext } from 'react';

import { GraphNode } from '../models/GraphNode';
import { sequentialLayouter } from '../layouters/sequentialLayouter';
import { ElementInterval, EdgeAddButtonSize } from '../constants/ElementSizes';
import { transformStepGroup } from '../transformers/transformStepGroup';
import { NodeProps, defaultNodeProps } from '../components/nodes/nodeProps';
import { OffsetContainer } from '../components/lib/OffsetContainer';
import { StepRenderer } from '../components/renderers/StepRenderer';
import { GraphLayout } from '../models/GraphLayout';
import { SVGContainer } from '../components/lib/SVGContainer';
import { GraphNodeMap, useSmartLayout } from '../hooks/useSmartLayout';
import { designerCache } from '../store/DesignerCache';
import { FlowEdges } from '../components/lib/FlowEdges';
import { FlowRendererContext } from '../store/FlowRendererContext';

const StepInterval = ElementInterval.y;

type StepNodeKey = string;

const getStepKey = (stepOrder: number): StepNodeKey => `steps[${stepOrder}]`;
const parseStepIndex = (stepKey: string): number => parseInt(stepKey.replace(/steps\[(\d+)\]/, '$1'));

const calculateNodes = (groupId: string, data): GraphNodeMap<StepNodeKey> => {
  const steps = transformStepGroup(data, groupId);
  const stepNodes = steps.map((x): GraphNode => GraphNode.fromIndexedJson(x));
  return stepNodes.reduce((result, node, index) => {
    result[getStepKey(index)] = node;
    return result;
  }, {} as GraphNodeMap<StepNodeKey>);
};

const calculateLayout = (nodeMap: GraphNodeMap<StepNodeKey>): GraphLayout => {
  const nodes = Object.keys(nodeMap)
    .sort((a, b) => parseStepIndex(a) - parseStepIndex(b))
    .map(stepName => nodeMap[stepName]);
  return sequentialLayouter(nodes);
};

export const ActionGroup: FunctionComponent<NodeProps> = ({ id, data, onEvent, onResize }: NodeProps): JSX.Element => {
  const { EdgeMenu } = useContext(FlowRendererContext);
  const initialNodes = useMemo(() => calculateNodes(id, data), [id, data]);
  const { layout, updateNodeBoundary } = useSmartLayout(initialNodes, calculateLayout, onResize);

  const { boundary, nodes, edges } = layout;

  return (
    <div css={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
      <SVGContainer width={boundary.width} height={boundary.height} hidden>
        <FlowEdges edges={edges} />
      </SVGContainer>
      {nodes
        ? nodes.map((node, index) => (
            <OffsetContainer key={`stepGroup/${node.id}/offset`} offset={node.offset}>
              <StepRenderer
                key={`stepGroup/${node.id}`}
                id={node.id}
                data={node.data}
                onEvent={onEvent}
                onResize={size => {
                  designerCache.cacheBoundary(node.data, size);
                  updateNodeBoundary(getStepKey(index), size);
                }}
              />
            </OffsetContainer>
          ))
        : null}
      <OffsetContainer
        offset={{ x: boundary.axisX - EdgeAddButtonSize.width / 2, y: 0 - EdgeAddButtonSize.height / 2 }}
        css={{ zIndex: 100 }}
      >
        <EdgeMenu arrayId={id} arrayData={data} arrayPosition={0} onEvent={onEvent} />
      </OffsetContainer>
      {nodes
        ? nodes.map((x, idx) => (
            <OffsetContainer
              key={`stepGroup/${x.id}/footer/offset`}
              offset={{
                x: boundary.axisX - EdgeAddButtonSize.width / 2,
                y: x.offset.y + x.boundary.height + StepInterval / 2 - EdgeAddButtonSize.height / 2,
              }}
              css={{ zIndex: 100 }}
            >
              <EdgeMenu arrayId={id} arrayData={data} arrayPosition={idx + 1} onEvent={onEvent} />
            </OffsetContainer>
          ))
        : null}
    </div>
  );
};
ActionGroup.defaultProps = defaultNodeProps;
