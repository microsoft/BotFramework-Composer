/** @jsx jsx */
import { jsx } from '@emotion/core';
import { ConceptLabels } from 'shared-menus';
import formatMessage from 'format-message';

import { NodeEventTypes } from '../../../constants/NodeEventTypes';
import { ObiFieldNames } from '../../../constants/ObiFieldNames';
import { ObiTypes } from '../../../constants/ObiTypes';
import { EventColor } from '../../../constants/ElementColors';
import { normalizeObiStep } from '../../../utils/stepBuilder';
import { NodeMenu } from '../../menus/NodeMenu';

import { IconCard } from './IconCard';

const StepsKey = ObiFieldNames.Actions;

const getDirectJumpDialog = data => {
  const steps = data[StepsKey];
  if (!Array.isArray(steps) || steps.length !== 1) {
    return null;
  }
  const step = normalizeObiStep(steps[0]);
  return step.$type === ObiTypes.BeginDialog ? step.dialog : null;
};

export const RuleCard = ({ id, data, label, focused, onEvent }): JSX.Element => {
  const focusNode = () => {
    return onEvent(NodeEventTypes.Focus, id);
  };

  const openNode = () => {
    return onEvent(NodeEventTypes.Expand, id);
  };

  const openChildDialog = () => {
    const directJumpDialog = getDirectJumpDialog(data);
    if (directJumpDialog) {
      return onEvent(NodeEventTypes.OpenDialog, { caller: id, callee: directJumpDialog });
    }
  };

  const onCardBodyClick = () => {
    openNode();
  };

  let summary = '';
  let trigger = '';
  let dialog = null;

  switch (data.$type) {
    case ObiTypes.OnIntent:
      if (data.intent) {
        trigger = data.intent;
      } else {
        // Leave blank
      }
      break;

    case ObiTypes.OnEvent:
      if (data.events && data.events.length) {
        trigger = formatMessage(
          `{event} {
          count, plural,
             =0 {}
          other {+#}
        }`,
          {
            event: data.events[0],
            count: data.events.length - 1,
          }
        );
      } else {
        // Leave blank
      }
      break;

    case ObiTypes.OnUnknownIntent:
      trigger = formatMessage('Unknown Intent');
      break;

    case ObiTypes.OnConversationUpdateActivity:
      trigger = formatMessage('Conversation Update');
      break;
  }

  if (!data[StepsKey]) {
    summary = formatMessage('No actions');
  } else if (data[StepsKey].length == 1) {
    const step = normalizeObiStep(data[StepsKey][0]);
    if (step.$type === ObiTypes.BeginDialog) {
      dialog = step.dialog;
      summary = ConceptLabels[step.$type].title || step.$type;
    } else {
      summary = formatMessage('1 action: {step}', { step: (ConceptLabels[step.$type] || {}).title || step.$type });
    }
  } else {
    summary = formatMessage('{count} actions', { count: data[StepsKey].length });
  }

  return (
    <IconCard
      themeColor={EventColor.expanded}
      iconColor={EventColor.iconColor}
      corner={
        <div css={{ display: 'flex' }}>
          <NodeMenu id={id} onEvent={onEvent} />
        </div>
      }
      label={label}
      trigger={trigger}
      summary={summary}
      childDialog={dialog}
      icon="Play"
      onClick={onCardBodyClick}
      onChildDialogClick={openChildDialog}
    />
  );
};
