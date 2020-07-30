import { BotFrameworkAdapter, ConversationState, UserState } from "botbuilder";
import { BotSettings } from "./shared/settings";
export declare const getProjectRoot: () => string;
export declare const getRootDialog: (folderPath: string) => string;
export declare const getBotAdapter: (settings: BotSettings, userState: UserState, conversationState: ConversationState) => BotFrameworkAdapter;
export declare const getSettings: (projectRoot: string) => BotSettings;
