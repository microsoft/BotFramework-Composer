// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { MicrosoftIDialog, MicrosoftIRecognizer, ShellApi } from '@botframework-composer/types';
import { DialogUtils } from '@bfc/shared';

export interface DialogApiContext {
  copyAction: (actionId: string) => MicrosoftIDialog;
  deleteAction: (actionId: MicrosoftIDialog) => MicrosoftIDialog;
  copyActions: (actionIds: string[]) => MicrosoftIDialog[];
  deleteActions: (actionIds: MicrosoftIDialog[]) => MicrosoftIDialog[];
}

const { disableNodes, enableNodes, appendNodesAfter, queryNodes, insertNodes, deleteNode, deleteNodes } = DialogUtils;

export function useDialogEditApi(shellApi: ShellApi) {
  const { constructActions, copyActions, deleteAction, deleteActions } = shellApi;

  async function insertActions(
    dialogId: string,
    dialogData: MicrosoftIDialog,
    targetArrayPath: string,
    targetArrayPosition: number,
    actionsToInsert: MicrosoftIDialog[]
  ): Promise<MicrosoftIDialog> {
    const newNodes = await constructActions(dialogId, actionsToInsert);
    return insertNodes(dialogData, targetArrayPath, targetArrayPosition, newNodes) as MicrosoftIDialog;
  }

  async function insertAction(
    dialogId: string,
    dialogData: MicrosoftIDialog,
    targetArrayPath: string,
    targetArrayPosition: number,
    actionToInsert: MicrosoftIDialog
  ): Promise<MicrosoftIDialog> {
    return insertActions(dialogId, dialogData, targetArrayPath, targetArrayPosition, [actionToInsert]);
  }

  async function insertActionsAfter(
    dialogId: string,
    dialogData: MicrosoftIDialog,
    targetId: string,
    actionsToInsert: MicrosoftIDialog[]
  ): Promise<MicrosoftIDialog> {
    const newNodes = await constructActions(dialogId, actionsToInsert);
    return appendNodesAfter(dialogData, targetId, newNodes) as MicrosoftIDialog;
  }

  function deleteSelectedAction(
    dialogId: string,
    dialogData: MicrosoftIDialog,
    actionId: string
  ): Promise<MicrosoftIDialog> {
    return deleteNode(dialogData, actionId, (node) => deleteAction(dialogId, node));
  }

  function deleteSelectedActions(
    dialogId: string,
    dialogData: MicrosoftIDialog,
    actionIds: string[]
  ): Promise<MicrosoftIDialog> {
    return deleteNodes(dialogData, actionIds, (nodes) => deleteActions(dialogId, nodes));
  }

  function disableSelectedActions(
    dialogId: string,
    dialogData: MicrosoftIDialog,
    actionIds: string[]
  ): MicrosoftIDialog {
    return disableNodes(dialogData, actionIds);
  }

  function enableSelectedActions(
    dialogId: string,
    dialogData: MicrosoftIDialog,
    actionIds: string[]
  ): MicrosoftIDialog {
    return enableNodes(dialogData, actionIds);
  }
  async function copySelectedActions(
    dialogId: string,
    dialogData: MicrosoftIDialog,
    actionIds: string[]
  ): Promise<MicrosoftIDialog[]> {
    const actions = queryNodes(dialogData, actionIds);
    return copyActions(dialogId, actions);
  }

  async function cutSelectedActions(
    dialogId: string,
    dialogData: MicrosoftIDialog,
    actionIds: string[]
  ): Promise<{ dialog: MicrosoftIDialog; cutActions: MicrosoftIDialog[] }> {
    const cutActions = await copySelectedActions(dialogId, dialogData, actionIds);
    const newDialog = await deleteSelectedActions(dialogId, dialogData, actionIds);
    return { dialog: newDialog, cutActions };
  }

  function updateRecognizer(
    dialogId: string,
    dialogData: MicrosoftIDialog,
    recognizer: MicrosoftIRecognizer | string
  ): MicrosoftIDialog {
    dialogData.recognizer = recognizer;
    return dialogData;
  }

  return {
    insertAction,
    insertActions,
    insertActionsAfter,
    deleteSelectedAction,
    deleteSelectedActions,
    copySelectedActions,
    cutSelectedActions,
    updateRecognizer,
    disableSelectedActions,
    enableSelectedActions,
  };
}
