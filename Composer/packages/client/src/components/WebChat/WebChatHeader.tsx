// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { ActionButton, DefaultButton, IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuProps } from 'office-ui-fabric-react/lib/ContextualMenu';
import formatMessage from 'format-message';
import { CommunicationColors, NeutralColors } from '@uifabric/fluent-theme';

import { RestartOption } from './type';

const customButtonStyles: IButtonStyles = {
  root: {
    border: 'none',
  },
  label: {
    fontWeight: '400',
    color: `${NeutralColors.black}`,
  },
  icon: {
    color: `${CommunicationColors.primary}`,
  },
  splitButtonMenuButton: { backgroundColor: `${NeutralColors.white}`, width: 28, border: 'none' },
  splitButtonMenuIcon: { fontSize: '7px' },
  splitButtonDivider: {
    backgroundColor: `${NeutralColors.gray50}`,
    width: 1,
    right: 26,
    position: 'absolute',
    top: 4,
    bottom: 4,
  },
};

export type WebChatHeaderProps = {
  currentRestartOption: RestartOption;
  onSetRestartOption: (restartOption: RestartOption) => void;
  conversationId: string;
  onRestartConversation: (conversationId: string, requireNewUserId: boolean) => Promise<any>;
  onSaveTranscript: (conversationId: string) => Promise<any>;
  openBotInEmulator: () => void;
};

export const WebChatHeader: React.FC<WebChatHeaderProps> = ({
  conversationId,
  currentRestartOption,
  onRestartConversation,
  onSaveTranscript,
  openBotInEmulator,
  onSetRestartOption,
}) => {
  const menuProps: IContextualMenuProps = {
    items: [
      {
        key: 'restartConversation',
        text: formatMessage('Restart Conversation - same user ID'),
        iconProps: { iconName: 'Refresh' },
        onClick: () => {
          onSetRestartOption(RestartOption.SameUserID);
          onRestartConversation(conversationId, false);
        },
      },
      {
        key: 'restartConversationWithNewUserId',
        text: formatMessage('Restart Conversation - new user ID'),
        iconProps: { iconName: 'Refresh' },
        onClick: () => {
          onSetRestartOption(RestartOption.NewUserID);
          onRestartConversation(conversationId, true);
        },
      },
    ],
  };

  return (
    <div data-testid="Webchat-Header" style={{ height: 36, borderBottom: `1px solid ${NeutralColors.gray60}` }}>
      <DefaultButton
        split
        aria-roledescription="split button"
        ariaLabel="restart-conversation"
        iconProps={{ iconName: 'Refresh' }}
        menuProps={menuProps}
        splitButtonAriaLabel="See 2 other restart conversation options"
        styles={customButtonStyles}
        text={
          currentRestartOption === RestartOption.SameUserID
            ? formatMessage('Restart Conversation - same user ID')
            : formatMessage('Restart Conversation - new user ID')
        }
        title="restart-conversation"
        onClick={() => {
          if (currentRestartOption === RestartOption.SameUserID) {
            onRestartConversation(conversationId, false);
          } else {
            onRestartConversation(conversationId, true);
          }
        }}
      />
      <ActionButton
        ariaDescription="Save conversation as transcript"
        ariaLabel="save-transcripts"
        data-testid="save-transcript"
        iconProps={{ iconName: 'Save' }}
        title="Save chat transcripts"
        onClick={() => onSaveTranscript(conversationId)}
      />
      <ActionButton
        ariaDescription="Open the bot in Emulator"
        data-testid="open-emulator"
        iconProps={{
          iconName: 'OpenInNewTab',
        }}
        styles={{ root: { height: '20px' } }}
        title="Open in Emulator"
        onClick={openBotInEmulator}
      ></ActionButton>
    </div>
  );
};
