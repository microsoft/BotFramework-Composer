import React from 'react';

import { NodeClickActionTypes } from '../../shared/NodeClickActionTypes';
import { Diamond } from '../nodes/templates/Diamond';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';

export class IfCondition extends React.Component {
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
