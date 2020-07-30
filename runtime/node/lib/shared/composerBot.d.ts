import { ActivityHandler, BotFrameworkClient, BotTelemetryClient, ConversationState, SkillConversationIdFactoryBase, TurnContext, UserState } from "botbuilder";
import { ResourceExplorer } from "botbuilder-dialogs-declarative";
export declare class ComposerBot extends ActivityHandler {
    private readonly conversationState;
    private readonly userState;
    private readonly resourceExplorer;
    private readonly dialogState;
    private readonly rootDialogFile;
    private readonly telemetryClient;
    private readonly defaultLocale;
    private readonly removeRecipientMention;
    private dialogManager;
    constructor(conversationState: ConversationState, userState: UserState, resourceExplorer: ResourceExplorer, skillClient: BotFrameworkClient, conversationIdFactory: SkillConversationIdFactoryBase, telemetryClient: BotTelemetryClient, rootDialog: string, defaultLocale: string, removeRecipientMention?: boolean);
    onTurnActivity(turnContext: TurnContext): Promise<void>;
    private loadRootDialog;
}
