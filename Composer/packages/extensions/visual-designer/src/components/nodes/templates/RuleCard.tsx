import React from 'react';
// import { Icon } from 'office-ui-fabric-react';
import { ConceptLabels } from 'shared-menus';
import formatMessage from 'format-message';

import { NodeEventTypes } from '../../../shared/NodeEventTypes';
import { NodeMenu } from '../../shared/NodeMenu';
import { ObiTypes } from '../../../shared/ObiTypes';
import { normalizeObiStep } from '../../../shared/elementBuilder';
import { getElementColor } from '../../../shared/elementColors';
import { DialogGroup } from '../../../shared/appschema';

import { IconCard } from './IconCard';

const getDirectJumpDialog = data => {
  const { steps } = data;
  if (!Array.isArray(steps) || steps.length !== 1) {
    return null;
  }
  const step = normalizeObiStep(steps[0]);
  return step.$type === ObiTypes.BeginDialog ? step.dialog : null;
};

export const RuleCard = ({ id, data, label, focusedId, onEvent }) => {
  const focusNode = () => {
    return onEvent(NodeEventTypes.Focus, id);
  };

  const openNode = () => {
    return onEvent(NodeEventTypes.Expand, id);
  };

  const openChildDialog = () => {
    const directJumpDialog = getDirectJumpDialog(data);
    if (directJumpDialog) {
      return onEvent(NodeEventTypes.OpenLink, directJumpDialog);
    }
  };

  const onCardBodyClick = () => {
    if (focusedId === id) {
      openNode();
    } else {
      focusNode();
    }
  };

  let summary = '';
  let trigger = '';
  let dialog = null;

  if (data.$type == ObiTypes.IntentRule) {
    if (data.intent) {
      trigger = formatMessage('{intent}', { intent: data.intent });
    } else {
      trigger = formatMessage('? intent');
    }
  } else if (data.$type == ObiTypes.EventRule) {
    if (data.events && data.events.length) {
      if (data.events.length > 1) {
        trigger = formatMessage('{event} +{count}', { event: data.events[0], count: data.events.length - 1 });
      } else {
        trigger = formatMessage('{event}', { event: data.events[0] });
      }
    } else {
      trigger = formatMessage('? event');
    }
  } else if (data.$type == ObiTypes.UnknownIntentRule) {
    trigger = 'Unknown Intent';
  } else if (data.$type == ObiTypes.ConversationUpdateActivityRule) {
    trigger = 'Conversation Update';
  }

  if (!data.steps) {
    summary = formatMessage('No actions');
  } else if (data.steps.length == 1) {
    const step = normalizeObiStep(data.steps[0]);
    if (step.$type == ObiTypes.BeginDialog) {
      dialog = step.dialog;
      summary = formatMessage(ConceptLabels[step.$type].title || step.$type);
    } else {
      summary = formatMessage('1 action: {step}', { step: ConceptLabels[step.$type].title || step.$type });
    }
  } else {
    summary = formatMessage('{count} actions', { count: data.steps.length });
  }

  return (
    <IconCard
      themeColor={getElementColor(DialogGroup.RULE).expanded}
      iconColor={getElementColor(DialogGroup.RULE).iconColor}
      corner={
        <div style={{ display: 'flex' }}>
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
