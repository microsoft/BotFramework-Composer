// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, act } from '@botframework-composer/test-utils';

import { WebChatPanel } from '../WebChatPanel';

const mockstartNewConversation = jest.fn();
const mockSendActivity = jest.fn();

URL.createObjectURL = jest.fn();

jest.mock('../utils/conversationService', () => {
  return jest.fn().mockImplementation(() => {
    return { startNewConversation: mockstartNewConversation, sendInitialActivity: mockSendActivity };
  });
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
      appLifecycleHandler: {
        on: () => {},
      },
    };
    const { rerender, findAllByTestId } = render(<WebChatPanel {...props} />);
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
      rerender(<WebChatPanel {...props} isWebChatPanelVisible />);
      await findAllByTestId('restart-conversation');
    });
  });
});
