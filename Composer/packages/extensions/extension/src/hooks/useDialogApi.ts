// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BaseSchema, DialogUtils } from '@bfc/shared';

import { useActionApi } from './useActionApi';

export interface DialogApiContext {
  copyAction: (actionId: string) => BaseSchema;
  deleteAction: (actionId: BaseSchema) => BaseSchema;
  copyActions: (actionIds: string[]) => BaseSchema[];
  deleteActions: (actionIds: BaseSchema[]) => BaseSchema[];
}

const { queryNodes, insertNodes, deleteNode, deleteNodes } = DialogUtils;

export function useDialogApi() {
  const { copyActions, deleteAction, deleteActions } = useActionApi();

  async function insertActions(
    dialogId: string,
    dialogData,
    targetArrayPath: string,
    targetArrayPosition: number,
    actionsToInsert: BaseSchema[]
  ) {
    // Considering a scenario that copy one time but paste multiple times,
    // it requires seeding all $designer.id again by invoking deepCopy.
    const newNodes = await copyActions(dialogId, actionsToInsert);
    return insertNodes(dialogData, targetArrayPath, targetArrayPosition, newNodes);
  }

  async function insertAction(
    dialogId: string,
    dialogData,
    targetArrayPath: string,
    targetArrayPosition: number,
    actionToInsert: BaseSchema
  ) {
    return insertActions(dialogId, dialogData, targetArrayPath, targetArrayPosition, [actionToInsert]);
  }

  function deleteSelectedAction(dialogId, dialogData, actionId: string) {
    return deleteNode(dialogData, actionId, node => deleteAction(dialogId, node));
  }

  function deleteSelectedActions(dialogId: string, dialogData, actionIds: string[]) {
    return deleteNodes(dialogData, actionIds, nodes => {
      deleteActions(dialogId, nodes);
    });
  }

  async function copySelectedActions(dialogId, dialogData, actionIds: string[]) {
    const actions = queryNodes(dialogData, actionIds);
    return copyActions(dialogId, actions);
  }

  async function cutSelectedActions(dialogId, dialogData, actionIds: string[]) {
    const clipboardActions = await copySelectedActions(dialogId, dialogData, actionIds);
    const newDialog = deleteSelectedActions(dialogId, dialogData, actionIds);
    return { dialog: newDialog, cutData: clipboardActions };
  }

  return {
    insertAction,
    insertActions,
    deleteSelectedAction,
    deleteSelectedActions,
    copySelectedActions,
    cutSelectedActions,
  };
}
