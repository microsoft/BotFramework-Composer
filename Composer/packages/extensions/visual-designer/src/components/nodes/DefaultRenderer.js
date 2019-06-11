import React from 'react';

import { NodeEventTypes } from '../../shared/NodeEventTypes';
import { ObiTypes } from '../../shared/ObiTypes';
import { getDialogGroupByType } from '../../shared/appschema';
import { getElementColor } from '../../shared/elementColors';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeMenu } from '../shared/NodeMenu';

import { FormCard } from './templates/FormCard';
import { getFriendlyName } from './utils';

const truncateType = $type => (typeof $type === 'string' ? $type.split('Microsoft.')[1] : '');

const DefaultKeyMap = {
  label: 'property',
};

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
  [ObiTypes.ConditionNode]: {
    header: 'Branch',
    label: 'condition',
  },
  [ObiTypes.DeleteProperty]: {
    label: 'property',
  },
  [ObiTypes.TextInput]: {
    label: 'property',
    details: 'prompt',
  },
  [ObiTypes.LogStep]: {
    label: 'text',
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
    let header = getFriendlyName(data),
      label = '',
      details = '';

    const keyMap = data.$type ? ContentKeyByTypes[data.$type] || DefaultKeyMap : null;
    const nodeColors = getElementColor(getDialogGroupByType(data.$type));
    if (keyMap) {
      header = header || keyMap.header || '';
      label = data[keyMap.label] || label;
      details = data[keyMap.details] || details;
    }

    if (!header) {
      header = truncateType(data.$type);
    }

    return (
      <FormCard
        nodeColors={nodeColors}
        header={header}
        corner={<NodeMenu id={id} onEvent={onEvent} />}
        label={label}
        details={details}
        onClick={() => {
          onEvent(NodeEventTypes.Focus, id);
        }}
      />
    );
  }
}

DefaultRenderer.propTypes = NodeProps;
DefaultRenderer.defaultProps = defaultNodeProps;
