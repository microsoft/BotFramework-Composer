import React from 'react';

import { NodeEventTypes } from '../../shared/NodeEventTypes';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeMenu } from '../shared/NodeMenu';

import { IconCard } from './templates/IconCard';

export class EventRule extends React.Component {
  render() {
    const { id, data, focusedId, onEvent } = this.props;
    return (
      <IconCard
        themeColor="#B2D20E"
        corner={<NodeMenu id={id} onEvent={onEvent} />}
        label={data.events}
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

EventRule.propTypes = NodeProps;
EventRule.defaultProps = defaultNodeProps;
