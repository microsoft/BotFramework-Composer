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

  let text = '';
  let dialog = null;

  if (!data.steps) {
    text = formatMessage('No actions');
  } else if (data.steps.length == 1) {
    const step = normalizeObiStep(data.steps[0]);
    if (step.$type == ObiTypes.BeginDialog) {
      dialog = step.dialog;
      text = formatMessage(ConceptLabels[step.$type].title || step.$type);
    } else {
      text = formatMessage('1 action: {step}', { step: ConceptLabels[step.$type].title || step.$type });
    }
  } else {
    text = formatMessage('{count} actions.', { count: data.steps.length });
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
      text={text}
      childDialog={dialog}
      icon="MessageBot"
      onClick={onCardBodyClick}
      onChildDialogClick={openChildDialog}
    />
  );
};
