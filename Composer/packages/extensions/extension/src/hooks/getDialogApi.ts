// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BaseSchema, deleteAction, deleteActions, DialogUtils, ShellApi } from '@bfc/shared';

import { getExternalResourceApi } from './getExternalResourceApi';

export interface DialogApiContext {
  copyAction: (actionId: string) => BaseSchema;
  deleteAction: (actionId: BaseSchema) => BaseSchema;
  copyActions: (actionIds: string[]) => BaseSchema[];
  deleteActions: (actionIds: BaseSchema[]) => BaseSchema[];
}

const { copyNodes, cutNodes, pasteNodes, deleteNode, deleteNodes } = DialogUtils;
export function getDialogApi(shellApi: ShellApi) {
  const { createLgTemplate, readLgTemplate, deleteLgTemplates, deleteLuIntents } = getExternalResourceApi(shellApi);

  async function copySelectedActions(dialogId, dialogData, actionIds: string[]) {
    return copyNodes(dialogData, actionIds, (actionId, actionData, fieldName, lgText) =>
      readLgTemplate(dialogId, lgText)
    );
  }

  async function cutSelectedActions(dialogId, dialogData, actionIds: string[]) {
    return cutNodes(dialogData, actionIds, readLgTemplate, nodes => {
      deleteActions(
        nodes,
        (templates: string[]) => deleteLgTemplates(dialogId, templates),
        (luIntents: string[]) => deleteLuIntents(dialogId, luIntents)
      );
    });
  }

  async function insertActions(
    dialogId: string,
    dialogData,
    targetArrayPath: string,
    targetArrayPosition: number,
    actionsToInsert: BaseSchema[]
  ) {
    return pasteNodes(
      dialogData,
      targetArrayPath,
      targetArrayPosition,
      actionsToInsert,
      (actionId, actionData, fieldName, fieldValue) => createLgTemplate(dialogId, actionId, fieldName, fieldValue)
    );
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

  return {
    copySelectedActions,
    cutSelectedActions,
    insertAction,
    insertActions,
    deleteSelectedAction,
    deleteSelectedActions,
  };
}
