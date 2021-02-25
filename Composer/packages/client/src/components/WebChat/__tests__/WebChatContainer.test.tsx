// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@botframework-composer/test-utils';

import { WebChatContainerProps, WebChatContainer } from '../WebChatContainer';
import { ChatData, ConversationService } from '../utils/conversationService';

URL.createObjectURL = jest.fn();

describe('<WebChatContainer />', () => {
  fit('should not render webchat if no conversation or chat data', async () => {
    const props: WebChatContainerProps = {
      currentConversation: '',
      activeLocale: 'en-us',
      conversationService: new ConversationService('http://localhost:4000'),
      botUrl: 'http://localhost:3000/api/messages',
      chatData: {} as ChatData,
      isDisabled: false,
    };

    const { container } = render(<WebChatContainer {...props} />);
    expect(container.innerHTML).toBe('');
  });
});
