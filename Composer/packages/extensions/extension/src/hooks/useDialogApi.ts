// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BaseSchema, deleteAction, deleteActions, DialogUtils, deepCopyActions } from '@bfc/shared';

import { useExternalResourceApi } from './useExternalResourceApi';

export interface DialogApiContext {
  copyAction: (actionId: string) => BaseSchema;
  deleteAction: (actionId: BaseSchema) => BaseSchema;
  copyActions: (actionIds: string[]) => BaseSchema[];
  deleteActions: (actionIds: BaseSchema[]) => BaseSchema[];
}

const { queryNodes, insertNodes, deleteNode, deleteNodes } = DialogUtils;

export function useDialogApi() {
  const { createLgTemplate, readLgTemplate, deleteLgTemplates, deleteLuIntents } = useExternalResourceApi();

  async function insertActions(
    dialogId: string,
    dialogData,
    targetArrayPath: string,
    targetArrayPosition: number,
    actionsToInsert: BaseSchema[]
  ) {
    // Considering a scenario that copy one time but paste multiple times,
    // it requires seeding all $designer.id again by invoking deepCopy.
    const newNodes = await deepCopyActions(actionsToInsert, (actionId, actionData, fieldName, fieldValue) =>
      createLgTemplate(dialogId, actionId, fieldName, fieldValue)
    );
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
    return deleteNode(dialogData, actionId, node =>
      deleteAction(
        node,
        (templates: string[]) => deleteLgTemplates(dialogId, templates),
        (luIntents: string[]) => deleteLuIntents(dialogId, luIntents)
      )
    );
  }

  function deleteSelectedActions(dialogId: string, dialogData, actionIds: string[]) {
    return deleteNodes(dialogData, actionIds, nodes => {
      deleteActions(
        nodes,
        (templates: string[]) => deleteLgTemplates(dialogId, templates),
        (luIntents: string[]) => deleteLuIntents(dialogId, luIntents)
      );
    });
  }

  async function copySelectedActions(dialogId, dialogData, actionIds: string[]) {
    const actions = queryNodes(dialogData, actionIds);
    return deepCopyActions(actions, (actionId, actionData, fieldName, lgText) => readLgTemplate(dialogId, lgText));
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
