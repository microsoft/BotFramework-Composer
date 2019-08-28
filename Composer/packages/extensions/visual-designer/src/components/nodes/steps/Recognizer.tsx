import React from 'react';

import { NodeEventTypes } from '../../../constants/NodeEventTypes';
import { NodeProps, defaultNodeProps } from '../nodeProps';
import { NodeMenu } from '../../menus/NodeMenu';
import { getElementColor } from '../../../shared/obiPropertyResolver';
import { FormCard } from '../templates/FormCard';
import { getFriendlyName } from '../utils';

export class Recognizer extends React.Component<NodeProps, object> {
  static defaultProps = defaultNodeProps;
  render() {
    const { id, data, onEvent } = this.props;
    const nodeColors = getElementColor(data.$type);
    return (
      <FormCard
        nodeColors={nodeColors}
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
