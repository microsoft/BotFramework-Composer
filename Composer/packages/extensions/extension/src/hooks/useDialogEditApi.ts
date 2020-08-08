// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BaseSchema, DialogUtils, ShellApi } from '@bfc/shared';
import { disableNodes, enableNodes } from '@bfc/shared/lib/dialogUtils';

import { useActionApi } from './useActionApi';

export interface DialogApiContext {
  copyAction: (actionId: string) => BaseSchema;
  deleteAction: (actionId: BaseSchema) => BaseSchema;
  copyActions: (actionIds: string[]) => BaseSchema[];
  deleteActions: (actionIds: BaseSchema[]) => BaseSchema[];
}

const { appendNodesAfter, queryNodes, insertNodes, deleteNode, deleteNodes } = DialogUtils;

export function useDialogEditApi(shellApi: ShellApi) {
  const { constructActions, copyActions, deleteAction, deleteActions } = useActionApi(shellApi);

  function insertActions(
    dialogId: string,
    dialogData,
    targetArrayPath: string,
    targetArrayPosition: number,
    actionsToInsert: BaseSchema[]
  ) {
    const newNodes = constructActions(dialogId, actionsToInsert);
    return insertNodes(dialogData, targetArrayPath, targetArrayPosition, newNodes);
  }

  function insertAction(
    dialogId: string,
    dialogData,
    targetArrayPath: string,
    targetArrayPosition: number,
    actionToInsert: BaseSchema
  ) {
    return insertActions(dialogId, dialogData, targetArrayPath, targetArrayPosition, [actionToInsert]);
  }

  function insertActionsAfter(dialogId: string, dialogData, targetId: string, actionsToInsert: BaseSchema[]) {
    const newNodes = constructActions(dialogId, actionsToInsert);
    return appendNodesAfter(dialogData, targetId, newNodes);
  }

  function deleteSelectedAction(dialogId, dialogData, actionId: string) {
    return deleteNode(dialogData, actionId, (node) => deleteAction(dialogId, node));
  }

  function deleteSelectedActions(dialogId: string, dialogData, actionIds: string[]) {
    return deleteNodes(dialogData, actionIds, (nodes) => {
      deleteActions(dialogId, nodes);
    });
  }

  function disableSelectedActions(dialogId: string, dialogData, actionIds: string[]) {
    return disableNodes(dialogData, actionIds);
  }

  function enableSelectedActions(dialogId: string, dialogData, actionIds: string[]) {
    return enableNodes(dialogData, actionIds);
  }
  function copySelectedActions(dialogId, dialogData, actionIds: string[]) {
    const actions = queryNodes(dialogData, actionIds);
    return copyActions(dialogId, actions);
  }

  function cutSelectedActions(dialogId, dialogData, actionIds: string[]) {
    const cutActions = copySelectedActions(dialogId, dialogData, actionIds);
    const newDialog = deleteSelectedActions(dialogId, dialogData, actionIds);
    return { dialog: newDialog, cutActions };
  }

  function updateRecognizer(dialogId, dialogData, recognizer) {
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
