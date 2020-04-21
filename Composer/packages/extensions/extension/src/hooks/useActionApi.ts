// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  BaseSchema,
  deepCopyActions,
  deleteAction as destructAction,
  deleteActions as destructActions,
  LgType,
} from '@bfc/shared';

import { useLgApi } from './useLgApi';
import { useLuApi } from './useLuApi';

export const useActionApi = () => {
  const { createLgTemplate, readLgTemplate, deleteLgTemplates } = useLgApi();
  const { createLuIntent, readLuIntent, deleteLuIntents } = useLuApi();

  async function constructActions(dialogId: string, actions: BaseSchema[]) {
    return deepCopyActions(
      actions,
      (actionId, actionData, fieldName, fieldValue) =>
        createLgTemplate(dialogId, actionId, new LgType(actionData.$kind, fieldName).toString(), fieldValue),
      (actionId, actionData, fieldName, fieldValue) => createLuIntent(dialogId, 'TODO-luid', fieldValue)
    );
  }

  async function copyActions(dialogId: string, actions: BaseSchema[]) {
    return deepCopyActions(
      actions,
      (actionId, actionData, fieldName, lgText) => readLgTemplate(dialogId, lgText),
      (actionId, actionData, fieldName, fieldValue) => readLuIntent(dialogId, 'TODO-luid')
    );
  }

  async function constructAction(dialogId: string, action: BaseSchema) {
    return await constructActions(dialogId, [action]);
  }

  async function copyAction(dialogId: string, action: BaseSchema) {
    return await copyActions(dialogId, [action]);
  }

  async function deleteAction(dialogId: string, action: BaseSchema) {
    return destructAction(
      action,
      (templates: string[]) => deleteLgTemplates(dialogId, templates),
      (luIntents: string[]) => deleteLuIntents(dialogId, luIntents)
    );
  }

  async function deleteActions(dialogId: string, actions: BaseSchema[]) {
    return destructActions(
      actions,
      (templates: string[]) => deleteLgTemplates(dialogId, templates),
      (luIntents: string[]) => deleteLuIntents(dialogId, luIntents)
    );
  }

  return {
    constructAction,
    constructActions,
    copyAction,
    copyActions,
    deleteAction,
    deleteActions,
  };
};
