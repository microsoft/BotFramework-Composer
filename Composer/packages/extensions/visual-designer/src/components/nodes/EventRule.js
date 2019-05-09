import React from 'react';

import { NodeEventTypes } from '../../shared/NodeEventTypes';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';

import { FormCard } from './templates/FormCard';
import { getFriendlyName } from './utils';

export class EventRule extends React.Component {
  render() {
    const { id, data, onEvent } = this.props;
    const { steps } = data;
    return (
      <FormCard
        themeColor="#BAD80A"
        header={getFriendlyName(data) || 'EventRule'}
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
