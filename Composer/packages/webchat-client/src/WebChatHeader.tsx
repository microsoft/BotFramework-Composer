// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo, useState } from 'react';
import { HighContrastSelector } from 'office-ui-fabric-react/lib';
import { IconButton, DefaultButton, IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuProps } from 'office-ui-fabric-react/lib/ContextualMenu';
import formatMessage from 'format-message';
import { CommunicationColors, NeutralColors } from '@uifabric/fluent-theme';

const customButtonStyles: IButtonStyles = {
  root: {
    border: 'none',
  },
  label: {
    fontWeight: '400',
    color: '#323130',
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
  onRestartConversation: (conversationId: string) => Promise<any>;
  onStartNewConversation: (conversationId: string) => Promise<any>;
  onSaveTranscript: (conversationId: string) => Promise<any>;
}

export const WebChatHeader: React.FC<WebChatHeaderProps> = ({
  conversationId,
  onRestartConversation,
  onSaveTranscript,
  onStartNewConversation,
}) => {
  const [lastSelectedRestartOption, setOption] = useState<RestartOption>(RestartOption.SameUserID);
  const menuProps: IContextualMenuProps = {
    items: [
      {
        key: 'restartConversation',
        text: formatMessage('Restart Conversation - same user ID'),
        iconProps: { iconName: 'Refresh' },
        onClick: () => {
          setOption(RestartOption.SameUserID);
          onRestartConversation(conversationId);
        },
      },
      {
        key: 'restartConversationWithNewUserId',
        text: formatMessage('Restart Conversation - new user ID'),
        iconProps: { iconName: 'Refresh' },
        onClick: () => {
          setOption(RestartOption.NewUserID);
          onStartNewConversation(conversationId);
        },
      },
    ],
  };

  const webChatHeader = useMemo(() => {
    return (
      <div data-testid="Webchat-Header" style={{ height: 36 }}>
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
              onRestartConversation(conversationId);
            } else {
              onStartNewConversation(conversationId);
            }
          }}
        />
        <IconButton
          ariaLabel="save-transcripts"
          iconProps={{ iconName: 'Save' }}
          title="Save chat transcripts"
          onClick={() => onSaveTranscript(conversationId)}
        />
      </div>
    );
  }, [lastSelectedRestartOption]);
  return webChatHeader;
};
