import React from 'react';

import { NodeEventTypes } from '../../shared/NodeEventTypes';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';

import { FormCard } from './templates/FormCard';
import { NodeMenu } from './templates/NodeMenu';
import { getFriendlyName } from './utils';

export class Recognizer extends React.Component {
  render() {
    const { id, data, onEvent } = this.props;
    return (
      <FormCard
        themeColor="#00B294"
        header={getFriendlyName(data) || 'Recognizer'}
        corner={<NodeMenu id={id} onEvent={onEvent} />}
        label={data.$type.split('.')[1]}
        icon="Friend"
        onClick={() => {
          onEvent(NodeEventTypes.Focus, id);
        }}
      />
    );
  }
}

Recognizer.propTypes = NodeProps;
Recognizer.defaultProps = defaultNodeProps;
