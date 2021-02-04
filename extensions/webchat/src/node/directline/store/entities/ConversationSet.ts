// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { generateUniqueId } from '../../utils/helpers';
import { User, WebChatMode } from '../types';

import { BotEndpoint } from './BotEndpoint';
import { Conversation } from './Conversation';

export class ConversationSet {
  public conversations: Record<string, Conversation> = {};

  // TODO: May be we want to move "bot" back to the constructor
  public newConversation(
    botEndpoint: BotEndpoint,
    user: User,
    mode: WebChatMode = 'livechat',
    conversationId = generateUniqueId()
  ): Conversation {
    const conversation = new Conversation(botEndpoint, conversationId, user, mode);
    if (!/(\|livechat|\|transcript)/.test(conversation.conversationId)) {
      conversation.conversationId += `|${mode}`;
    }
    this.conversations[conversation.conversationId] = conversation;

    return conversation;
  }

  public conversationById(conversationId: string): Conversation {
    return this.conversations[conversationId];
  }

  public getConversationIds(): string[] {
    return Object.keys(this.conversations);
  }

  public deleteConversation(conversationId: string): boolean {
    return delete this.conversations[conversationId];
  }

  public getConversations(): Conversation[] {
    return Object.values(this.conversations);
  }
}
