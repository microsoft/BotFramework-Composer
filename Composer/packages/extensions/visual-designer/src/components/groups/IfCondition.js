import React from 'react';

import { transformIfCondtiom } from '../../transformers/transformIfCondition';
import { NodeClickActionTypes } from '../../shared/NodeClickActionTypes';
import { Diamond } from '../nodes/templates/Diamond';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { GraphObjectModel } from '../shared/GraphObjectModel';
import { DynamicLayoutComponent } from '../shared/DynamicLayoutComponent';
import { OffsetContainer } from '../OffsetContainer';
import { NodeRenderer } from '../NodeRenderer';
import { Boundary } from '../shared/Boundary';
import { HorizontalEdge, VerticalEdge } from '../shared/Edges';

const ChoiceNodeWidth = 50;
const ChoiceNodeHeight = 20;
const BranchIntervalX = 50;
const BranchIntervalY = 30;

export class IfCondition extends DynamicLayoutComponent {
  boundary = new Boundary(ChoiceNodeWidth, ChoiceNodeHeight);

  choiceNode = null;
  ifGroupNode = null;
  elseGroupNode = null;

  edges = [];

  getBoundary() {
    return this.boundary;
  }

  computeProps(props) {
    const { id, data, focusedId, onEvent } = props;
    const { choice, ifGroup, elseGroup } = transformIfCondtiom(data, id);

    const createGraphNode = input => {
      const result = new GraphObjectModel();
      result.props = {
        id: input.id,
        data: input.json,
        focusedId: focusedId,
        onEvent: (...args) => onEvent(...args),
      };
      return result;
    };

    this.choiceNode = createGraphNode(choice);
    this.ifGroupNode = ifGroup ? createGraphNode(ifGroup) : null;
    this.elseGroupNode = elseGroup ? createGraphNode(elseGroup) : null;
  }

