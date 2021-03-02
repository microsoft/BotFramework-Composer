// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, act } from '@botframework-composer/test-utils';

import { WebChatPanel } from '../WebChatPanel';
import { BotStatus } from '../../../constants';

const mockstartNewConversation = jest.fn();
const mockSendActivity = jest.fn();
const mockServerPort = jest.fn();

URL.createObjectURL = jest.fn();

jest.mock('../WebChatContainer', () => ({
  WebChatContainer: () => {
    return <></>;
  },
}));

jest.mock('../utils/conversationService', () => {
  return {
    ConversationService: jest.fn().mockImplementation(() => {
      return {
        startNewConversation: mockstartNewConversation,
        sendInitialActivity: mockSendActivity,
        setUpConversationServer: mockServerPort,
        getDateTimeFormatted: jest.fn(),
      };
    }),
    getDateTimeFormatted: jest.fn(),
  };
});

describe('<WebchatPanel />', () => {
  it('should render webchat panel correctly', async () => {
    const mockOpenInEmulator = jest.fn();

    const props = {
      directlineHostUrl: 'http://localhost:3000/v3/directline',
      isWebChatPanelVisible: false,
      botData: {
        projectId: '123-12',
        botUrl: 'http://localhost:3989/api/messages',
        secrets: {
          msAppId: '',
          msPassword: '',
        },
        botStatus: BotStatus.connected,
        botName: 'test-bot',
        activeLocale: 'en-us',
      },
      openBotInEmulator: mockOpenInEmulator,
    };

    mockServerPort.mockResolvedValue(4000);

    const { rerender, findByText } = render(
      <WebChatPanel clearWebchatInspectorLogs={jest.fn()} {...props} appendLogToWebChatInspector={jest.fn()} />
    );

    mockstartNewConversation.mockResolvedValue({
      directline: {
        activity$: jest.fn(),
        subscribe: jest.fn(),
      },
      chatMode: 'conversation',
      projectId: '123-12',
      user: {
        id: 'dsf',
      },
      conversationId: '123sdf=234',
    });

    await act(async () => {
      rerender(
        <WebChatPanel
          {...props}
          isWebChatPanelVisible
          appendLogToWebChatInspector={jest.fn()}
          clearWebchatInspectorLogs={jest.fn()}
        />
      );
      await findByText('Restart Conversation - new user ID');
    });
  });
});
