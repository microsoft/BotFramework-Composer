import { ResourceExplorer } from "botbuilder-dialogs-declarative";
import { TurnContext } from "botbuilder-core";
export declare class ComposerBot {
    private dialogManager;
    private readonly resourceExplorer;
    private readonly rootDialogPath;
    constructor(resourceExplorer: ResourceExplorer, rootDialog: string, settings: any);
    private loadRootDialog;
    onTurn: (context: TurnContext) => Promise<import("botbuilder-dialogs").DialogManagerResult>;
}
