import React from 'react';

import { NodeProps, defaultNodeProps } from './sharedProps';
import { FormCard } from './templates/FormCard';
import { NodeClickActionTypes } from '../../utils/constant';

export class FallbackRule extends React.Component {
  render() {
    const { id, data, onTriggerEvent } = this.props;
    return (
      <FormCard
        themeColor="#0078D4"
        header="Fallback"
        label={data.$type.split('.')[1]}
        onClick={() => {
          onTriggerEvent(NodeClickActionTypes.Focus, id);
        }}
      />
    );
  }
}

FallbackRule.propTypes = NodeProps;
FallbackRule.defaultProps = defaultNodeProps;
