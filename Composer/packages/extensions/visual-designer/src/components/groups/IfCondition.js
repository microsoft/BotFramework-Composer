import React from 'react';

import { NodeClickActionTypes } from '../../shared/NodeClickActionTypes';
import { Diamond } from '../nodes/templates/Diamond';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { GraphObjectModel } from '../shared/GraphObjectModel';
import { DynamicLayoutComponent } from '../shared/DynamicLayoutComponent';

export class IfCondition extends DynamicLayoutComponent {
  width = 150;
  height = 20;

  elements = {
    choiceNode: new GraphObjectModel(),
    trueNodes: new GraphObjectModel(),
    falseNodes: new GraphObjectModel(),
  };

  getBoundary() {
    return {
      width: this.width,
      height: this.height,
      in: { x: this.width / 2, y: 0 },
      out: { x: this.width / 2, y: this.height },
    };
  }

  render() {
    const { id, onEvent } = this.props;
    return (
      <Diamond
        onClick={() => {
          onEvent(NodeClickActionTypes.Focus, id);
        }}
      />
    );
  }
}

IfCondition.propTypes = NodeProps;
IfCondition.defaultProps = defaultNodeProps;
