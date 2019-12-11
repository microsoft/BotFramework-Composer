// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { NodeEventTypes } from '../types/NodeEventTypes';
import { ObiTypes } from '../../../constants/ObiTypes';
import { getElementColor, getElementIcon } from '../../../utils/obiPropertyResolver';
import { FormCard } from '../templates/FormCard';
import { NodeProps, defaultNodeProps } from '../types/nodeProps';
import { getFriendlyName } from '../utils';

const truncateType = $type => (typeof $type === 'string' ? $type.split('Microsoft.')[1] : '');

const DefaultKeyMap = {
  label: 'property',
};

/**
 * Create labels out of compound values
 */
function makeLabel(data) {
  switch (data.$type) {
    case ObiTypes.SetProperty:
      return `{${data.property || '?'}} = ${data.value || '?'}`;
    case ObiTypes.InitProperty:
      return `{${data.property || '?'}} = new ${data.type || '?'}`;
    case ObiTypes.EditArray:
      return `${data.changeType} {${data.itemsProperty || '?'}}`;
    case ObiTypes.ForeachDetail:
      return `Each value in {${data.itemsProperty || '?'}}`;
    case ObiTypes.ForeachPageDetail:
      return `Each page of ${data.pageSize || '?'} in {${data.itemsProperty || '?'}}`;

    default:
      return '';
  }
}

const ContentKeyByTypes: {
  [key: string]: {
    [key: string]: string;
  };
} = {
  [ObiTypes.EditArray]: {
    label: 'changeType',
    details: 'arrayProperty',
  },
  [ObiTypes.InitProperty]: {
    label: 'property',
  },
  [ObiTypes.SetProperty]: {
    label: 'property',
  },
  [ObiTypes.ConditionNode]: {
    header: 'Branch',
    label: 'condition',
  },
  [ObiTypes.DeleteProperty]: {
    label: 'property',
  },
  [ObiTypes.IfCondition]: {
    label: 'condition',
  },
  [ObiTypes.SwitchCondition]: {
    label: 'condition',
  },
  [ObiTypes.ForeachDetail]: {
    header: 'Loop: For Each',
    label: 'itemsProperty',
  },
  [ObiTypes.ForeachPageDetail]: {
    header: 'Loop: For Each Page',
    label: 'itemsProperty',
  },
  [ObiTypes.TextInput]: {
    label: 'prompt',
    details: 'property',
  },
  [ObiTypes.NumberInput]: {
    label: 'prompt',
    details: 'property',
  },
  [ObiTypes.ConfirmInput]: {
    label: 'prompt',
    details: 'property',
  },
  [ObiTypes.AttachmentInput]: {
    label: 'prompt',
    details: 'property',
  },
  [ObiTypes.EndDialog]: {
    details: 'property',
    text: 'End this dialog',
  },
  [ObiTypes.CancelAllDialogs]: {
    label: 'eventName',
    text: 'Cancel all active dialogs',
  },
  [ObiTypes.EndTurn]: {
    text: 'Wait for another message',
  },
  [ObiTypes.EmitEvent]: {
    label: 'eventName',
  },
  [ObiTypes.HttpRequest]: {
    label: 'url',
  },
  [ObiTypes.TraceActivity]: {
    label: 'name',
  },
  [ObiTypes.LogAction]: {
    label: 'text',
  },
  [ObiTypes.EditActions]: {
    label: 'changeType',
  },
  [ObiTypes.QnAMakerDialog]: {
    label: 'hostname',
  },
  [ObiTypes.OAuthInput]: {
    label: 'tokenProperty',
  },
};

/**
 * DefaultRenderer is designed for rendering simple or unrecognized OBI elements.
 * Only the 'Focus' event could be triggered in it, if an element wants trigger
 * more events like 'Expand' or 'Open', it should define a renderer it self to
 * control its behavior.
 */

export class DefaultRenderer extends React.Component<NodeProps, {}> {
  static defaultProps = defaultNodeProps;
  render() {
    const { id, data, onEvent, renderers } = this.props;
    const { NodeMenu } = renderers;
    let header = getFriendlyName(data),
      label = '';

    const keyMap = data.$type ? ContentKeyByTypes[data.$type] || DefaultKeyMap : { label: '', details: '' };
    const icon = getElementIcon(data.$type);
    const nodeColors = getElementColor(data.$type);

    if (keyMap) {
      header = header || keyMap.header || '';
      label = data[keyMap.label] || label;
    }

    if (makeLabel(data)) {
      label = makeLabel(data);
    }

    if (data.$type && ContentKeyByTypes[data.$type] && ContentKeyByTypes[data.$type].text) {
      label = ContentKeyByTypes[data.$type].text;
    }

    if (!header) {
      header = truncateType(data.$type);
    }

    return (
      <FormCard
        nodeColors={nodeColors}
        header={header}
        corner={<NodeMenu nodeId={id} onEvent={onEvent} />}
        icon={icon}
        label={label}
        onClick={() => {
          onEvent(id, NodeEventTypes.ClickNode);
        }}
      />
    );
  }
}
