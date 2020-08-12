// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ActivityHandler, ActivityTypes, ConversationState, SkillHttpClient, TurnContext, UserState } from 'botbuilder';
import { DialogManager } from 'botbuilder-dialogs';
import {
  AdaptiveDialog,
  AdaptiveDialogComponentRegistration,
  LanguageGeneratorExtensions,
  LanguagePolicy,
  ResourceExtensions,
  SkillExtensions,
} from 'botbuilder-dialogs-adaptive';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { SimpleCredentialProvider, SkillValidation } from 'botframework-connector';
import { BotSettings } from './settings';
import { SkillConversationIdFactory } from './skillConversationIdFactory';
import { getSettings, getProjectRoot, getRootDialog } from './helpers';

/**
 * A composer bot to handle botframework activity requests.
 */
export class ComposerBot extends ActivityHandler {
  private readonly userState: UserState;
  private readonly conversationState: ConversationState;
  private readonly skillConversationIdFactory: SkillConversationIdFactory;
  private readonly projectRoot: string;
  private readonly settings: BotSettings;
  private readonly resourceExplorer: ResourceExplorer;
  private dialogManager: DialogManager;

  public constructor(
    userState: UserState,
    conversationState: ConversationState,
    skillConversationIdFactory: SkillConversationIdFactory
  ) {
    super();
    this.userState = userState;
    this.conversationState = conversationState;
    this.skillConversationIdFactory = skillConversationIdFactory;
    this.projectRoot = getProjectRoot();
    this.settings = getSettings(this.projectRoot);

    // Create and configure resource explorer.
    this.resourceExplorer = new ResourceExplorer();
    this.resourceExplorer.addFolders(this.projectRoot, ['runtime'], false);
    this.resourceExplorer.addComponent(new AdaptiveDialogComponentRegistration(this.resourceExplorer));

    this.loadRootDialog();
    this.configureLanguageGeneration();
    this.configureSkills();
  }

  public async onTurnActivity(turnContext: TurnContext): Promise<void> {
    const rootDialog = this.dialogManager.rootDialog as AdaptiveDialog;
    const claimIdentity = turnContext.turnState.get(turnContext.adapter.BotIdentityKey);
    if (claimIdentity && SkillValidation.isSkillClaim(claimIdentity.claims)) {
      rootDialog.autoEndDialog = true;
    } else {
      rootDialog.autoEndDialog = false;
    }

    const removeRecipientMention = (this.settings.feature && this.settings.feature.removeRecipientMention) || false;
    if (removeRecipientMention && turnContext.activity.type == ActivityTypes.Message) {
      TurnContext.removeRecipientMention(turnContext.activity);
    }

    await this.dialogManager.onTurn(turnContext);
    await this.conversationState.saveChanges(turnContext, false);
    await this.userState.saveChanges(turnContext, false);
  }

  private loadRootDialog() {
    const rootDialogFile = getRootDialog(this.projectRoot);
    const rootDialog = this.resourceExplorer.loadType(rootDialogFile) as AdaptiveDialog;
    this.dialogManager = new DialogManager(rootDialog);
    ResourceExtensions.useResourceExplorer(this.dialogManager, this.resourceExplorer);
    this.dialogManager.initialTurnState.set('settings', this.settings);
    this.dialogManager.conversationState = this.conversationState;
    this.dialogManager.userState = this.userState;
  }

  private configureLanguageGeneration() {
    const defaultLocale = this.settings.defaultLocale || 'en-us';
    const languagePolicy = new LanguagePolicy(defaultLocale);
    LanguageGeneratorExtensions.useLanguageGeneration(this.dialogManager);
    LanguageGeneratorExtensions.useLanguagePolicy(this.dialogManager, languagePolicy);
  }

  private configureSkills() {
    const credentialProvider = new SimpleCredentialProvider(
      this.settings.MicrosoftAppId,
      this.settings.MicrosoftAppPassword
    );
    const skillClient = new SkillHttpClient(credentialProvider, this.skillConversationIdFactory);
    SkillExtensions.useSkillClient(this.dialogManager, skillClient);
    SkillExtensions.useSkillConversationIdFactory(this.dialogManager, this.skillConversationIdFactory);
  }
}
