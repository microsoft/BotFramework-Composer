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
import { DefaultColors } from '../../../constants/ElementColors';
import { IconCard } from './IconCard';
var StepsKey = ObiFieldNames.Actions;
var getDirectJumpDialog = function (data) {
  var steps = data[StepsKey];
  if (!Array.isArray(steps) || steps.length !== 1) {
    return null;
  }
  var step = normalizeObiStep(steps[0]);
  return step.$kind === ObiTypes.BeginDialog ? step.dialog : null;
};
var colors = DefaultColors;
export var RuleCard = function (_a) {
  var id = _a.id,
    data = _a.data,
    label = _a.label,
    onEvent = _a.onEvent;
  var openNode = function () {
    return onEvent(NodeEventTypes.Expand, id);
  };
  var openChildDialog = function () {
    var directJumpDialog = getDirectJumpDialog(data);
    if (directJumpDialog) {
      return onEvent(NodeEventTypes.OpenDialog, { caller: id, callee: directJumpDialog });
    }
  };
  var onCardBodyClick = function () {
    openNode();
  };
  var summary = '';
  var trigger = '';
  var dialog = null;
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
          '{event} {\n          count, plural,\n             =0 {}\n          other {+#}\n        }',
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
    var step = normalizeObiStep(data[StepsKey][0]);
    if (step.$kind === ObiTypes.BeginDialog) {
      dialog = step.dialog;
      summary = ConceptLabels[step.$kind].title || step.$kind;
    } else {
      summary = formatMessage('1 action: {step}', { step: (ConceptLabels[step.$kind] || {}).title || step.$kind });
    }
  } else {
    summary = formatMessage('{count} actions', { count: data[StepsKey].length });
  }
  return jsx(IconCard, {
    childDialog: dialog,
    corner: jsx('div', { css: { display: 'flex' } }, jsx(NodeMenu, { colors: colors, id: id, onEvent: onEvent })),
    icon: ElementIcon.Play,
    iconColor: EventColor.iconColor,
    label: label,
    summary: summary,
    themeColor: EventColor.expanded,
    trigger: trigger,
    onChildDialogClick: openChildDialog,
    onClick: onCardBodyClick,
  });
};
//# sourceMappingURL=RuleCard.js.map
