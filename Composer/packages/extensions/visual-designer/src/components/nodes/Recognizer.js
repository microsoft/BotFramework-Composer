import React from 'react';

import { NodeClickActionTypes } from '../../utils/constant';

import { Diamond } from './templates/Diamond';
import { NodeProps, defaultNodeProps } from './sharedProps';

export class Recognizer extends React.Component {
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

Recognizer.propTypes = NodeProps;
Recognizer.defaultProps = defaultNodeProps;
