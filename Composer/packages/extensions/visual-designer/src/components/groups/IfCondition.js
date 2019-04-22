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

const ChoiceNodeWidth = 150;
const ChoiceNodeHeight = 50;
const BranchIntervalX = 30;
const BranchIntervalY = 30;

export class IfCondition extends DynamicLayoutComponent {
  boundary = new Boundary(ChoiceNodeWidth, ChoiceNodeHeight);

  choiceNode = null;
  ifGroupNode = null;
  elseGroupNode = null;

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
        this.boundary.width = Math.max(ChoiceNodeWidth, elseWith) + BranchIntervalX + ifWidth;
        this.boundary.height = Math.max(ChoiceNodeHeight + BranchIntervalY + elseHeight, ifHeight + BranchIntervalY);

        choiceNode.offset = { x: (Math.max(ChoiceNodeWidth, elseWith) - ChoiceNodeWidth) / 2, y: 0 };
        elseGroupNode.offset = {
          x: (Math.max(ChoiceNodeWidth, elseWith) - elseWith) / 2,
          y: ChoiceNodeHeight + BranchIntervalY,
        };
        ifGroupNode.offset = { x: Math.max(ChoiceNodeWidth, elseWith) + BranchIntervalX, y: 0 };
        break;
      case '10':
        /**
         *      <Choice>----[if]
         *         |         |
         *         |         |
         *         |----------
         */
        this.boundary.width = ChoiceNodeWidth + BranchIntervalX + ifWidth;
        this.boundary.height = Math.max(ChoiceNodeHeight, ifHeight) + BranchIntervalY;

        choiceNode.offset = { x: 0, y: 0 };
        ifGroupNode.offset = { x: ChoiceNodeWidth + BranchIntervalX, y: 0 };
        break;
      case '01':
        /**
         *      <Choice> ----
         *          |       |
         *        [else]    |
         *          |--------
         */
        this.boundary.width = Math.max(ChoiceNodeWidth, elseWith) + BranchIntervalX;
        this.boundary.height = ChoiceNodeHeight + BranchIntervalY * 2;

        choiceNode.offset = { x: (Math.max(ChoiceNodeWidth, elseWith) - ChoiceNodeWidth) / 2, y: 0 };
        elseGroupNode.offset = {
          x: (Math.max(ChoiceNodeWidth, elseWith) - elseWith) / 2,
          y: ChoiceNodeHeight + BranchIntervalY,
        };
        break;
      case '00':
        /**
         *    <Choice>
         */
        this.boundary.width = ChoiceNodeWidth;
        this.boundary.height = ChoiceNodeHeight;
        choiceNode.offset = { x: 0, y: 0 };
        break;
      default:
        break;
    }
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
      </div>
    );
  }
}

IfCondition.propTypes = NodeProps;
IfCondition.defaultProps = defaultNodeProps;
