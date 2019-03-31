import React from 'react';

import { NodeProps, defaultNodeProps } from './sharedProps';
import { FormCard } from './templates/FormCard';
import { NodeClickActionTypes } from '../../utils/constant';

export class WelcomeRule extends React.Component {
  render() {
    const { id, data, onTriggerEvent } = this.props;
    const { steps } = data;
    return (
      <FormCard
        themeColor="#3C3C3C"
        header="Entry"
        label={data.$type.split('.')[1]}
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

WelcomeRule.propTypes = NodeProps;
WelcomeRule.defaultProps = defaultNodeProps;
