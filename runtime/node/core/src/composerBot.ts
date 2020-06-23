// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ConversationState, UserState } from "botbuilder";
import { DialogManager } from "botbuilder-dialogs";
import { ResourceExplorer } from "botbuilder-dialogs-declarative";
import { AdaptiveDialog } from "botbuilder-dialogs-adaptive";

export class ComposerBot {
  private dialogManager: DialogManager;
  // private readonly userState: UserState;
  // private readonly conversationState: ConversationState;
  private readonly resourceExplorer: ResourceExplorer;
  private readonly rootDialogPath: string;

  constructor(
    userState: UserState,
    conversationState: ConversationState,
    rootDialog: string,
    settings: any
  ) {
    this.dialogManager = new DialogManager();
    // this.conversationState = conversationState;
    // this.userState = userState;
    this.dialogManager.conversationState = conversationState;
    this.dialogManager.userState = userState;
    this.rootDialogPath = rootDialog;
    this.loadRootDialog();
    this.dialogManager.initialTurnState.set("settings", settings);
  }

  private loadRootDialog = async () => {
    const rootDialog = this.resourceExplorer.loadType(
      this.rootDialogPath
    ) as AdaptiveDialog;
    this.dialogManager.rootDialog = rootDialog;
  };

  public onTurn = async (context: any) => {
    this.dialogManager.onTurn(context);
  };
}
