// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  BaseSchema,
  deepCopyActions,
  deleteAction as destructAction,
  deleteActions as destructActions,
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
        createLgTemplate(dialogId, fieldValue, actionId, actionData, fieldName),
      async (actionId, actionData, luVirtualFieldName) => {
        if (!actionData[luVirtualFieldName]) return undefined;
        await createLuIntent(dialogId, actionData[luVirtualFieldName], actionId, actionData);

        // during paste, remove the virtual LU field after intents persisted in file
        delete actionData[luVirtualFieldName];
        return undefined;
      }
    );
  }

  async function copyActions(dialogId: string, actions: BaseSchema[]) {
    return deepCopyActions(
      actions,
      async (actionId, actionData, fieldName, fieldValue) => readLgTemplate(dialogId, fieldValue),
      async (actionId, actionData, luVirtualFieldName) => {
        const luValue = readLuIntent(dialogId, actionId, actionData);
        if (!luValue) return undefined;

        // during copy, carry the LU data in virtual field
        actionData[luVirtualFieldName] = luValue;
        return luValue;
      }
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
