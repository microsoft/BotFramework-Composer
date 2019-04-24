import React from 'react';

import { transformRootDialog } from '../../transformers/transformRootDialog';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeRenderer } from '../shared/NodeRenderer';
import { GraphObjectModel } from '../shared/GraphObjectModel';
import { NodeClickActionTypes } from '../../shared/NodeClickActionTypes';
import { DynamicLayoutComponent } from '../shared/DynamicLayoutComponent';
import { OffsetContainer } from '../OffsetContainer';

const ElementIntervalX = 30;

export class RootDialog extends DynamicLayoutComponent {
  width = 0;
  height = 0;

  dialogBoxes = [];

  computeProps(props) {
    const { recognizerGroup, ruleGroup, stepGroup } = transformRootDialog(props.data);

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

    this.dialogBoxes = [recognizerGroup, stepGroup, ruleGroup]
      .map(x => (x ? createGraphNode(x) : null))
      .filter(x => !!x);
  }

  measureLayout() {
    const nodes = this.dialogBoxes;
    // Measure node size
    nodes.forEach(x => {
      x.boundary = x.ref.current.getBoundary();
    });

    // Measure container size
    this.width =
      nodes.map(x => x.boundary.width).reduce((sum, val) => sum + val, 0) +
      ElementIntervalX * Math.max(nodes.length - 1, 0);
    this.height = Math.max(0, ...nodes.map(x => x.boundary.height));

    nodes.reduce((offsetX, node) => {
      node.offset = { x: offsetX, y: 0 };
      return offsetX + node.boundary.width + ElementIntervalX;
    }, 0);
  }

  renderContent() {
    return (
      <div
        style={{ width: this.width, height: this.height, margin: 20, position: 'relative' }}
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

RootDialog.propTypes = NodeProps;
RootDialog.defaultProps = defaultNodeProps;
