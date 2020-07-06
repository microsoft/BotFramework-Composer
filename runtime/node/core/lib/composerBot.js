"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComposerBot = void 0;
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
class ComposerBot {
    constructor(
    // userState: UserState,
    // conversationState: ConversationState,
    resourceExplorer, rootDialog, settings) {
        this.loadRootDialog = () => __awaiter(this, void 0, void 0, function* () {
            const rootDialog = this.resourceExplorer.loadType(this.rootDialogPath);
            this.dialogManager.rootDialog = rootDialog;
        });
        this.onTurn = (context) => __awaiter(this, void 0, void 0, function* () {
            yield this.dialogManager.onTurn(context);
        });
        this.dialogManager = new botbuilder_dialogs_1.DialogManager();
        this.dialogManager.conversationState = new botbuilder_1.ConversationState(new botbuilder_1.MemoryStorage());
        this.dialogManager.userState = new botbuilder_1.UserState(new botbuilder_1.MemoryStorage());
        this.resourceExplorer = resourceExplorer;
        this.rootDialogPath = rootDialog;
        this.loadRootDialog();
        console.log(settings);
        this.dialogManager.initialTurnState.set("settings", settings);
    }
}
exports.ComposerBot = ComposerBot;
//# sourceMappingURL=composerBot.js.map