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

/**
 * Create labels out of compound values
 */
function makeLabel(data) {
  switch (data.$type) {
    case ObiTypes.SetProperty:
      return `${data.property || '?'} = ${data.value || '?'}`;
    case ObiTypes.SaveEntity:
      return `${data.property || '?'} = ${data.entity || '?'}`;
    case ObiTypes.InitProperty:
      return `${data.property || '?'} = new ${data.type || '?'}`;
    case ObiTypes.EditArray:
      return `${data.changeType} ${data.arrayProperty || '?'}`;
    default:
      return '';
  }
}

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
    text: 'End this dialog',
  },
  [ObiTypes.CancelAllDialogs]: {
    label: 'eventName',
    text: 'Cancel all active dialogs',
  },
  [ObiTypes.EndTurn]: {
    text: 'End turn, then wait for another message',
  },
  [ObiTypes.RepeatDialog]: {
    text: 'Restart this dialog',
  },
  [ObiTypes.EmitEvent]: {
    label: 'eventName',
  },
  [ObiTypes.CodeStep]: {
    text: 'Run custom code',
  },
  [ObiTypes.HttpRequest]: {
    label: 'url',
  },
  [ObiTypes.TraceActivity]: {
    label: 'valueProperty',
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
