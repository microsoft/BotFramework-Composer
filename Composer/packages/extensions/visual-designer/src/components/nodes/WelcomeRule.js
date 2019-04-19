import React from 'react';

import { NodeClickActionTypes } from '../../utils/constant';

import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { FormCard } from './templates/FormCard';

export class WelcomeRule extends React.Component {
  render() {
    const { id, data, onEvent } = this.props;
    const { steps } = data;
    return (
      <FormCard
        themeColor="#3C3C3C"
        header="Entry"
        label={data.$type.split('.')[1]}
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

WelcomeRule.propTypes = NodeProps;
WelcomeRule.defaultProps = defaultNodeProps;
