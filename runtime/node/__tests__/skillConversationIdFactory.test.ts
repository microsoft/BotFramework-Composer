import { SkillConversationIdFactory } from "../src/shared/skillConversationIdFactory";
import { SkillConversationIdFactoryOptions, BotFrameworkSkill, MessageFactory, ConversationReference, ConversationAccount, TurnContext, ChannelAccount, Activity } from 'botbuilder';

const refEquals = (ref1: ConversationReference, ref2: ConversationReference): boolean => {
    return ref1.conversation.id == ref2.conversation.id && ref1.serviceUrl == ref2.serviceUrl;
}

let skillConversationIdFactory: SkillConversationIdFactory;
let skillConversationIdFactoryOptions: SkillConversationIdFactoryOptions;
let conversationReference: ConversationReference;

beforeAll(() => {
    skillConversationIdFactory = new SkillConversationIdFactory();
    const botId = 'BotId';
    const skillId = 'SkillId';
    const bot: ChannelAccount = {
        id: botId,
        name: botId
    };
    const conversation: ConversationAccount = {
        conversationType: 'test',
        id: '123',
        isGroup: false,
        name: 'test',
        tenantId: 'test'
    };
    conversationReference = {
        bot,
        conversation,
        serviceUrl: 'http://testbot.com/api/messages',
        channelId: 'test'
    };
    const activity = MessageFactory.text('') as Activity;
    TurnContext.applyConversationReference(activity, conversationReference);
    const skill: BotFrameworkSkill = {
        id: 'skill',
        appId: skillId,
        skillEndpoint: 'http://testbot.com/api/messages'
    };
    skillConversationIdFactoryOptions = {
        fromBotOAuthScope: botId,
        fromBotId: botId,
        activity: activity,
        botFrameworkSkill: skill
    };
});

describe('test skill conversation id factory', () => {
    it('should create correct conversation id', async () => {
        const conversationId = await skillConversationIdFactory.createSkillConversationIdWithOptions(skillConversationIdFactoryOptions);
        expect(conversationId).toBeDefined();
    });

    it('should get conversation reference from conversation id', async () => {
        const conversationId = await skillConversationIdFactory.createSkillConversationIdWithOptions(skillConversationIdFactoryOptions);
        expect(conversationId).toBeDefined();

        const skillConversationRef = await skillConversationIdFactory.getSkillConversationReference(conversationId);
        expect(skillConversationRef).toBeTruthy();
        expect(refEquals(skillConversationRef.conversationReference, conversationReference)).toBeTruthy();
    });

    it('should not get conversation reference after deleted', async () => {
        const conversationId = await skillConversationIdFactory.createSkillConversationIdWithOptions(skillConversationIdFactoryOptions);
        expect(conversationId).toBeDefined();

        const skillConversationRef = await skillConversationIdFactory.getSkillConversationReference(conversationId);
        expect(skillConversationRef).toBeTruthy();
        expect(refEquals(skillConversationRef.conversationReference, conversationReference)).toBeTruthy();

        await skillConversationIdFactory.deleteConversationReference(conversationId);

        const skillConversationRefAfterDeleted = await skillConversationIdFactory.getSkillConversationReference(conversationId);
        console.log(skillConversationRefAfterDeleted);
        expect(skillConversationRefAfterDeleted).toBeUndefined();
    });
});