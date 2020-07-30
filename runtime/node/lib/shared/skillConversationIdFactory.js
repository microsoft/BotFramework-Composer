"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillConversationIdFactory = void 0;
const botbuilder_1 = require("botbuilder");
/**
 * A SkillConversationIdFactory that uses an in memory dictionary
 * to store and retrieve ConversationReference instances.
 */
class SkillConversationIdFactory extends botbuilder_1.SkillConversationIdFactoryBase {
    constructor() {
        super(...arguments);
        this._refs = {};
    }
    /**
     * Creates a conversation ID for a skill conversation based on the caller's conversation reference.
     * @param options Skill conversation id options.
     */
    async createSkillConversationIdWithOptions(options) {
        if (!options) {
            throw new Error('Options cannot be null.');
        }
        // Create the storage key based on the SkillConversationIdFactoryOptions.
        const conversationReference = botbuilder_1.TurnContext.getConversationReference(options.activity);
        const skillConversationId = `${options.fromBotId}-${options.botFrameworkSkill.appId}-${conversationReference.conversation.id}-${conversationReference.channelId}-skillconvo`;
        // Create the SkillConversationReference instance.
        const skillConversationReference = {
            conversationReference,
            oAuthScope: options.fromBotOAuthScope
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
    async getSkillConversationReference(skillConversationId) {
        if (!skillConversationId) {
            throw new Error('SkillConversationId cannot be null.');
        }
        return this._refs[skillConversationId];
    }
    /**
     * Deletes a ConversationReference.
     * @param skillConversationId Conversation ID.
     */
    async deleteConversationReference(skillConversationId) {
        if (!skillConversationId) {
            throw new Error('SkillConversationId cannot be null.');
        }
        this._refs[skillConversationId] = undefined;
    }
}
exports.SkillConversationIdFactory = SkillConversationIdFactory;
//# sourceMappingURL=skillConversationIdFactory.js.map