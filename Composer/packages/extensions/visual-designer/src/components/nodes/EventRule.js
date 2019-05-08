import React from 'react';

import { NodeClickActionTypes } from '../../shared/NodeClickActionTypes';
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
            onEvent(NodeClickActionTypes.Expand, id);
          } else {
            onEvent(NodeClickActionTypes.Focus, id);
          }
        }}
      />
    );
  }
}

EventRule.propTypes = NodeProps;
EventRule.defaultProps = defaultNodeProps;
