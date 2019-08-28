import React from 'react';
import { getDialogGroupByType } from 'shared-menus';

import { NodeEventTypes } from '../../../shared/NodeEventTypes';
// eslint-disable-next-line no-unused-vars
import { NodeProps, defaultNodeProps } from '../../shared/sharedProps';
import { NodeMenu } from '../../shared/NodeMenu';
import { getElementColor } from '../shared/elementColors';
import { FormCard } from '../templates/FormCard';
import { getFriendlyName } from '../utils';

export class Recognizer extends React.Component<NodeProps, object> {
  static defaultProps = defaultNodeProps;
  render() {
    const { id, data, onEvent } = this.props;
    const nodeColors = getElementColor(getDialogGroupByType(data.$type));
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
