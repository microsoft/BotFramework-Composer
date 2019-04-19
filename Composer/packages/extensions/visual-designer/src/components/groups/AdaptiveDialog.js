import React from 'react';

import transformAdaptiveDialog from '../../transformers/transformAdaptiveDialog';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeRenderer } from '../NodeRenderer';
import { GraphObjectModel } from '../shared/GraphObjectModel';
import { NodeClickActionTypes } from '../../shared/NodeClickActionTypes';
import { DynamicStyledComponent } from '../shared/DynamicStyledComponent';
import { OffsetContainer } from '../OffsetContainer';

const ElementInterval = 30;

export class AdaptiveDialog extends DynamicStyledComponent {
  width = 0;
  height = 0;

  dialogBoxes = [];
  ruleGroupBox = new GraphObjectModel();
  stepGroupBox = new GraphObjectModel();

  computeProps(props) {
    const { recognizer, eventGroup, intentGroup, ruleGroup, stepGroup } = transformAdaptiveDialog(props.data);

    const createGraphNode = input => {
      const result = new GraphObjectModel();
      result.props = {
        id: input.id,
        data: input.json,
        focusedId: props.focusedId,
        onEvent: (...args) => this.props.onEvent(...args),
      };
      return result;
    };

    this.dialogBoxes = [recognizer, eventGroup, intentGroup].map(x => (x ? createGraphNode(x) : null)).filter(x => !!x);
    if (ruleGroup) this.ruleGroupBox = createGraphNode(ruleGroup);
    if (stepGroup) this.stepGroupBox = createGraphNode(stepGroup);
  }

  measureLayout() {
    const nodes = this.dialogBoxes;
    // Measure node size
    nodes.forEach(x => {
      x.boundary = x.ref.current.getBoundary();
    });

    // Measure container size
    this.width = Math.max(...nodes.map(x => x.boundary.width));
    this.height =
      nodes.map(x => x.boundary.height).reduce((sum, val) => sum + val, 0) +
      ElementInterval * Math.max(nodes.length - 1, 0);

    nodes.reduce((offsetY, node) => {
      node.offset = { x: (this.width - node.boundary.width) / 2, y: offsetY };
      return offsetY + node.boundary.height + ElementInterval;
    }, 0);
  }

  renderContent() {
    return (
      <div
        style={{ width: this.width, height: this.height, position: 'relative' }}
        onClick={e => {
          e.stopPropagation();
          this.props.onEvent(NodeClickActionTypes.Focus, '');
        }}
      >
        {this.dialogBoxes.map((x, index) => (
          <OffsetContainer key={`dialogBoxes.offset[${index}]`} offset={x.offset}>
            <NodeRenderer key={`dialogBoxes[${index}}]`} ref={x.ref} {...x.props} />
          </OffsetContainer>
        ))}
      </div>
    );
  }
}

AdaptiveDialog.propTypes = NodeProps;
AdaptiveDialog.defaultProps = defaultNodeProps;
