import React from 'react';

import { NodeClickActionTypes } from '../../utils/constant';

import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { FormCard } from './templates/FormCard';

export class NoMatchRule extends React.Component {
  render() {
    const { id, data, onEvent } = this.props;
    const { steps } = data;
    return (
      <FormCard
        themeColor="#BAD80A"
        header="NoMatchRule"
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

NoMatchRule.propTypes = NodeProps;
NoMatchRule.defaultProps = defaultNodeProps;
