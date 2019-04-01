import React from 'react';

import { NodeClickActionTypes } from '../../utils/constant';

import { Diamond } from './templates/Diamond';
import { NodeProps, defaultNodeProps } from './sharedProps';

export class Recognizer extends React.Component {
  render() {
    const { id, onTriggerEvent } = this.props;
    return (
      <Diamond
        onClick={() => {
          onTriggerEvent(NodeClickActionTypes.Focus, id);
        }}
      />
    );
  }
}

Recognizer.propTypes = NodeProps;
Recognizer.defaultProps = defaultNodeProps;
