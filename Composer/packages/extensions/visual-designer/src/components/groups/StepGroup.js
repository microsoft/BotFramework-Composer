import React from 'react';
import memoize from 'memoize-one';

import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeRenderer } from '../shared/NodeRenderer';
import { GraphObjectModel } from '../shared/GraphObjectModel';
import { OffsetContainer } from '../shared/OffsetContainer';
import { VerticalEdge } from '../shared/EdgeComponents';
import { Boundary, areBoundariesEqual } from '../shared/Boundary';
import { GraphLayout } from '../shared/GraphLayout';

const StepInterval = 20;

export class StepGroup extends React.Component {
  nodes = [];
  cachedBoundaries = {};

  state = {
    rootBoundary: new Boundary(),
    nodeBoundaries: this.cachedBoundaries,
  };

  computeNodes = memoize(data => {
    if (!data || !Array.isArray(data.children)) return;

    const nodes = data.children.map(step => {
      const node = new GraphObjectModel();
      node.id = step.id;
      node.data = step.json;
      return node;
    });
    this.nodes = nodes;
    return nodes;
  });

  computeLayout = memoize((inputNodes, boundaryByNodeId) => {
    const containerBoundary = new Boundary();
    // Merge node boundary into node data
    const nodes = inputNodes.map(x => ({
      ...x,
      boundary: boundaryByNodeId[x.id] || new Boundary(),
    }));
    containerBoundary.axisX = Math.max(0, ...nodes.map(x => x.boundary.axisX));
    containerBoundary.width =
      containerBoundary.axisX + Math.max(0, ...nodes.map(x => x.boundary.width - x.boundary.axisX));
    containerBoundary.height =
      nodes.map(x => x.boundary.height).reduce((sum, val) => sum + val, 0) +
      StepInterval * Math.max(nodes.length - 1, 0);

    nodes.reduce((offsetY, node) => {
      node.offset = { x: containerBoundary.axisX - node.boundary.axisX, y: offsetY };
      return offsetY + node.boundary.height + StepInterval;
    }, 0);

    const edges = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      const { boundary, offset } = nodes[i];
      const x = containerBoundary.axisX;
      const y = boundary.height + offset.y;
      edges.push(<VerticalEdge key={`stepGroup.edges[${i}]`} length={StepInterval} x={x} y={y} />);
    }

    return new GraphLayout(containerBoundary, nodes, edges);
  });

  patchBoundary(id, boundary) {
    // At the initial render, every child element will trigger an invocation of this func.
    // setState won't update the boundary map just-in-time, cachedBoundaries is used to gathering pathces.
    const { cachedBoundaries } = this;
    if (!cachedBoundaries[id] || !areBoundariesEqual(cachedBoundaries[id], boundary)) {
      this.cachedBoundaries = {
        ...cachedBoundaries,
        [id]: boundary,
      };
    }

    if (this.cachedBoundaries !== this.state.nodeBoundaries) {
      const { boundary } = this.computeLayout(this.nodes, this.cachedBoundaries);
      const nextState = {
        nodeBoundaries: this.cachedBoundaries,
      };

      if (!areBoundariesEqual(boundary, this.state.rootBoundary)) {
        nextState.rootBoundary = boundary;
        this.props.onResize(boundary);
      }
      // Multiple state changes will be merged into one render.
      this.setState(nextState);
    }
  }

  render() {
    const { data, focusedId, onEvent } = this.props;
    const nodes = this.computeNodes(data);
    const layout = this.computeLayout(nodes, this.state.nodeBoundaries);
    const { boundary, nodes: nodesWithPisition, edges } = layout;

    return (
      <div style={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
        {nodesWithPisition.map(x => (
          <OffsetContainer key={`stepGroup/${x.id}/offset`} offset={x.offset}>
            <NodeRenderer
              key={`stepGroup/${x.id}]`}
              id={x.id}
              ref={x.ref}
              data={x.data}
              focusedId={focusedId}
              onEvent={onEvent}
              onResize={size => {
                this.patchBoundary(x.id, size);
              }}
            />
          </OffsetContainer>
        ))}
        {edges}
      </div>
    );
  }
}

StepGroup.propTypes = NodeProps;
StepGroup.defaultProps = defaultNodeProps;
