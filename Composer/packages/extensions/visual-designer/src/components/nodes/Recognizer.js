import React from 'react';

import { NodeClickActionTypes } from '../../utils/constant';

import { FormCard } from './templates/FormCard';
import { NodeProps, defaultNodeProps } from './sharedProps';

export class Recognizer extends React.Component {
  render() {
    const { id, data, onEvent } = this.props;
    return (
      <FormCard
        themeColor="#0078D4"
        header="Recognizer"
        label={data.$type.split('.')[1]}
        onClick={() => {
          onEvent(NodeClickActionTypes.Focus, id);
        }}
      />
    );
  }
}

Recognizer.propTypes = NodeProps;
Recognizer.defaultProps = defaultNodeProps;
