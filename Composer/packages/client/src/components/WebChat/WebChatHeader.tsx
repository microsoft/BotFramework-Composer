// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { ActionButton, DefaultButton, IButtonStyles, IconButton } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuProps } from 'office-ui-fabric-react/lib/ContextualMenu';
import formatMessage from 'format-message';
import { CommunicationColors, NeutralColors } from '@uifabric/fluent-theme';

import { RestartOption } from './types';

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
  botName: string;
  currentRestartOption: RestartOption;
  onSetRestartOption: (restartOption: RestartOption) => void;
  conversationId: string;
  onRestartConversation: (conversationId: string, requireNewUserId: boolean) => void;
  onSaveTranscript: (conversationId: string) => void;
  onOpenBotInEmulator: () => void;
  onCloseWebChat: () => void;
  isRestartButtonDisabled: boolean;
};

export const WebChatHeader: React.FC<WebChatHeaderProps> = ({
  botName,
  conversationId,
  currentRestartOption,
  onRestartConversation,
  onSaveTranscript,
  onOpenBotInEmulator: openBotInEmulator,
  onSetRestartOption,
  onCloseWebChat,
  isRestartButtonDisabled,
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
    <div data-testid="Webchat-Header" style={{ borderBottom: `1px solid ${NeutralColors.gray60}` }}>
      <h4
        css={{
          margin: 0,
          padding: 0,
          height: '44px',
          paddingLeft: '18px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {botName}
        <IconButton
          ariaLabel={formatMessage('Close WebChat')}
          css={{
            position: 'absolute',
            right: '10px',
          }}
          iconProps={{
            iconName: 'ChromeClose',
            styles: {
              root: {
                fontSize: '14px',
              },
            },
          }}
          title={formatMessage('Close')}
          onClick={onCloseWebChat}
        />
      </h4>
      <DefaultButton
        split
        aria-roledescription="split button"
        ariaLabel="restart-conversation"
        disabled={isRestartButtonDisabled}
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
