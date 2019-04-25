import React from 'react';
import memoize from 'memoize-one';

import { transformIfCondtion } from '../../transformers/transformIfCondition';
import { NodeClickActionTypes } from '../../shared/NodeClickActionTypes';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { GraphObjectModel } from '../shared/GraphObjectModel';
import { OffsetContainer } from '../shared/OffsetContainer';
import { StepGroup } from '../groups';
import { Boundary, areBoundariesEqual } from '../shared/Boundary';
import { HorizontalEdge, VerticalEdge } from '../shared/EdgeComponents';

import { Diamond } from './templates/Diamond';

const ChoiceNodeWidth = 50;
const ChoiceNodeHeight = 20;
const BranchIntervalX = 50;
const BranchIntervalY = 30;

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
    const containerBoundary = new Boundary();
    const nodes = { ...inputNodes };

    Object.values(nodes)
      .filter(x => !!x)
      .forEach(x => (x.boundary = boundaryByNodeId[x.id] || new Boundary()));
    if (nodes.choiceNode) nodes.choiceNode.boundary = new Boundary(ChoiceNodeWidth, ChoiceNodeHeight);

    const { choiceNode, ifGroupNode, elseGroupNode } = nodes;
    const { width: ifWidth, height: ifHeight } = ifGroupNode ? ifGroupNode.boundary : new Boundary();
    const { width: elseWith, height: elseHeight } = elseGroupNode ? elseGroupNode.boundary : new Boundary();

    const flag = (ifGroupNode ? '1' : '0') + (elseGroupNode ? '1' : '0');
    switch (flag) {
      case '11':
        /**
         *      <Choice>  ----- [if]
         *          |            |
         *        [else]         |
         *          |-------------
         */
        containerBoundary.axisX = Math.max(choiceNode.boundary.axisX, elseGroupNode.boundary.axisX);
        containerBoundary.width =
          containerBoundary.axisX +
          Math.max(
            elseGroupNode.boundary.width - elseGroupNode.boundary.axisX,
            choiceNode.boundary.width - choiceNode.boundary.axisX
          ) +
          BranchIntervalX +
          ifWidth;
        containerBoundary.height = Math.max(
          choiceNode.boundary.height + 2 * BranchIntervalY + elseHeight,
          ifHeight + BranchIntervalY
        );

        choiceNode.offset = {
          x: containerBoundary.axisX - choiceNode.boundary.axisX,
          y: 0,
        };
        elseGroupNode.offset = {
          x: containerBoundary.axisX - elseGroupNode.boundary.axisX,
          y: choiceNode.boundary.height + BranchIntervalY,
        };
        ifGroupNode.offset = { x: Math.max(choiceNode.boundary.width, elseWith) + BranchIntervalX, y: 0 };
        break;
      case '10':
        /**
         *      <Choice>----[if]
         *         |         |
         *         |         |
         *         |----------
         */
        containerBoundary.width = choiceNode.boundary.width + BranchIntervalX + ifWidth;
        containerBoundary.height = Math.max(choiceNode.boundary.height, ifHeight) + BranchIntervalY;
        containerBoundary.axisX = choiceNode.boundary.axisX;

        choiceNode.offset = { x: 0, y: 0 };
        ifGroupNode.offset = { x: choiceNode.boundary.width + BranchIntervalX, y: 0 };
        break;
      case '01':
        /**
         *      <Choice> ----
         *          |       |
         *        [else]    |
         *          |--------
         */
        containerBoundary.width = Math.max(choiceNode.boundary.width, elseWith) + BranchIntervalX;
        containerBoundary.height = choiceNode.boundary.height + elseHeight + BranchIntervalY * 2;
        containerBoundary.axisX = Math.max(choiceNode.boundary.axisX, elseGroupNode.boundary.axisX);

        choiceNode.offset = {
          x: containerBoundary.axisX - choiceNode.boundary.axisX,
          y: 0,
        };
        elseGroupNode.offset = {
          x: containerBoundary.axisX - elseGroupNode.boundary.axisX,
          y: choiceNode.boundary.height + BranchIntervalY,
        };
        break;
      case '00':
        /**
         *    <Choice>
         */
        containerBoundary.width = choiceNode.boundary.width;
        containerBoundary.height = choiceNode.boundary.height;
        containerBoundary.axisX = choiceNode.boundary.axisX;
        choiceNode.offset = { x: 0, y: 0 };
        break;
      default:
        break;
    }

    const edgeList = [];
    if (ifGroupNode) {
      edgeList.push(
        {
          key: `edges/${ifGroupNode.id}/if/choice->if}`,
          direction: 'x',
          x: choiceNode.offset.x + choiceNode.boundary.width,
          y: choiceNode.offset.y + choiceNode.boundary.axisY,
          length: ifGroupNode.offset.x - choiceNode.boundary.width - choiceNode.offset.x,
          text: 'Y',
        },
        {
          key: `edges/${ifGroupNode.id}/if/if->border.bottom`,
          direction: 'y',
          x: ifGroupNode.offset.x + ifGroupNode.boundary.axisX,
          y: ifGroupNode.offset.y + ifGroupNode.boundary.height,
          length: containerBoundary.height - (ifGroupNode.offset.y + ifGroupNode.boundary.height),
        },
        {
          key: `edges/${ifGroupNode.id}/if/border.bottom->out`,
          direction: 'x',
          x: containerBoundary.axisX,
          y: containerBoundary.height,
          length: ifGroupNode.offset.x + ifGroupNode.boundary.axisX - containerBoundary.axisX,
        }
      );
    } else {
      edgeList.push(
        {
          key: `edges/${choiceNode.id}/if/choice->border.right`,
          direction: 'x',
          x: choiceNode.offset.x + choiceNode.boundary.width,
          y: choiceNode.offset.y + choiceNode.boundary.axisY,
          length: containerBoundary.width - (choiceNode.offset.x + choiceNode.boundary.width),
        },
        {
          key: `edges/${choiceNode.id}/if/border.top->border.bottom`,
          direction: 'y',
          x: containerBoundary.width,
          y: choiceNode.offset.y + choiceNode.boundary.axisY,
          length: containerBoundary.height - (choiceNode.offset.y + choiceNode.boundary.axisY),
        },
        {
          key: `edges/${choiceNode.id}/if/border.bottom->out`,
          direction: 'x',
          x: containerBoundary.axisX,
          y: containerBoundary.height,
          length: containerBoundary.width - containerBoundary.axisX,
        }
      );
    }

    if (elseGroupNode) {
      edgeList.push(
        {
          key: `edges/${elseGroupNode.id}/else/choice->else`,
          direction: 'y',
          x: containerBoundary.axisX,
          y: choiceNode.offset.y + choiceNode.boundary.height,
          length: BranchIntervalY,
          text: 'N',
        },
        {
          key: `edges/${elseGroupNode.id}/else/else->out`,
          direction: 'y',
          x: containerBoundary.axisX,
          y: elseGroupNode.offset.y + elseGroupNode.boundary.height,
          length: BranchIntervalY,
        }
      );
    } else {
      edgeList.push({
        key: `edges/${choiceNode.id}/else/choice->out`,
        x: containerBoundary.axisX,
        y: choiceNode.offset.y + choiceNode.boundary.height,
        length: containerBoundary.height - (choiceNode.offset.y + choiceNode.boundary.height),
        text: 'N',
      });
    }
    const edges = edgeList.map(x => (x.direction === 'x' ? <HorizontalEdge {...x} /> : <VerticalEdge {...x} />));

    return { boundary: containerBoundary, nodes, edges };
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
    const layout = this.measureLayout(inputNodes, this.nodeBoundaries);
    const { boundary, nodes, edges } = layout;

    return (
      <div style={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
        <OffsetContainer offset={nodes.choiceNode.offset}>
          <Diamond
            onClick={() => {
              onEvent(NodeClickActionTypes.Focus, id);
            }}
          />
        </OffsetContainer>
        {[nodes.ifGroupNode, nodes.elseGroupNode]
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
        {edges}
      </div>
    );
  }
}

IfCondition.propTypes = NodeProps;
IfCondition.defaultProps = defaultNodeProps;
