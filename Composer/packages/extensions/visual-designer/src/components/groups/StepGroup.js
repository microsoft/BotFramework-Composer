import React, { useState, useMemo, useEffect } from 'react';

import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeRenderer } from '../shared/NodeRenderer';
import { GraphNode } from '../shared/GraphNode';
import { OffsetContainer } from '../shared/OffsetContainer';
import { Edge } from '../shared/EdgeComponents';
import { Boundary, areBoundariesEqual } from '../shared/Boundary';
import { sequentialLayouter } from '../../layouters/sequentialLayouter';
import { ElementWidth, ElementHeight } from '../shared/NodeMeta';

const StepInterval = 20;
const InitStepWidth = ElementWidth;
const InitStepHeight = ElementHeight;

const calculateNodes = data => {
  if (data && data.children && Array.isArray(data.children)) {
    return data.children.map(indexedStep => GraphNode.fromIndexedJson(indexedStep));
  }
  return [];
};

const calculateLayout = (nodes, boundaryMap) => {
  nodes.forEach(x => (x.boundary = boundaryMap[x.id] || new Boundary(InitStepWidth, InitStepHeight)));
  return sequentialLayouter(nodes, StepInterval);
};

export const StepGroup = function({ id, data, focusedId, onEvent, onResize }) {
  const [boundaryMap, setBoundaryMap] = useState({});
  const initialNodes = useMemo(() => calculateNodes(data), [id, data]);
  const layout = useMemo(() => calculateLayout(initialNodes, boundaryMap), [initialNodes, boundaryMap]);
  const accumulatedPatches = {};

  const patchBoundary = (id, boundary) => {
    if (!boundaryMap[id] || !areBoundariesEqual(boundaryMap[id], boundary)) {
      accumulatedPatches[id] = boundary;
      setBoundaryMap({
        ...boundaryMap,
        ...accumulatedPatches,
      });
    }
  };

  useEffect(() => {
    onResize(layout.boundary);
  }, [layout]);

  const { boundary, nodes, edges } = layout;
  return (
    <div style={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
      {nodes.map(x => (
        <OffsetContainer key={`stepGroup/${x.id}/offset`} offset={x.offset}>
          <NodeRenderer
            key={`stepGroup/${x.id}]`}
            id={x.id}
            data={x.data}
            focusedId={focusedId}
            onEvent={onEvent}
            onResize={size => {
              patchBoundary(x.id, size);
            }}
          />
        </OffsetContainer>
      ))}
      {edges.map(x => (
        <Edge key={x.id} {...x} />
      ))}
    </div>
  );
};

StepGroup.propTypes = NodeProps;
StepGroup.defaultProps = defaultNodeProps;
