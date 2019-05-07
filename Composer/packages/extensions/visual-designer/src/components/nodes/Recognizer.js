import React from 'react';

import { NodeClickActionTypes } from '../../shared/NodeClickActionTypes';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';

import { FormCard } from './templates/FormCard';
import { getFriendlyName } from './utils';

export class Recognizer extends React.Component {
  render() {
    const { id, data, onEvent } = this.props;
    return (
      <FormCard
        themeColor="#00B294"
        header={getFriendlyName(data) || 'Recognizer'}
        label={data.$type.split('.')[1]}
        icon="Friend"
        onClick={() => {
          onEvent(NodeClickActionTypes.Focus, id);
        }}
      />
    );
  }
}

Recognizer.propTypes = NodeProps;
Recognizer.defaultProps = defaultNodeProps;
