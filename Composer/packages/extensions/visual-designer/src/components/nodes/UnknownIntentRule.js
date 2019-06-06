import React from 'react';

import { NodeEventTypes } from '../../shared/NodeEventTypes';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeMenu } from '../shared/NodeMenu';

import { IconCard } from './templates/IconCard';

export class UnknownIntentRule extends React.Component {
  render() {
    const { id, data, onEvent } = this.props;
    return (
      <IconCard
        themeColor="#BFEAE9"
        label={data.$type.split('.')[1]}
        corner={<NodeMenu id={id} onEvent={onEvent} />}
        onClick={() => {
          if (focusedId === id) {
            onEvent(NodeEventTypes.Expand, id);
          } else {
            onEvent(NodeEventTypes.Focus, id);
          }
        }}
        onClickIcon={() => {
          onEvent(NodeEventTypes.Expand, id);
        }}
      />
    );
  }
}

UnknownIntentRule.propTypes = NodeProps;
UnknownIntentRule.defaultProps = defaultNodeProps;
