import React from 'react';

import { NodeClickActionTypes } from '../../utils/constant';

import { FormCard } from './templates/FormCard';
import { NodeProps, defaultNodeProps } from './sharedProps';

export class IntentRule extends React.Component {
  render() {
    const { id, data, onEvent } = this.props;
    const { intent, steps } = data;
    return (
      <FormCard
        themeColor="#0078D4"
        header="Decision"
        label={intent}
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

IntentRule.propTypes = NodeProps;
IntentRule.defaultProps = defaultNodeProps;
