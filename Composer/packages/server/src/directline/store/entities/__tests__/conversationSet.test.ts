// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotEndpoint } from '../botEndpoint';
import { User } from '../../types';
import { ConversationSet } from '../conversationSet';

describe('ConversationSet', () => {
  let conversationSet = new ConversationSet();

  const createTestConversation = (prefix: string) => {
    const endpoint = new BotEndpoint(`${prefix}-id`, `${prefix}-botId`, `${prefix}-botUrl`);
    const user: User = { id: 'testUser', name: 'testUser' };
    const conversation = conversationSet.newConversation(endpoint, user);
    return conversation;
  };

  afterEach(() => {
    conversationSet = new ConversationSet();
  });

  it('can create conversation correctly.', () => {
    const conversation = createTestConversation('test');

    expect(conversation).toBeTruthy();
    expect(conversation.conversationId).toBeTruthy();
  });
  it('can get conversations correctly.', () => {
    const conv1 = createTestConversation('test1');
    expect(conversationSet.getConversationIds()).toEqual([conv1.conversationId]);

    const conv2 = createTestConversation('test2');
    expect(conversationSet.getConversationIds()).toEqual([conv1.conversationId, conv2.conversationId]);

    expect(conversationSet.conversationById(conv1.conversationId)).toStrictEqual(conv1);
    expect(conversationSet.conversationById(conv2.conversationId)).toStrictEqual(conv2);
  });

  it('can remove conversation.', () => {
    const conversation = createTestConversation('test');
    expect(conversationSet.getConversationIds()).toEqual([conversation.conversationId]);

    conversationSet.deleteConversation(conversation.conversationId);
    expect(conversationSet.getConversationIds()).toHaveLength(0);
    expect(conversationSet.conversationById(conversation.conversationId)).toBeUndefined();
  });
});
