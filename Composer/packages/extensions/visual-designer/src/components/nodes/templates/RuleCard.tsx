/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { ConceptLabels } from 'shared';
import formatMessage from 'format-message';

import { NodeEventTypes } from '../../../constants/NodeEventTypes';
import { ObiFieldNames } from '../../../constants/ObiFieldNames';
import { ObiTypes } from '../../../constants/ObiTypes';
import { EventColor } from '../../../constants/ElementColors';
import { normalizeObiStep } from '../../../utils/stepBuilder';
import { ElementIcon } from '../../../utils/obiPropertyResolver';
import { NodeMenu } from '../../menus/NodeMenu';
import { CardProps } from '../nodeProps';

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

  switch (data.$type) {
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
      icon={ElementIcon.Play}
      onClick={onCardBodyClick}
      onChildDialogClick={openChildDialog}
    />
  );
};
