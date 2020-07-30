// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ActivityHandler, ActivityTypes, BotFrameworkClient, BotTelemetryClient, ConversationState, SkillConversationIdFactoryBase, StatePropertyAccessor, TurnContext, UserState } from "botbuilder";
import { DialogManager, DialogState } from "botbuilder-dialogs";
import { AdaptiveDialog, LanguageGeneratorExtensions, LanguagePolicy, ResourceExtensions, SkillExtensions } from "botbuilder-dialogs-adaptive";
import { ResourceExplorer } from "botbuilder-dialogs-declarative";
import { SkillValidation } from 'botframework-connector';

export class ComposerBot extends ActivityHandler {
  private readonly conversationState: ConversationState;
  private readonly userState: UserState;
  private readonly resourceExplorer: ResourceExplorer;
  private readonly dialogState: StatePropertyAccessor<DialogState>;
  private readonly rootDialogFile: string;
  private readonly telemetryClient: BotTelemetryClient;
  private readonly defaultLocale: string;
  private readonly removeRecipientMention: boolean;
  private dialogManager: DialogManager;

  public constructor(
    conversationState: ConversationState,
    userState: UserState,
    resourceExplorer: ResourceExplorer,
    skillClient: BotFrameworkClient,
    conversationIdFactory: SkillConversationIdFactoryBase,
    telemetryClient: BotTelemetryClient,
    rootDialog: string,
    defaultLocale: string,
    removeRecipientMention = false
  ) {
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
    SkillExtensions.useSkillClient(this.dialogManager, skillClient);
    SkillExtensions.useSkillConversationIdFactory(this.dialogManager, conversationIdFactory);
  }

  public async onTurnActivity(turnContext: TurnContext): Promise<void> {
    const rootDialog = this.dialogManager.rootDialog as AdaptiveDialog;
    const claimIdentity = turnContext.turnState.get(turnContext.adapter.BotIdentityKey);
    if (claimIdentity && SkillValidation.isSkillClaim(claimIdentity.claims)) {
      rootDialog.autoEndDialog = true;
    } else {
      rootDialog.autoEndDialog = false;
    }

    if (this.removeRecipientMention && turnContext.activity.type == ActivityTypes.Message) {
      TurnContext.removeRecipientMention(turnContext.activity);
    }

    await this.dialogManager.onTurn(turnContext);
    await this.conversationState.saveChanges(turnContext, false);
    await this.userState.saveChanges(turnContext, false);
  }

  private loadRootDialog() {
    const rootDialog = this.resourceExplorer.loadType(this.rootDialogFile) as AdaptiveDialog;
    this.dialogManager = new DialogManager(rootDialog);
    this.dialogManager.conversationState = this.conversationState;
    this.dialogManager.userState = this.userState;
    ResourceExtensions.useResourceExplorer(this.dialogManager, this.resourceExplorer);
    LanguageGeneratorExtensions.useLanguageGeneration(this.dialogManager);
    LanguageGeneratorExtensions.useLanguagePolicy(this.dialogManager, new LanguagePolicy(this.defaultLocale));
  }

}
