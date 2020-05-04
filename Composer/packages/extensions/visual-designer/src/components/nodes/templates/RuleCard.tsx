// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { ConceptLabels } from '@bfc/shared';
import formatMessage from 'format-message';

import { NodeEventTypes } from '../../../constants/NodeEventTypes';
import { ObiFieldNames } from '../../../constants/ObiFieldNames';
import { ObiTypes } from '../../../constants/ObiTypes';
import { EventColor } from '../../../constants/ElementColors';
import { normalizeObiStep } from '../../../utils/stepBuilder';
import { ElementIcon } from '../../../utils/obiPropertyResolver';
import { NodeMenu } from '../../menus/NodeMenu';
import { CardProps } from '../nodeProps';
import { DefaultColors } from '../../../constants/ElementColors';

import { IconCard } from './IconCard';

const StepsKey = ObiFieldNames.Actions;

const getDirectJumpDialog = (data) => {
  const steps = data[StepsKey];
  if (!Array.isArray(steps) || steps.length !== 1) {
    return null;
  }
  const step = normalizeObiStep(steps[0]);
  return step.$kind === ObiTypes.BeginDialog ? step.dialog : null;
};

const colors = DefaultColors;

export const RuleCard: React.FC<CardProps> = ({ id, data, label, onEvent }): JSX.Element => {
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

  switch (data.$kind) {
    case ObiTypes.OnIntent:
      if (data.intent) {
        trigger = data.intent;
      } else {
        // Leave blank
      }
      break;

    case ObiTypes.OnCondition:
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
    if (step.$kind === ObiTypes.BeginDialog) {
      dialog = step.dialog;
      summary = ConceptLabels[step.$kind].title || step.$kind;
    } else {
      summary = formatMessage('1 action: {step}', { step: (ConceptLabels[step.$kind] || {}).title || step.$kind });
    }
  } else {
    summary = formatMessage('{count} actions', { count: data[StepsKey].length });
  }

  return (
    <IconCard
      childDialog={dialog}
      corner={
        <div css={{ display: 'flex' }}>
          <NodeMenu colors={colors} id={id} onEvent={onEvent} />
        </div>
      }
      icon={ElementIcon.Play}
      iconColor={EventColor.iconColor}
      label={label}
      onChildDialogClick={openChildDialog}
      onClick={onCardBodyClick}
      summary={summary}
      themeColor={EventColor.expanded}
      trigger={trigger}
    />
  );
};
