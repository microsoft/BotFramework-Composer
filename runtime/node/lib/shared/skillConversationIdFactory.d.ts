import { SkillConversationIdFactoryBase, SkillConversationIdFactoryOptions } from "botbuilder";
/**
 * A SkillConversationIdFactory that uses an in memory dictionary
 * to store and retrieve ConversationReference instances.
 */
export declare class SkillConversationIdFactory extends SkillConversationIdFactoryBase {
    private _refs;
    /**
     * Creates a conversation ID for a skill conversation based on the caller's conversation reference.
     * @param options Skill conversation id options.
     */
    createSkillConversationIdWithOptions(options: SkillConversationIdFactoryOptions): Promise<string>;
    /**
     * Gets the SkillConversationReference created with createSkillConversationId() or createSkillConversationIdWithOptions().
     * @param skillConversationId Conversation ID.
     */
    getSkillConversationReference(skillConversationId: string): Promise<any>;
    /**
     * Deletes a ConversationReference.
     * @param skillConversationId Conversation ID.
     */
    deleteConversationReference(skillConversationId: string): Promise<void>;
}
