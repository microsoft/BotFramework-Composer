// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { generateUniqueId } from '../../utils/helpers';
import { User, WebChatMode } from '../types';

import { BotEndpoint } from './botEndpoint';
import { Conversation } from './conversation';

export class ConversationSet {
  public conversations: Record<string, Conversation> = {};

  // TODO: Refactor to move to constructor
  public newConversation(
    botEndpoint: BotEndpoint,
    user: User,
    mode: WebChatMode = 'livechat',
    locale = 'en-us',
    conversationId = generateUniqueId()
  ): Conversation {
    const conversation = new Conversation(botEndpoint, conversationId, user, mode, locale);
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
