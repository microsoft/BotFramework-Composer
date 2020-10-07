// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { SkillConversationIdFactoryBase, SkillConversationIdFactoryOptions, TurnContext } from 'botbuilder';

/**
 * A SkillConversationIdFactory that uses an in memory dictionary
 * to store and retrieve ConversationReference instances.
 */
export class SkillConversationIdFactory extends SkillConversationIdFactoryBase {
  private _refs: { [key: string]: any } = {};

  /**
   * Creates a conversation ID for a skill conversation based on the caller's conversation reference.
   * @param options Skill conversation id options.
   */
  public async createSkillConversationIdWithOptions(options: SkillConversationIdFactoryOptions) {
    if (!options) {
      throw new Error('Options cannot be null.');
    }

    // Create the storage key based on the SkillConversationIdFactoryOptions.
    const conversationReference = TurnContext.getConversationReference(options.activity);
    const skillConversationId = `${options.fromBotId}-${options.botFrameworkSkill.appId}-${conversationReference.conversation.id}-${conversationReference.channelId}-skillconvo`;

    // Create the SkillConversationReference instance.
    const skillConversationReference = {
      conversationReference,
      oAuthScope: options.fromBotOAuthScope,
    };

    // Store the SkillConversationReference with skillConversationId as key.
    this._refs[skillConversationId] = skillConversationReference;

    // Return the generated skillConversationId (that will be also used as the conversation ID to call the skill).
    return skillConversationId;
  }

  /**
   * Gets the SkillConversationReference created with createSkillConversationId() or createSkillConversationIdWithOptions().
   * @param skillConversationId Conversation ID.
   */
  public async getSkillConversationReference(skillConversationId: string) {
    if (!skillConversationId) {
      throw new Error('SkillConversationId cannot be null.');
    }

    return this._refs[skillConversationId];
  }

  /**
   * Deletes a ConversationReference.
   * @param skillConversationId Conversation ID.
   */
  public async deleteConversationReference(skillConversationId: string) {
    if (!skillConversationId) {
      throw new Error('SkillConversationId cannot be null.');
    }

    this._refs[skillConversationId] = undefined;
  }
}
