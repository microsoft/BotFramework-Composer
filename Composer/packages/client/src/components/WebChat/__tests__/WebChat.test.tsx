// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@botframework-composer/test-utils';

import { WebChatComposerProps, WebChatComposer } from '../WebChatComposer';
import { ConversationService } from '../utils/conversationService';
import { ChatData } from '../types';

const originalCreateObjectURL = URL.createObjectURL;

describe('<WebChat />', () => {
  beforeAll(() => {
    URL.createObjectURL = jest.fn();
  });

  afterAll(() => {
    URL.createObjectURL = originalCreateObjectURL;
  });

  it('should not render webchat if no conversation or chat data', async () => {
    const props: WebChatComposerProps = {
      currentConversation: '',
      activeLocale: 'en-us',
      conversationService: new ConversationService('http://localhost:4000'),
      botUrl: 'http://localhost:3000/api/messages',
      chatData: {} as ChatData,
      isDisabled: false,
    };

    const { container } = render(<WebChatComposer {...props} />);
    expect(container.innerHTML).toBe('');
  });
});
