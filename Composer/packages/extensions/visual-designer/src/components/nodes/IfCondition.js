import React from 'react';
import memoize from 'memoize-one';

import { transformIfCondtion } from '../../transformers/transformIfCondition';
import { NodeClickActionTypes } from '../../shared/NodeClickActionTypes';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { GraphObjectModel } from '../shared/GraphObjectModel';
import { OffsetContainer } from '../shared/OffsetContainer';
import { StepGroup } from '../groups';
import { Boundary, areBoundariesEqual } from '../shared/Boundary';
import { Edge } from '../shared/EdgeComponents';
import { ifElseLayouter } from '../../layouters/ifelseLayouter';

import { Diamond } from './templates/Diamond';

const ChoiceNodeWidth = 50;
const ChoiceNodeHeight = 20;

export class IfCondition extends React.Component {
  nodeBoundaries = {};
  nodes = {};

  state = {
    rootBoundary: new Boundary(),
    nodeBoundaries: this.nodeBoundaries,
  };

  computeNodes = memoize((path, data) => {
    const { choice, ifGroup, elseGroup } = transformIfCondtion(data, path);

    const createGraphNode = input => {
      if (!input) return null;
      const node = new GraphObjectModel();
      node.id = input.id;
      node.data = input.json;
      return node;
    };

    this.nodes = {
      choiceNode: createGraphNode(choice),
      ifGroupNode: createGraphNode(ifGroup),
      elseGroupNode: createGraphNode(elseGroup),
    };
    return this.nodes;
  });

  measureLayout = memoize((inputNodes, boundaryByNodeId) => {
    Object.values(inputNodes)
      .filter(x => !!x)
      .forEach(x => (x.boundary = boundaryByNodeId[x.id] || new Boundary()));
    if (inputNodes.choiceNode) inputNodes.choiceNode.boundary = new Boundary(ChoiceNodeWidth, ChoiceNodeHeight);

    return ifElseLayouter(inputNodes.choiceNode, inputNodes.ifGroupNode, inputNodes.elseGroupNode);
  });

  patchBoundary(id, boundary) {
    const { nodeBoundaries } = this;
    if (!nodeBoundaries[id] || !areBoundariesEqual(nodeBoundaries[id], boundary)) {
      this.nodeBoundaries = {
        ...nodeBoundaries,
        [id]: boundary,
      };
    }

    if (this.nodeBoundaries !== this.state.nodeBoundaries) {
      const nextState = {
        nodeBoundaries: this.nodeBoundaries,
      };

      const { boundary } = this.measureLayout(this.nodes, this.nodeBoundaries);
      if (!areBoundariesEqual(boundary, this.state.rootBoundary)) {
        nextState.rootBoundary = boundary;
        this.props.onResize(boundary, 'IfCondition');
      }
      this.setState(nextState);
    }
  }

  render() {
    const { id, data, focusedId, onEvent } = this.props;
    const inputNodes = this.computeNodes(id, data);
    const { boundary, nodeMap, edges } = this.measureLayout(inputNodes, this.nodeBoundaries);

    return (
      <div style={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
        <OffsetContainer offset={nodeMap.choice.offset}>
          <Diamond
            onClick={() => {
              onEvent(NodeClickActionTypes.Focus, id);
            }}
          />
        </OffsetContainer>
        {[nodeMap.if, nodeMap.else]
          .filter(x => !!x)
          .map(x => (
            <OffsetContainer key={`${x.id}/offset`} offset={x.offset}>
              <StepGroup
                key={x.id}
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

IfCondition.propTypes = NodeProps;
IfCondition.defaultProps = defaultNodeProps;
