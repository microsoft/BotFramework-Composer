import React from 'react';

import { NodeEventTypes } from '../../shared/NodeEventTypes';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeMenu } from '../shared/NodeMenu';

import { IconButton } from './templates/IconButton';

export class EventRule extends React.Component {
  render() {
    const { id, data, onEvent } = this.props;
    const { steps } = data;
    return (
      <IconButton
        themeColor="#B2D20E"
        corner={<NodeMenu id={id} onEvent={onEvent} />}
        label={data.events}
        onClick={() => {
          if (Array.isArray(steps) && steps.length) {
            onEvent(NodeEventTypes.Expand, id);
          } else {
            onEvent(NodeEventTypes.Focus, id);
          }
        }}
      />
    );
  }
}

EventRule.propTypes = NodeProps;
EventRule.defaultProps = defaultNodeProps;
