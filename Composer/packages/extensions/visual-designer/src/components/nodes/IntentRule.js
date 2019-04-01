import React from 'react';

import { NodeClickActionTypes } from '../../utils/constant';

import { FormCard } from './templates/FormCard';
import { NodeProps, defaultNodeProps } from './sharedProps';

export class IntentRule extends React.Component {
  render() {
    const { id, data, onTriggerEvent } = this.props;
    const { intent, steps } = data;
    return (
      <FormCard
        themeColor="#0078D4"
        header="Decision"
        label={intent}
        onClick={() => {
          if (Array.isArray(steps) && steps.length) {
            onTriggerEvent(NodeClickActionTypes.Expand, id);
          } else {
            onTriggerEvent(NodeClickActionTypes.Focus, id);
          }
        }}
      />
    );
  }
}

IntentRule.propTypes = NodeProps;
IntentRule.defaultProps = defaultNodeProps;
