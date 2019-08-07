/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useMemo, useEffect, FunctionComponent } from 'react';
import { EdgeMenu } from 'shared-menus';

import { GraphNode } from '../../shared/GraphNode';
import { areBoundariesEqual } from '../../shared/Boundary';
import { sequentialLayouter } from '../../layouters/sequentialLayouter';
import { ElementInterval, EdgeAddButtonSize } from '../../shared/elementSizes';
import { NodeEventTypes } from '../../shared/NodeEventTypes';
import { transformStepGroup } from '../../transformers/transformStepGroup';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { OffsetContainer } from '../shared/OffsetContainer';
import { NodeRenderer } from '../shared/NodeRenderer';
import { Edge } from '../shared/EdgeComponents';
import { GraphLayout } from '../../shared/GraphLayout';

const StepInterval = ElementInterval.y;

const calculateNodes = (groupId: string, data): GraphNode[] => {
  const steps = transformStepGroup(data, groupId);
  return steps.map((x): GraphNode => GraphNode.fromIndexedJson(x));
};

const calculateLayout = (nodes, boundaryMap): GraphLayout => {
  nodes.forEach((x): void => (x.boundary = boundaryMap[x.id] || x.boundary));
  return sequentialLayouter(nodes);
};

export const StepGroup: FunctionComponent<NodeProps> = ({ id, data, onEvent, onResize }: NodeProps): JSX.Element => {
  const [boundaryMap, setBoundaryMap] = useState({});
  const initialNodes = useMemo((): GraphNode[] => calculateNodes(id, data), [id, data]);
  const layout = useMemo((): GraphLayout => calculateLayout(initialNodes, boundaryMap), [initialNodes, boundaryMap]);
  const accumulatedPatches = {};

  const patchBoundary = (id, boundary): void => {
    if (!boundaryMap[id] || !areBoundariesEqual(boundaryMap[id], boundary)) {
      accumulatedPatches[id] = boundary;
      setBoundaryMap({
        ...boundaryMap,
        ...accumulatedPatches,
      });
    }
  };

  useEffect((): void => {
    onResize(layout.boundary);
  }, [layout]);

  const { boundary, nodes, edges } = layout;
  return (
    <div css={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
      {edges ? edges.map(x => <Edge key={x.id} {...x} />) : null}
      {nodes
        ? nodes.map(x => (
            <OffsetContainer key={`stepGroup/${x.id}/offset`} offset={x.offset}>
              <NodeRenderer
                key={`stepGroup/${x.id}]`}
                id={x.id}
                data={x.data}
                onEvent={onEvent}
                onResize={size => {
                  patchBoundary(x.id, size);
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
          onClick={$type => onEvent(NodeEventTypes.Insert, { id, $type, position: 0 })}
          data-testid="StepGroupAdd"
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
                onClick={$type => onEvent(NodeEventTypes.Insert, { id, $type, position: idx + 1 })}
                data-testid="StepGroupAdd"
              />
            </OffsetContainer>
          ))
        : null}
    </div>
  );
};
StepGroup.defaultProps = defaultNodeProps;
