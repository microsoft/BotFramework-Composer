// eslint-disable-next-line no-unused-vars
import React, { useState, useMemo, useEffect, FunctionComponent } from 'react';
import { EdgeMenu } from 'shared-menus';

// eslint-disable-next-line no-unused-vars
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeRenderer } from '../shared/NodeRenderer';
import { GraphNode } from '../../shared/GraphNode';
import { OffsetContainer } from '../../shared/OffsetContainer';
import { Edge } from '../shared/EdgeComponents';
import { areBoundariesEqual } from '../../shared/Boundary';
import { sequentialLayouter } from '../../layouters/sequentialLayouter';
import { ElementInterval, EdgeAddButtonSize } from '../../shared/elementSizes';
import { NodeEventTypes } from '../../shared/NodeEventTypes';
import { IndexedNode } from '../../transformers/models/IndexedNode';

const StepInterval = ElementInterval.y;

const calculateNodes = (groupId: string, data): GraphNode[] => {
  if (data && data.children && Array.isArray(data.children)) {
    return data.children.map((step, index) => GraphNode.fromIndexedJson(new IndexedNode(`${groupId}[${index}]`, step)));
  }
  return [];
};

const calculateLayout = (nodes, boundaryMap) => {
  nodes.forEach(x => (x.boundary = boundaryMap[x.id] || x.boundary));
  return sequentialLayouter(nodes);
};

export const StepGroup: FunctionComponent<NodeProps> = ({ id, data, focusedId, onEvent, onResize }: NodeProps) => {
  const [boundaryMap, setBoundaryMap] = useState({});
  const initialNodes = useMemo(() => calculateNodes(id, data), [id, data]);
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
      {edges.map(x => (
        <Edge key={x.id} {...x} />
      ))}
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
      <OffsetContainer
        offset={{ x: boundary.axisX - EdgeAddButtonSize.width / 2, y: 0 - EdgeAddButtonSize.height / 2 }}
        styles={{ zIndex: 100 }}
      >
        <EdgeMenu onClick={$type => onEvent(NodeEventTypes.Insert, { id, $type, position: 0 })} />
      </OffsetContainer>
      {nodes.map((x, idx) => (
        <OffsetContainer
          key={`stepGroup/${x.id}/footer/offset`}
          offset={{
            x: boundary.axisX - EdgeAddButtonSize.width / 2,
            y: x.offset.y + x.boundary.height + StepInterval / 2 - EdgeAddButtonSize.height / 2,
          }}
          styles={{ zIndex: 100 }}
        >
          <EdgeMenu onClick={$type => onEvent(NodeEventTypes.Insert, { id, $type, position: idx + 1 })} />
        </OffsetContainer>
      ))}
    </div>
  );
};
StepGroup.defaultProps = defaultNodeProps;
