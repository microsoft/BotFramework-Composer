// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, FunctionComponent } from 'react';

import { GraphNode } from '../../models/GraphNode';
import { sequentialLayouter } from '../../layouters/sequentialLayouter';
import { ElementInterval, EdgeAddButtonSize } from '../../constants/ElementSizes';
import { NodeEventTypes } from '../../constants/NodeEventTypes';
import { transformStepGroup } from '../../transformers/transformStepGroup';
import { NodeProps, defaultNodeProps } from '../nodes/nodeProps';
import { OffsetContainer } from '../lib/OffsetContainer';
import { StepRenderer } from '../renderers/StepRenderer';
import { GraphLayout } from '../../models/GraphLayout';
import { EdgeMenu } from '../menus/EdgeMenu';
import { SVGContainer } from '../lib/SVGContainer';
import { renderEdge } from '../lib/EdgeUtil';
import { GraphNodeMap, useSmartLayout } from '../../hooks/useSmartLayout';
import { designerCache } from '../../store/DesignerCache';

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

export const StepGroup: FunctionComponent<NodeProps> = ({
  id,
  addCoachMarkRef,
  data,
  onEvent,
  onResize,
}: NodeProps): JSX.Element => {
  const initialNodes = useMemo(() => calculateNodes(id, data), [id, data]);
  const { layout, updateNodeBoundary } = useSmartLayout(initialNodes, calculateLayout, onResize);

  const { boundary, nodes, edges } = layout;

  return (
    <div css={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
      <SVGContainer hidden>{Array.isArray(edges) ? edges.map(x => renderEdge(x)) : null}</SVGContainer>
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
        <EdgeMenu
          onClick={$kind => onEvent(NodeEventTypes.Insert, { id, $kind, position: 0 })}
          data-testid="StepGroupAdd"
          id={`${id}[0]`}
          addCoachMarkRef={addCoachMarkRef}
        />
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
              <EdgeMenu
                onClick={$kind => onEvent(NodeEventTypes.Insert, { id, $kind, position: idx + 1 })}
                data-testid="StepGroupAdd"
                id={`${id}[${idx + 1}]`}
              />
            </OffsetContainer>
          ))
        : null}
    </div>
  );
};
StepGroup.defaultProps = defaultNodeProps;
