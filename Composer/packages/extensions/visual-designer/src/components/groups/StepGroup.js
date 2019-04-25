import React from 'react';
import memoize from 'memoize-one';

import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeRenderer } from '../shared/NodeRenderer';
import { GraphObjectModel } from '../shared/GraphObjectModel';
import { OffsetContainer } from '../shared/OffsetContainer';
import { Edge } from '../shared/EdgeComponents';
import { Boundary, areBoundariesEqual } from '../shared/Boundary';
import { sequentialLayouter } from '../../layouters/sequentialLayouter';

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
    const nodes = inputNodes.map(x => ({
      ...x,
      boundary: boundaryByNodeId[x.id] || new Boundary(),
    }));
    return sequentialLayouter(nodes, StepInterval);
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
        {edges.map(x => (
          <Edge key={x.id} {...x} />
        ))}
      </div>
    );
  }
}

StepGroup.propTypes = NodeProps;
StepGroup.defaultProps = defaultNodeProps;
