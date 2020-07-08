"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComposerBot = void 0;
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
class ComposerBot {
    constructor(resourceExplorer, rootDialog, settings) {
        this.loadRootDialog = () => {
            this.dialogManager.rootDialog = this.resourceExplorer.loadType(this.rootDialogPath);
        };
        this.onTurn = async (context) => {
            await this.dialogManager.onTurn(context);
        };
        this.dialogManager = new botbuilder_dialogs_1.DialogManager();
        this.dialogManager.conversationState = new botbuilder_1.ConversationState(new botbuilder_1.MemoryStorage());
        this.dialogManager.userState = new botbuilder_1.UserState(new botbuilder_1.MemoryStorage());
        this.resourceExplorer = resourceExplorer;
        this.rootDialogPath = rootDialog;
        this.loadRootDialog();
        this.dialogManager.initialTurnState.set("settings", settings);
    }
}
exports.ComposerBot = ComposerBot;
//# sourceMappingURL=composerBot.js.map