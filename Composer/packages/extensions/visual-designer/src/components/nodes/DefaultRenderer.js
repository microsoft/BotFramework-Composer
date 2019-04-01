import React from 'react';

import { NodeClickActionTypes } from '../../utils/constant';

import { FormCard } from './templates/FormCard';
import { NodeProps, defaultNodeProps } from './sharedProps';

export class DefaultRenderer extends React.Component {
  render() {
    const { id, data, onTriggerEvent } = this.props;
    const label = data.$type ? data.$type.split('.')[1] : '';
    return (
      <FormCard
        themeColor="#00B294"
        header="Step"
        label={label}
        onClick={() => {
          onTriggerEvent(NodeClickActionTypes.Focus, id);
        }}
      />
    );
  }
}

DefaultRenderer.propTypes = NodeProps;
DefaultRenderer.defaultProps = defaultNodeProps;
