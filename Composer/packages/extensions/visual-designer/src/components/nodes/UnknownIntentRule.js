import React from 'react';

import { NodeEventTypes } from '../../shared/NodeEventTypes';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';

import { FormCard } from './templates/FormCard';
import { NodeMenu } from './templates/NodeMenu';
import { getFriendlyName } from './utils';

export class UnknownIntentRule extends React.Component {
  render() {
    const { id, data, onEvent } = this.props;
    const { steps } = data;
    return (
      <FormCard
        themeColor="#BAD80A"
        header={getFriendlyName(data) || 'UnknownIntentRule'}
        corner={<NodeMenu onEvent={e => onEvent(e, id)} />}
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
