"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComposerBot = void 0;
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const botbuilder_dialogs_adaptive_1 = require("botbuilder-dialogs-adaptive");
const botbuilder_dialogs_declarative_1 = require("botbuilder-dialogs-declarative");
const botframework_connector_1 = require("botframework-connector");
const skillConversationIdFactory_1 = require("./skillConversationIdFactory");
const helpers_1 = require("./helpers");
class ComposerBot extends botbuilder_1.ActivityHandler {
    constructor(userState, conversationState) {
        super();
        this.userState = userState;
        this.conversationState = conversationState;
        this.projectRoot = helpers_1.getProjectRoot();
        this.settings = helpers_1.getSettings(this.projectRoot);
        // Create and configure resource explorer.
        this.resourceExplorer = new botbuilder_dialogs_declarative_1.ResourceExplorer();
        this.resourceExplorer.addFolders(this.projectRoot, ["runtime"], false);
        this.resourceExplorer.addComponent(new botbuilder_dialogs_adaptive_1.AdaptiveDialogComponentRegistration(this.resourceExplorer));
        this.loadRootDialog();
        this.configureLanguageGeneration();
        this.configureSkills();
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
        const removeRecipientMention = this.settings.feature && this.settings.feature.removeRecipientMention || false;
        if (removeRecipientMention && turnContext.activity.type == botbuilder_1.ActivityTypes.Message) {
            botbuilder_1.TurnContext.removeRecipientMention(turnContext.activity);
        }
        await this.dialogManager.onTurn(turnContext);
        await this.conversationState.saveChanges(turnContext, false);
        await this.userState.saveChanges(turnContext, false);
    }
    loadRootDialog() {
        const rootDialogFile = helpers_1.getRootDialog(this.projectRoot);
        const rootDialog = this.resourceExplorer.loadType(rootDialogFile);
        this.dialogManager = new botbuilder_dialogs_1.DialogManager(rootDialog);
        botbuilder_dialogs_adaptive_1.ResourceExtensions.useResourceExplorer(this.dialogManager, this.resourceExplorer);
        this.dialogManager.initialTurnState.set("settings", this.settings);
        this.dialogManager.conversationState = this.conversationState;
        this.dialogManager.userState = this.userState;
    }
    configureLanguageGeneration() {
        const defaultLocale = this.settings.defaultLocale || 'en-us';
        const languagePolicy = new botbuilder_dialogs_adaptive_1.LanguagePolicy(defaultLocale);
        botbuilder_dialogs_adaptive_1.LanguageGeneratorExtensions.useLanguageGeneration(this.dialogManager);
        botbuilder_dialogs_adaptive_1.LanguageGeneratorExtensions.useLanguagePolicy(this.dialogManager, languagePolicy);
    }
    configureSkills() {
        const conversationIdFactory = new skillConversationIdFactory_1.SkillConversationIdFactory();
        const credentialProvider = new botframework_connector_1.SimpleCredentialProvider(this.settings.microsoftAppId, this.settings.microsoftAppPassword);
        const skillClient = new botbuilder_1.SkillHttpClient(credentialProvider, conversationIdFactory);
        botbuilder_dialogs_adaptive_1.SkillExtensions.useSkillClient(this.dialogManager, skillClient);
        botbuilder_dialogs_adaptive_1.SkillExtensions.useSkillConversationIdFactory(this.dialogManager, conversationIdFactory);
    }
}
exports.ComposerBot = ComposerBot;
//# sourceMappingURL=composerBot.js.map