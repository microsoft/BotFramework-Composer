// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ConversationState, UserState, MemoryStorage } from "botbuilder";
import { DialogManager } from "botbuilder-dialogs";
import { ResourceExplorer } from "botbuilder-dialogs-declarative";
import { AdaptiveDialog } from "botbuilder-dialogs-adaptive";
import { TurnContext } from "botbuilder-core";

export class ComposerBot {
  private dialogManager: DialogManager;
  private readonly resourceExplorer: ResourceExplorer;
  private readonly rootDialogPath: string;

  constructor(
    resourceExplorer: ResourceExplorer,
    rootDialog: string,
    settings: any
  ) {
    this.dialogManager = new DialogManager();
    this.dialogManager.conversationState = new ConversationState(
      new MemoryStorage()
    );
    this.dialogManager.userState = new UserState(new MemoryStorage());
    this.resourceExplorer = resourceExplorer;
    this.rootDialogPath = rootDialog;
    this.loadRootDialog();
    this.dialogManager.initialTurnState.set("settings", settings);
  }

  private loadRootDialog = () => {
    this.dialogManager.rootDialog = this.resourceExplorer.loadType(
      this.rootDialogPath
    ) as AdaptiveDialog;
  };

  public onTurn = async (context: TurnContext) => {
    return await this.dialogManager.onTurn(context);
  };
}
