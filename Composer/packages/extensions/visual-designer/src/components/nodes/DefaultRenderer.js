import React from 'react';

import { ConceptLabels } from '../../shared/labelMap';
import { NodeEventTypes } from '../../shared/NodeEventTypes';
import { ObiTypes } from '../../shared/ObiTypes';
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
  [ObiTypes.IfCondition]: {
    label: 'condition',
  },
  [ObiTypes.DeleteProperty]: {
    label: 'property',
  },
  [ObiTypes.TextInput]: {
    label: 'prompt',
    details: 'property',
  },
  [ObiTypes.NumberInput]: {
    label: 'prompt',
    details: 'property',
  },
  [ObiTypes.IntegerInput]: {
    label: 'prompt',
    details: 'property',
  },
  [ObiTypes.FloatInput]: {
    label: 'prompt',
    details: 'property',
  },
  [ObiTypes.ConfirmInput]: {
    label: 'prompt',
    details: 'property',
  },
  [ObiTypes.ChoiceInput]: {
    label: 'prompt',
    details: 'property',
  },
  [ObiTypes.EndDialog]: {
    details: 'property',
  },
  [ObiTypes.CancelAllDialogs]: {
    label: 'eventName',
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
    if (keyMap) {
      header = header || data[keyMap.header] || header;
      label = data[keyMap.label] || label;
      details = data[keyMap.details] || details;
    }

    // does a static label exist for this
    if (!label && data.$type && ConceptLabels[data.$type]) {
      label = ConceptLabels[data.$type];
    }

    // if (data.$type && ContentKeyByTypes[data.$type] && ContentKeyByTypes[data.$type].text) {
    //   label = ContentKeyByTypes[data.$type].text;
    // }

    if (!header) {
      header = truncateType(data.$type);
    }

    // change color of header based on type of node
    // message nodes are green, other nodes are gray
    let color = '#656565';
    if (isMessageNode(data.$type)) {
      color = '#00A989';
    }

    return (
      <FormCard
        themeColor={color}
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

function isMessageNode(type) {
  const messageNodes = [
    'Microsoft.SendActivity',
    'Microsoft.TextInput',
    'Microsoft.NumberInput',
    'Microsoft.IntegerInput',
    'Microsoft.FloatInput',
    'Microsoft.ChoiceInput',
    'Microsoft.ConfirmInput',
  ];

  return messageNodes.indexOf(type) > -1;
}

DefaultRenderer.propTypes = NodeProps;
DefaultRenderer.defaultProps = defaultNodeProps;
