// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
  ActivityHandler,
  ActivityTypes,
  BotTelemetryClient,
  ComponentRegistration,
  ConversationState,
  SkillHttpClient,
  TurnContext,
  UserState,
} from 'botbuilder';
import { QnAMakerComponentRegistration, LuisComponentRegistration } from 'botbuilder-ai';
import { DialogManager } from 'botbuilder-dialogs';
import {
  AdaptiveComponentRegistration,
  AdaptiveDialog,
  LanguageGeneratorExtensions,
  LanguagePolicy,
  ResourceExtensions,
  SkillExtensions,
  useTelemetry,
} from 'botbuilder-dialogs-adaptive';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { SimpleCredentialProvider, SkillValidation } from 'botframework-connector';
import { BotSettings } from './settings';
import { SkillConversationIdFactory } from './skillConversationIdFactory';
import { getSettings, getProjectRoot, getRootDialog } from './helpers';

// This is for custom action component registration, uncomment this to enable custom action support.
// import { CustomActionComponentRegistration } from '../customaction/customActionComponentRegistration';

/**
 * A composer bot to handle botframework activity requests.
 */
export class ComposerBot extends ActivityHandler {
  private readonly userState: UserState;
  private readonly conversationState: ConversationState;
  private readonly skillConversationIdFactory: SkillConversationIdFactory;
  private readonly telemetryClient: BotTelemetryClient;
  private readonly projectRoot: string;
  private readonly settings: BotSettings;
  private readonly resourceExplorer: ResourceExplorer;
  private dialogManager: DialogManager;

  public constructor(
    userState: UserState,
    conversationState: ConversationState,
    skillConversationIdFactory: SkillConversationIdFactory,
    telemetryClient: BotTelemetryClient
  ) {
    super();
    this.userState = userState;
    this.conversationState = conversationState;
    this.skillConversationIdFactory = skillConversationIdFactory;
    this.telemetryClient = telemetryClient;
    this.projectRoot = getProjectRoot();
    this.settings = getSettings(this.projectRoot);

    ComponentRegistration.add(new AdaptiveComponentRegistration());
    ComponentRegistration.add(new QnAMakerComponentRegistration());
    ComponentRegistration.add(new LuisComponentRegistration());

    // This is for custom action component registration, uncomment this to enable custom action support.
    // ComponentRegistration.add(new CustomActionComponentRegistration());

    // Create and configure resource explorer.
    this.resourceExplorer = new ResourceExplorer();
    this.resourceExplorer.addFolders(this.projectRoot, ['runtime'], false);

    this.loadRootDialog();
    this.configureLanguageGeneration();
    this.configureSkills();
  }

  public async onTurnActivity(turnContext: TurnContext): Promise<void> {
    const rootDialog = this.dialogManager.rootDialog as AdaptiveDialog;
    const claimIdentity = turnContext.turnState.get(turnContext.adapter.BotIdentityKey);
    if (claimIdentity && SkillValidation.isSkillClaim(claimIdentity.claims)) {
      rootDialog.configure({ autoEndDialog: true });
    }

    const removeRecipientMention = this.settings.feature?.RemoveRecipientMention ?? false;
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
    if (this.telemetryClient) {
      useTelemetry(this.dialogManager, this.telemetryClient);
    }
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
