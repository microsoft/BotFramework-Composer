// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, act } from '@botframework-composer/test-utils';

import { WebChatPanel } from '../WebChatPanel';

const mockstartNewConversation = jest.fn();
const mockSendActivity = jest.fn();
const mockServerPort = jest.fn();

URL.createObjectURL = jest.fn();

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
      projectId: '123-12',
      botUrl: 'http://localhost:3989/api/messages',
      secrets: {
        msAppId: '',
        msPassword: '',
      },
      directlineHostUrl: 'http://localhost:3000/v3/directline',
      botName: 'test-bot',
      isWebChatPanelVisible: false,
      openBotInEmulator: mockOpenInEmulator,
      activeLocale: 'en-us',
    };

    mockServerPort.mockResolvedValue(4000);

    const { rerender, findAllByTestId } = render(
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
      await findAllByTestId('restart-conversation');
    });
  });
});
