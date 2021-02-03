// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { HighContrastSelector } from 'office-ui-fabric-react/lib';
import { IconButton, DefaultButton, IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuProps } from 'office-ui-fabric-react/lib/ContextualMenu';
import formatMessage from 'format-message';

const customButtonStyles: IButtonStyles = {
  root: {
    border: 'none',
  },
  label: {
    fontWeight: '400',
    color: '#323130',
  },
  icon: {
    color: '#0078d4',
  },
  splitButtonMenuButton: { backgroundColor: 'white', width: 28, border: 'none' },
  splitButtonMenuIcon: { fontSize: '7px' },
  splitButtonDivider: { backgroundColor: '#c8c8c8', width: 1, right: 26, position: 'absolute', top: 4, bottom: 4 },
  splitButtonContainer: {
    selectors: {
      [HighContrastSelector]: { border: 'none' },
    },
  },
};

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
  const menuProps: IContextualMenuProps = {
    items: [
      {
        key: 'restartConversation',
        text: formatMessage('Restart conversation with current conversation ID'),
        iconProps: { iconName: 'Refresh' },
        onClick: () => {
          onRestartConversation(conversationId);
        },
      },
      {
        key: 'restartConversationWithNewConvId',
        text: formatMessage('Restart conversation with new conversation ID'),
        iconProps: { iconName: 'Refresh' },
        onClick: () => {
          onStartNewConversation(conversationId);
        },
      },
    ],
  };
  // Consider using the <CommandBar /> component in FluentUI.
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
        text={formatMessage('Restart conversation')}
        title="restart-conversation"
        onClick={() => onRestartConversation(conversationId)}
      />
      <IconButton
        ariaLabel="save-transcripts"
        iconProps={{ iconName: 'Save' }}
        title="Save chat transcripts"
        onClick={() => onSaveTranscript(conversationId)}
      />
    </div>
  );
};
