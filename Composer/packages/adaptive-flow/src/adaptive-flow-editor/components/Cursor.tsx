// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import React from 'react';

import { ExternalAction, NodeEventTypes } from '../../adaptive-flow-renderer/constants/NodeEventTypes';

const styles = css`
  position: absolute;
`;

type CursorProps = {
  externalEvent?: ExternalAction;
  images?: any;
  visible: boolean;
};

const Cursor = React.forwardRef(({ externalEvent, images, visible }: CursorProps, ref: React.Ref<HTMLDivElement>) => {
  let image;
  switch (externalEvent?.eventData?.kind) {
    case 'Microsoft.TextInput':
    case 'Microsoft.NumberInput':
    case 'Microsoft.ConfirmInput':
    case 'Microsoft.ChoiceInput':
    case 'Microsoft.AttachmentInput':
    case 'Microsoft.DateTimeInput':
    case 'Microsoft.OAuthInput':
    case 'Microsoft.Ask':
      image = images.botAndUser;
      break;
    case 'Microsoft.IfCondition':
    case 'Microsoft.SwitchCondition':
      image = images.condition;
      break;
    case 'Microsoft.Foreach':
    case 'Microsoft.ForeachPage':
    case 'Microsoft.ContinueLoop':
    case 'Microsoft.BreakLoop':
      image = images.loop;
      break;
    case 'Microsoft.EndDialog':
    case 'Microsoft.EndTurn':
    case 'Microsoft.RepeatDialog':
    case 'Microsoft.SignOutUser':
    case 'Microsoft.LogAction':
    case 'Microsoft.EmitEvent':
      image = images.node;
      break;
    case 'Microsoft.BeginDialog':
    case 'Microsoft.CancelAllDialogs':
    case 'Microsoft.ReplaceDialog':
    case 'Microsoft.SetProperty':
    case 'Microsoft.SetProperties':
    case 'Microsoft.DeleteProperty':
    case 'Microsoft.DeleteProperties':
    case 'Microsoft.EditArray':
    case 'Microsoft.UpdateActivity':
    case 'Microsoft.DeleteActivity':
    case 'Microsoft.GetConversationMembers':
    case 'Microsoft.HttpRequest':
    case 'Microsoft.QnAMakerDialog':
    case 'Microsoft.ThrowException':
    case 'Microsoft.TraceActivity':
    case 'Microsoft.TelemetryTrackEvent':
      image = images.node;
      break;
    case 'Microsoft.GetActivityMembers':
      image = images.nodeWithTwoInputs;
      break;
    case 'Microsoft.BeginSkill':
      image = images.skills;
      break;
    default:
      image = images.bot;
      break;
  }

  return visible && externalEvent?.eventData?.kind && externalEvent.eventType === NodeEventTypes.Insert ? (
    <div ref={ref} css={styles}>
      <div>
        <Icon
          iconName="CircleAdditionSolid"
          styles={{ root: { color: '#0b6a0b', position: 'absolute', right: '-8px', top: '-8px' } }}
        />
        <img alt="Welcome" src={image} />
      </div>
    </div>
  ) : null;
});

export { Cursor };
