import { ConversationState, UserState } from "botbuilder";
import { BotSettings } from "./settings";
export declare class ComposerBot {
    private dialogManager;
    private readonly resourceExplorer;
    private readonly rootDialogPath;
    constructor(userState: UserState, conversationState: ConversationState, rootDialog: string, settings: BotSettings);
    private loadRootDialog;
    onTurn: (context: any) => Promise<void>;
}
