"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComposerBot = void 0;
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const botbuilder_dialogs_adaptive_1 = require("botbuilder-dialogs-adaptive");
const botframework_connector_1 = require("botframework-connector");
class ComposerBot extends botbuilder_1.ActivityHandler {
    constructor(conversationState, userState, resourceExplorer, skillClient, conversationIdFactory, telemetryClient, rootDialog, defaultLocale, removeRecipientMention = false) {
        super();
        this.conversationState = conversationState;
        this.userState = userState;
        this.dialogState = conversationState.createProperty('DialogState');
        this.resourceExplorer = resourceExplorer;
        this.rootDialogFile = rootDialog;
        this.defaultLocale = defaultLocale;
        this.telemetryClient = telemetryClient;
        this.removeRecipientMention = removeRecipientMention;
        this.loadRootDialog();
        // this.dialogManager.initialTurnState.set("settings", settings);
        botbuilder_dialogs_adaptive_1.SkillExtensions.useSkillClient(this.dialogManager, skillClient);
        botbuilder_dialogs_adaptive_1.SkillExtensions.useSkillConversationIdFactory(this.dialogManager, conversationIdFactory);
    }
    async onTurnActivity(turnContext) {
        const rootDialog = this.dialogManager.rootDialog;
        const claimIdentity = turnContext.turnState.get(turnContext.adapter.BotIdentityKey);
        if (claimIdentity && botframework_connector_1.SkillValidation.isSkillClaim(claimIdentity.claims)) {
            rootDialog.autoEndDialog = true;
        }
        else {
            rootDialog.autoEndDialog = false;
        }
        if (this.removeRecipientMention && turnContext.activity.type == botbuilder_1.ActivityTypes.Message) {
            botbuilder_1.TurnContext.removeRecipientMention(turnContext.activity);
        }
        await this.dialogManager.onTurn(turnContext);
        await this.conversationState.saveChanges(turnContext, false);
        await this.userState.saveChanges(turnContext, false);
    }
    loadRootDialog() {
        const rootDialog = this.resourceExplorer.loadType(this.rootDialogFile);
        this.dialogManager = new botbuilder_dialogs_1.DialogManager(rootDialog);
        this.dialogManager.conversationState = this.conversationState;
        this.dialogManager.userState = this.userState;
        botbuilder_dialogs_adaptive_1.ResourceExtensions.useResourceExplorer(this.dialogManager, this.resourceExplorer);
        botbuilder_dialogs_adaptive_1.LanguageGeneratorExtensions.useLanguageGeneration(this.dialogManager);
        botbuilder_dialogs_adaptive_1.LanguageGeneratorExtensions.useLanguagePolicy(this.dialogManager, new botbuilder_dialogs_adaptive_1.LanguagePolicy(this.defaultLocale));
    }
}
exports.ComposerBot = ComposerBot;
//# sourceMappingURL=composerBot.js.map