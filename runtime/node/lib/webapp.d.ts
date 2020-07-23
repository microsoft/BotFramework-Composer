import { BotFrameworkAdapter } from "botbuilder";
import { ComposerBot } from "./shared/composerBot";
import { BotSettings } from "./shared/settings";
export declare const getProjectRoot: () => string;
export declare const getRootDialog: (projRoot: string) => string;
export declare const Configure: (projRoot: string) => {
    adapter: BotFrameworkAdapter;
    bot: ComposerBot;
};
export declare const getSettings: (projectRoot: string) => BotSettings;
