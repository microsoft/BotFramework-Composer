// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import { HighContrastSelector } from 'office-ui-fabric-react/lib';
import { ActionButton, DefaultButton, IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuProps } from 'office-ui-fabric-react/lib/ContextualMenu';
import formatMessage from 'format-message';
import { CommunicationColors, NeutralColors } from '@uifabric/fluent-theme';

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
  splitButtonContainer: {
    selectors: {
      [HighContrastSelector]: { border: 'none' },
    },
  },
};

enum RestartOption {
  SameUserID,
  NewUserID,
}

export interface WebChatHeaderProps {
  conversationId: string;
  onRestartConversation: (conversationId: string, requireNewUserId: boolean) => Promise<any>;
  onSaveTranscript: (conversationId: string) => Promise<any>;
  openBotInEmulator: () => void;
}

export const WebChatHeader: React.FC<WebChatHeaderProps> = ({
  conversationId,
  onRestartConversation,
  onSaveTranscript,
  openBotInEmulator,
}) => {
  const [lastSelectedRestartOption, setOption] = useState<RestartOption>(RestartOption.NewUserID);
  const menuProps: IContextualMenuProps = {
    items: [
      {
        key: 'restartConversation',
        text: formatMessage('Restart Conversation - same user ID'),
        iconProps: { iconName: 'Refresh' },
        onClick: () => {
          setOption(RestartOption.SameUserID);
          onRestartConversation(conversationId, false);
        },
      },
      {
        key: 'restartConversationWithNewUserId',
        text: formatMessage('Restart Conversation - new user ID'),
        iconProps: { iconName: 'Refresh' },
        onClick: () => {
          setOption(RestartOption.NewUserID);
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
          lastSelectedRestartOption === RestartOption.SameUserID
            ? formatMessage('Restart Conversation - same user ID')
            : formatMessage('Restart Conversation - new user ID')
        }
        title="restart-conversation"
        onClick={() => {
          if (lastSelectedRestartOption === RestartOption.SameUserID) {
            onRestartConversation(conversationId, true);
          } else {
            onRestartConversation(conversationId, false);
          }
        }}
      />
      <ActionButton
        ariaLabel="save-transcripts"
        iconProps={{ iconName: 'Save' }}
        title="Save chat transcripts"
        onClick={() => onSaveTranscript(conversationId)}
        ariaDescription="Save conversation as transcript"
      />
      <ActionButton
        iconProps={{
          iconName: 'OpenInNewTab',
        }}
        title="Open in Emulator"
        styles={{ root: { height: '20px' } }}
        onClick={openBotInEmulator}
        ariaDescription="Open the bot in Emulator"
      ></ActionButton>
    </div>
  );
};
