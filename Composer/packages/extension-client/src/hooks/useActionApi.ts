// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  deepCopyActions,
  deleteAction as destructAction,
  deleteActions as destructActions,
  FieldProcessorAsync,
  walkAdaptiveActionList,
} from '@bfc/shared';
import { BaseSchema, ShellApi } from '@bfc/types';

import { useLgApi } from './useLgApi';
import { useLuApi } from './useLuApi';

export const useActionApi = (shellApi: ShellApi) => {
  const { createLgTemplate, readLgTemplate, deleteLgTemplates } = useLgApi(shellApi);
  const { createLuIntent, readLuIntent, deleteLuIntents } = useLuApi(shellApi);

  const luFieldName = '_lu';

  function actionsContainLuIntent(actions: BaseSchema[]): boolean {
    let containLuIntents = false;
    walkAdaptiveActionList(actions, (action) => {
      if (action[luFieldName]) {
        containLuIntents = true;
      }
    });
    return containLuIntents;
  }

  async function constructActions(dialogId: string, actions: BaseSchema[]) {
    // '- hi' -> 'SendActivity_1234'
    const referenceLgText: FieldProcessorAsync<string> = async (fromId, fromAction, toId, toAction, lgFieldName) =>
      createLgTemplate(dialogId, fromAction[lgFieldName], toId, toAction, lgFieldName);

    // LuIntentSection -> 'TextInput_Response_1234'
    const referenceLuIntent: FieldProcessorAsync<any> = async (fromId, fromAction, toId, toAction) => {
      fromAction[luFieldName] && (await createLuIntent(dialogId, fromAction[luFieldName], toId, toAction));
      // during construction, remove the virtual LU field after intents persisted in file
      delete toAction[luFieldName];
    };

    return deepCopyActions(actions, referenceLgText, referenceLuIntent);
  }

  async function copyActions(dialogId: string, actions: BaseSchema[]) {
    // 'SendActivity_1234' -> '- hi'
    const dereferenceLg: FieldProcessorAsync<string> = async (fromId, fromAction, toId, toAction, lgFieldName) =>
      readLgTemplate(dialogId, fromAction[lgFieldName]);

    // 'TextInput_Response_1234' -> LuIntentSection | undefined
    const dereferenceLu: FieldProcessorAsync<any> = async (fromId, fromAction, toId, toAction) => {
      const luValue = readLuIntent(dialogId, fromId, fromAction);
      // during copy, carry the LU data in virtual field
      toAction[luFieldName] = luValue;
      return luValue;
    };

    return deepCopyActions(actions, dereferenceLg, dereferenceLu);
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
    actionsContainLuIntent,
  };
};