  measureLayout() {
    const { choiceNode, ifGroupNode, elseGroupNode } = this;
    choiceNode.boundary = new Boundary(ChoiceNodeWidth, ChoiceNodeHeight);

    const branchNodes = [ifGroupNode, elseGroupNode];
    branchNodes
      .filter(x => !!x)
      .forEach(x => {
        x.boundary = x.ref.current.getBoundary();
      });
    const [ifWidth, elseWith] = branchNodes.map(x => (x ? x.boundary.width : 0));
    const [ifHeight, elseHeight] = branchNodes.map(x => (x ? x.boundary.height : 0));

    const flag = (ifGroupNode ? '1' : '0') + (elseGroupNode ? '1' : '0');
    switch (flag) {
      case '11':
        /**
         *      <Choice>  ----- [if]
         *          |            |
         *        [else]         |
         *          |-------------
         */
        this.boundary.width =
          Math.max(choiceNode.boundary.axisX, choiceNode.boundary.width - choiceNode.boundary.axisX) +
          Math.max(elseGroupNode.boundary.axisX, elseGroupNode.boundary.width - elseGroupNode.boundary.axisX) +
          BranchIntervalX +
          ifWidth;
        this.boundary.height = Math.max(
          choiceNode.boundary.height + 2 * BranchIntervalY + elseHeight,
          ifHeight + BranchIntervalY
        );
        this.boundary.axisX = Math.max(choiceNode.boundary.axisX, elseGroupNode.boundary.axisX);

        choiceNode.offset = {
          x: this.boundary.axisX - choiceNode.boundary.axisX,
          y: 0,
        };
        elseGroupNode.offset = {
          x: this.boundary.axisX - elseGroupNode.boundary.axisX,
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
        this.boundary.width = choiceNode.boundary.width + BranchIntervalX + ifWidth;
        this.boundary.height = Math.max(choiceNode.boundary.height, ifHeight) + BranchIntervalY;
        this.boundary.axisX = choiceNode.boundary.axisX;

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
        this.boundary.width = Math.max(choiceNode.boundary.width, elseWith) + BranchIntervalX;
        this.boundary.height = choiceNode.boundary.height + elseHeight + BranchIntervalY * 2;
        this.boundary.axisX = Math.max(choiceNode.boundary.axisX, elseGroupNode.boundary.axisX);

        choiceNode.offset = {
          x: this.boundary.axisX - choiceNode.boundary.axisX,
          y: 0,
        };
        elseGroupNode.offset = {
          x: this.boundary.axisX - elseGroupNode.boundary.axisX,
          y: choiceNode.boundary.height + BranchIntervalY,
        };
        break;
      case '00':
        /**
         *    <Choice>
         */
        this.boundary.width = choiceNode.boundary.width;
        this.boundary.height = choiceNode.boundary.height;
        this.boundary.axisX = choiceNode.boundary.axisX;
        choiceNode.offset = { x: 0, y: 0 };
        break;
      default:
        break;
    }

    const { id } = this.props;
    const edgeList = [];
    if (ifGroupNode) {
      edgeList.push(
        {
          key: `${id}/edges/choice->if`,
          direction: 'x',
          x: choiceNode.offset.x + choiceNode.boundary.width,
          y: choiceNode.offset.y + choiceNode.boundary.axisY,
          length: ifGroupNode.offset.x - choiceNode.boundary.width - choiceNode.offset.x,
        },
        {
          key: `${id}/edges/if->bottom`,
          direction: 'y',
          x: ifGroupNode.offset.x + ifGroupNode.boundary.axisX,
          y: ifGroupNode.offset.y + ifGroupNode.boundary.height,
          length: this.boundary.height - (ifGroupNode.offset.y + ifGroupNode.boundary.height),
        },
        {
          key: `${id}/edges/bottome->out`,
          direction: 'x',
          x: this.boundary.axisX,
          y: this.boundary.height,
          length: ifGroupNode.offset.x + ifGroupNode.boundary.axisX - this.boundary.axisX,
        }
      );
    } else {
      edgeList.push(
        {
          key: `${id}/edges/choice->right`,
          direction: 'x',
          x: choiceNode.offset.x + choiceNode.boundary.width,
          y: choiceNode.offset.y + choiceNode.boundary.axisY,
          length: this.boundary.width - (choiceNode.offset.x + choiceNode.boundary.width),
        },
        {
          key: `${id}/edges/top-bottom`,
          direction: 'y',
          x: this.boundary.width,
          y: choiceNode.offset.y + choiceNode.boundary.axisY,
          length: this.boundary.height - (choiceNode.offset.y + choiceNode.boundary.axisY),
        },
        {
          key: `${id}/edges/bottome->out`,
          direction: 'x',
          x: this.boundary.axisX,
          y: this.boundary.height,
          length: this.boundary.width - this.boundary.axisX,
        }
      );
    }

    if (elseGroupNode) {
      edgeList.push(
        {
          key: `${id}/edges/choice->else`,
          direction: 'y',
          x: this.boundary.axisX,
          y: choiceNode.offset.y + choiceNode.boundary.height,
          length: BranchIntervalY,
        },
        {
          key: `${id}/edges/else->out`,
          direction: 'y',
          x: this.boundary.axisX,
          y: elseGroupNode.offset.y + elseGroupNode.boundary.height,
          length: BranchIntervalY,
        }
      );
    } else {
      edgeList.push({
        key: `${id}/edges/choice->out`,
        x: this.boundary.axisX,
        y: choiceNode.offset.y + choiceNode.boundary.height,
        length: this.boundary.height - (choiceNode.offset.y + choiceNode.boundary.height),
      });
    }

    this.edges = edgeList.map(x => (x.direction === 'x' ? <HorizontalEdge {...x} /> : <VerticalEdge {...x} />));
  }

  renderContent() {
    const { id, onEvent } = this.props;
    return (
      <div style={{ width: this.boundary.width, height: this.boundary.height, position: 'relative' }}>
        <OffsetContainer offset={this.choiceNode.offset}>
          <Diamond
            onClick={() => {
              onEvent(NodeClickActionTypes.Focus, id);
            }}
          />
        </OffsetContainer>
        {[this.ifGroupNode, this.elseGroupNode]
          .filter(x => !!x)
          .map((x, index) => (
            <OffsetContainer key={`${id}.branches[${index}].offset`} offset={x.offset}>
              <NodeRenderer key={`${id}.branches[${index}]`} ref={x.ref} {...x.props} />
            </OffsetContainer>
          ))}
        {this.edges}
      </div>
    );
  }
}

IfCondition.propTypes = NodeProps;
IfCondition.defaultProps = defaultNodeProps;
