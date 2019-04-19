import React from 'react';

import { NodeClickActionTypes } from '../../utils/constant';
import { ObiTypes } from '../../transformers/constants/ObiTypes';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';

import { FormCard } from './templates/FormCard';

const truncateType = $type => (typeof $type === 'string' ? $type.split('Microsoft.')[1] : '');

const ContentKeyByTypes = {
  [ObiTypes.SendActivity]: {
    label: 'activity',
  },
  [ObiTypes.EditArray]: {
    label: 'changeType',
    details: 'arrayProperty',
  },
  [ObiTypes.SaveEntity]: {
    label: 'entity',
    details: 'property',
  },
  [ObiTypes.IfCondition]: {
    label: 'condition',
  },
  [ObiTypes.DeleteProperty]: {
    label: 'property',
  },
  [ObiTypes.TextInput]: {
    label: 'property',
    details: 'prompt',
  },
};

/**
 * DefaultRenderer is designed for rendering simple or unrecognized OBI elements.
 * Only the 'Focus' event could be triggered in it, if an element wants trigger
 * more events like 'Expand' or 'Open', it should define a renderer it self to
 * control its behavior.
 */
export class DefaultRenderer extends React.Component {
  render() {
    const { id, data, onEvent } = this.props;
    let header = truncateType(data.$type),
      label = '',
      details = '';

    const keyMap = data.$type ? ContentKeyByTypes[data.$type] : null;
    if (keyMap) {
      header = data[keyMap.header] || header;
      label = data[keyMap.label] || label;
      details = data[keyMap.details] || details;
    }

    return (
      <FormCard
        themeColor="#00B294"
        header={header}
        label={label}
        details={details}
        onClick={() => {
          onEvent(NodeClickActionTypes.Focus, id);
        }}
      />
    );
  }
}

DefaultRenderer.propTypes = NodeProps;
DefaultRenderer.defaultProps = defaultNodeProps;
