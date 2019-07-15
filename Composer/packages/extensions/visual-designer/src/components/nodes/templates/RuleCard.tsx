import React from 'react';
// import { Icon } from 'office-ui-fabric-react';
import { ConceptLabels } from 'shared-menus';

import { NodeEventTypes } from '../../../shared/NodeEventTypes';
import { NodeMenu } from '../../shared/NodeMenu';
import { ObiTypes } from '../../../shared/ObiTypes';
import { normalizeObiStep } from '../../../transformers/helpers/elementBuilder';
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
    /**
     * If it is currently selected, navigate to the Rule's steps. If there is only
     * one Step and is a BeginDialog, navigate inside the BeginDialog.
     *
     * REF: https://github.com/microsoft/BotFramework-Composer/pull/326#pullrequestreview-245538064
     */
    // const directJumpDialog = getDirectJumpDialog(data);
    // if (directJumpDialog) {
    //   return onEvent(NodeEventTypes.OpenLink, directJumpDialog);
    // } else {
    return onEvent(NodeEventTypes.Expand, id);
    // }
  };

  const openChildDialog = () => {
    const directJumpDialog = getDirectJumpDialog(data);
    console.log('Child dialog click!', data);
    if (directJumpDialog) {
      return onEvent(NodeEventTypes.OpenLink, directJumpDialog);
    }
  };

  const onCardBodyClick = () => {
    console.log('card body click');
    if (focusedId === id) {
      openNode();
    } else {
      focusNode();
    }
  };

  // const onCardNavClick = () => {
  //   openNode();
  // };

  let text = '';
  let dialog = null;

  if (!data.steps) {
    text = 'No actions';
  } else if (data.steps.length == 1) {
    let step = normalizeObiStep(data.steps[0]);

    if (step.$type == ObiTypes.BeginDialog) {
      dialog = step.dialog;
      text = ConceptLabels[step.$type].title || step.$type;
    } else {
      text = '1 step: ' + ConceptLabels[step.$type].title || step.$type;
    }
    // if (step.$type == ObiTypes.SendActivity) {
    //   lines.push(step.text);
    // }
  } else {
    text = data.steps.length + ' steps';
  }

  return (
    <IconCard
      themeColor={getElementColor(DialogGroup.RULE).expanded}
      iconColor={getElementColor(DialogGroup.RULE).iconColor}
      corner={
        <div style={{ display: 'flex' }}>
          {/* <Icon
            style={{ lineHeight: '16px', fontSize: '16px' }}
            onClick={e => {
              e.stopPropagation();
              onCardNavClick();
            }}
            iconName="OpenSource"
            data-testid="OpenIcon"
          /> */}

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
