import React from 'react';
import { Icon } from 'office-ui-fabric-react';

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
    /**
     * If it is currently selected, navigate to the Rule's steps. If there is only
     * one Step and is a BeginDialog, navigate inside the BeginDialog.
     *
     * REF: https://github.com/microsoft/BotFramework-Composer/pull/326#pullrequestreview-245538064
     */
    const directJumpDialog = getDirectJumpDialog(data);
    if (directJumpDialog) {
      return onEvent(NodeEventTypes.OpenLink, directJumpDialog);
    } else {
      return onEvent(NodeEventTypes.Expand, id);
    }
  };

  const onCardBodyClick = () => {
    if (focusedId === id) {
      openNode();
    } else {
      focusNode();
    }
  };

  const onCardNavClick = () => {
    openNode();
  };

  return (
    <IconCard
      themeColor={getElementColor(DialogGroup.RULE).expanded}
      corner={
        <div style={{ display: 'flex' }}>
          <Icon
            style={{ lineHeight: '16px', fontSize: '16px' }}
            onClick={e => {
              e.stopPropagation();
              onCardNavClick();
            }}
            iconName="OpenSource"
            data-testid="OpenIcon"
          />

          <NodeMenu id={id} onEvent={onEvent} />
        </div>
      }
      label={label}
      icon="MessageBot"
      onClick={onCardBodyClick}
    />
  );
};
