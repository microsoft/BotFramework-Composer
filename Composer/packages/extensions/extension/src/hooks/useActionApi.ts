// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  BaseSchema,
  deepCopyAction,
  deepCopyActions,
  deleteAction as destructAction,
  deleteActions as destructActions,
} from '@bfc/shared';

import { useLgApi } from './useLgApi';
import { useLuApi } from './useLuApi';

export const useActionApi = () => {
  const { createLgTemplate, readLgTemplate, deleteLgTemplates } = useLgApi();
  const { deleteLuIntents } = useLuApi();

  async function constructAction(dialogId: string, action: BaseSchema[]) {
    return deepCopyAction(action, (actionId, actionData, fieldName, fieldValue) =>
      createLgTemplate(dialogId, actionId, fieldName, fieldValue)
    );
  }

  async function constructActions(dialogId: string, actions: BaseSchema[]) {
    return deepCopyActions(actions, (actionId, actionData, fieldName, fieldValue) =>
      createLgTemplate(dialogId, actionId, fieldName, fieldValue)
    );
  }

  async function copyAction(dialogId: string, action: BaseSchema) {
    return deepCopyAction(action, (actionId, actionData, fieldName, lgText) => readLgTemplate(dialogId, lgText));
  }
  async function copyActions(dialogId: string, actions: BaseSchema[]) {
    return deepCopyActions(actions, (actionId, actionData, fieldName, lgText) => readLgTemplate(dialogId, lgText));
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
