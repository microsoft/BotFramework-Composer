// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, FunctionComponent, useContext } from 'react';

import { GraphNode } from '../models/GraphNode';
import { sequentialLayouter } from '../layouters/sequentialLayouter';
import { ElementInterval, EdgeAddButtonSize } from '../constants/ElementSizes';
import { transformStepGroup } from '../transformers/transformStepGroup';
import { OffsetContainer } from '../lib/OffsetContainer';
import { GraphLayout } from '../models/GraphLayout';
import { SVGContainer } from '../lib/SVGContainer';
import { GraphNodeMap, useSmartLayout } from '../hooks/useSmartLayout';
import { designerCache } from '../../store/DesignerCache';
import { FlowEdges } from '../lib/FlowEdges';
import { FlowRendererContext } from '../../store/FlowRendererContext';

import { NodeProps, defaultNodeProps } from './types/NodeProps.types';
import { StepRenderer } from './AdaptiveAction';

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
    .map((stepName) => nodeMap[stepName]);
  return sequentialLayouter(nodes);
};

export const ActionGroup: FunctionComponent<NodeProps> = ({ id, data, onEvent, onResize }: NodeProps): JSX.Element => {
  const { EdgeMenu } = useContext(FlowRendererContext);
  const initialNodes = useMemo(() => calculateNodes(id, data), [id, data]);
  const { layout, updateNodeBoundary } = useSmartLayout(initialNodes, calculateLayout, onResize);

  const { boundary, nodes, edges } = layout;

  return (
    <div css={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
      <SVGContainer hidden height={boundary.height} width={boundary.width}>
        <FlowEdges edges={edges} />
      </SVGContainer>
      {nodes
        ? nodes.map((node, index) => (
            <OffsetContainer key={`stepGroup/${node.id}/offset`} offset={node.offset}>
              <StepRenderer
                key={`stepGroup/${node.id}`}
                data={node.data}
                id={node.id}
                onEvent={onEvent}
                onResize={(size) => {
                  designerCache.cacheBoundary(node.data, size);
                  updateNodeBoundary(getStepKey(index), size);
                }}
              />
            </OffsetContainer>
          ))
        : null}
      <OffsetContainer
        css={{ zIndex: 100 }}
        offset={{ x: boundary.axisX - EdgeAddButtonSize.width / 2, y: 0 - EdgeAddButtonSize.height / 2 }}
      >
<<<<<<< HEAD:Composer/packages/extensions/visual-designer/src/adaptive-sdk/widgets/ActionGroup.tsx
        <EdgeMenu arrayId={id} arrayData={data} arrayPosition={0} onEvent={onEvent} />
=======
        <EdgeMenu
          data-testid="StepGroupAdd"
          id={`${id}[0]`}
          onClick={($kind) => onEvent(NodeEventTypes.Insert, { id, $kind, position: 0 })}
        />
>>>>>>> master:Composer/packages/extensions/visual-designer/src/components/groups/StepGroup.tsx
      </OffsetContainer>
      {nodes
        ? nodes.map((x, idx) => (
            <OffsetContainer
              key={`stepGroup/${x.id}/footer/offset`}
              css={{ zIndex: 100 }}
              offset={{
                x: boundary.axisX - EdgeAddButtonSize.width / 2,
                y: x.offset.y + x.boundary.height + StepInterval / 2 - EdgeAddButtonSize.height / 2,
              }}
            >
<<<<<<< HEAD:Composer/packages/extensions/visual-designer/src/adaptive-sdk/widgets/ActionGroup.tsx
              <EdgeMenu arrayId={id} arrayData={data} arrayPosition={idx + 1} onEvent={onEvent} />
=======
              <EdgeMenu
                data-testid="StepGroupAdd"
                id={`${id}[${idx + 1}]`}
                onClick={($kind) => onEvent(NodeEventTypes.Insert, { id, $kind, position: idx + 1 })}
              />
>>>>>>> master:Composer/packages/extensions/visual-designer/src/components/groups/StepGroup.tsx
            </OffsetContainer>
          ))
        : null}
    </div>
  );
};
ActionGroup.defaultProps = defaultNodeProps;
