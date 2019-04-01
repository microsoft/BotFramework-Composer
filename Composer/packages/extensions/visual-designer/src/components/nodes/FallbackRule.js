import React from 'react';

import { NodeClickActionTypes } from '../../utils/constant';

import { NodeProps, defaultNodeProps } from './sharedProps';
import { FormCard } from './templates/FormCard';

export class FallbackRule extends React.Component {
  render() {
    const { id, data, onEvent } = this.props;
    const { steps } = data;
    return (
      <FormCard
        themeColor="#0078D4"
        header="Fallback"
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

FallbackRule.propTypes = NodeProps;
FallbackRule.defaultProps = defaultNodeProps;
