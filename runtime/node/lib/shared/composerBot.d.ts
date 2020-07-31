import { ActivityHandler, ConversationState, TurnContext, UserState } from "botbuilder";
export declare class ComposerBot extends ActivityHandler {
    private readonly userState;
    private readonly conversationState;
    private readonly projectRoot;
    private readonly settings;
    private readonly resourceExplorer;
    private dialogManager;
    constructor(userState: UserState, conversationState: ConversationState);
    onTurnActivity(turnContext: TurnContext): Promise<void>;
    private loadRootDialog;
    private configureLanguageGeneration;
    private configureSkills;
}
