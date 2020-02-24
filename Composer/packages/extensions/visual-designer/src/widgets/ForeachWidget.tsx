// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, FunctionComponent } from 'react';

import { transformForeach } from '../transformers/transformForeach';
import { foreachLayouter } from '../layouters/foreachLayouter';
import { GraphNode } from '../models/GraphNode';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { OffsetContainer } from '../components/lib/OffsetContainer';
import { LoopIndicator } from '../components/decorations/LoopIndicator';
import { StepGroup } from '../components/groups';
import { ElementWrapper } from '../components/renderers/ElementWrapper';
import { ElementMeasurer } from '../components/renderers/ElementMeasurer';
import { WidgetContainerProps } from '../schema/uischema.types';
import { renderEdge } from '../components/lib/EdgeUtil';
import { SVGContainer } from '../components/lib/SVGContainer';
import { useSmartLayout, GraphNodeMap } from '../hooks/useSmartLayout';
import { designerCache } from '../store/DesignerCache';

enum ForeachNodes {
  Foreach = 'foreachNode',
  LoopBegin = 'loopBeginNode',
  LoopEnd = 'loopEndNode',
  LoopActions = 'loopActionsNode',
}

const calculateNodeMap = (jsonpath, data): GraphNodeMap<ForeachNodes> => {
  const result = transformForeach(data, jsonpath);
  if (!result)
    return {
      [ForeachNodes.Foreach]: new GraphNode(),
      [ForeachNodes.LoopActions]: new GraphNode(),
      [ForeachNodes.LoopBegin]: new GraphNode(),
      [ForeachNodes.LoopEnd]: new GraphNode(),
    };

  const { foreachDetail, stepGroup, loopBegin, loopEnd } = result;
  return {
    [ForeachNodes.Foreach]: GraphNode.fromIndexedJson(foreachDetail),
    [ForeachNodes.LoopActions]: GraphNode.fromIndexedJson(stepGroup),
    [ForeachNodes.LoopBegin]: GraphNode.fromIndexedJson(loopBegin),
    [ForeachNodes.LoopEnd]: GraphNode.fromIndexedJson(loopEnd),
  };
};

const calculateForeachLayout = (nodeMap: GraphNodeMap<ForeachNodes>) => {
  const { foreachNode, loopActionsNode, loopBeginNode, loopEndNode } = nodeMap;
  return foreachLayouter(foreachNode, loopActionsNode, loopBeginNode, loopEndNode);
};

export interface ForeachWidgetProps extends WidgetContainerProps {
  loop: JSX.Element;
}

export const ForeachWidget: FunctionComponent<ForeachWidgetProps> = ({ id, data, onEvent, onResize, loop }) => {
  const nodeMap = useMemo(() => calculateNodeMap(id, data), [id, data]);
  const { layout, updateNodeBoundary } = useSmartLayout<ForeachNodes>(nodeMap, calculateForeachLayout, onResize);

  const { boundary, edges } = layout;
  if (!nodeMap) {
    return null;
  }

  const { foreachNode, loopActionsNode, loopBeginNode, loopEndNode } = nodeMap;
  return (
    <div css={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
      <OffsetContainer offset={foreachNode.offset}>
        <ElementWrapper id={id} onEvent={onEvent}>
          <ElementMeasurer
            onResize={boundary => {
              designerCache.cacheBoundary(foreachNode.data, boundary);
              updateNodeBoundary(ForeachNodes.Foreach, boundary);
            }}
          >
            {loop}
          </ElementMeasurer>
        </ElementWrapper>
      </OffsetContainer>
      <OffsetContainer offset={loopActionsNode.offset}>
        <StepGroup
          key={loopActionsNode.id}
          id={loopActionsNode.id}
          data={loopActionsNode.data}
          onEvent={onEvent}
          onResize={size => {
            updateNodeBoundary(ForeachNodes.LoopActions, size);
          }}
        />
      </OffsetContainer>
      {[loopBeginNode, loopEndNode]
        .filter(x => !!x)
        .map((x, index) => (
          <OffsetContainer key={`${id}/loopicon-${index}/offset`} offset={x.offset}>
            <LoopIndicator onClick={() => onEvent(NodeEventTypes.Focus, { id })} />
          </OffsetContainer>
        ))}
      <SVGContainer>{Array.isArray(edges) ? edges.map(x => renderEdge(x)) : null}</SVGContainer>
    </div>
  );
};

ForeachWidget.defaultProps = {
  onResize: () => null,
};
