import React from 'react';

import { NodeEventTypes } from '../../shared/NodeEventTypes';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeMenu } from '../shared/NodeMenu';

import { FormCard } from './templates/FormCard';
import { getFriendlyName } from './utils';

export class UnknownIntentRule extends React.Component {
  render() {
    const { id, data, onEvent } = this.props;
    const { steps } = data;
    return (
      <FormCard
        themeColor="#BAD80A"
        header={getFriendlyName(data) || 'UnknownIntentRule'}
        corner={<NodeMenu id={id} onEvent={onEvent} />}
        label={data.$type.split('.')[1]}
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

UnknownIntentRule.propTypes = NodeProps;
UnknownIntentRule.defaultProps = defaultNodeProps;
