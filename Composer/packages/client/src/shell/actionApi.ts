// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  deepCopyActions,
  deleteActions as destructActions,
  FieldProcessorAsync,
  LgTemplateRef,
  LuMetaData,
  LuType,
  walkAdaptiveActionList,
} from '@bfc/shared';
import { LuIntentSection, MicrosoftIDialog } from '@botframework-composer/types';

import TelemetryClient from '../telemetry/TelemetryClient';

import { useLgApi } from './lgApi';
import { useLuApi } from './luApi';
import { deserializeLgTemplate, serializeLgTemplate } from './utils';

export const useActionApi = (projectId: string) => {
  const { getLgTemplates, removeLgTemplates, addLgTemplate } = useLgApi(projectId);
  const { addLuIntent, getLuIntent, removeLuIntent } = useLuApi(projectId);

  const luFieldName = '_lu';

  function actionsContainLuIntent(actions: MicrosoftIDialog[]): boolean {
    let containLuIntents = false;
    walkAdaptiveActionList(actions, (action) => {
      if (action[luFieldName]) {
        containLuIntents = true;
      }
    });
    return containLuIntents;
  }

  const createLgTemplate = async (
    lgFileId: string,
    toId: string,
    lgText: string,
    hostActionData: MicrosoftIDialog,
    hostFieldName: string
  ): Promise<string> => {
    if (!lgText) return '';
    return await deserializeLgTemplate(lgFileId, toId, lgText, hostActionData, hostFieldName, addLgTemplate);
  };

  const readLgTemplate = (lgText: string, fromId: string) => {
    if (!lgText) return '';

    const inputLgRef = LgTemplateRef.parse(lgText);
    if (!inputLgRef) return lgText;

    const lgTemplates = getLgTemplates(inputLgRef.name);
    if (!Array.isArray(lgTemplates) || !lgTemplates.length) return lgText;

    const serializedLg = serializeLgTemplate(inputLgRef.name, fromId, lgText, lgTemplates);

    return serializedLg;
  };

  const createLuIntent = async (
    luFileId: string,
    intent: LuIntentSection | undefined,
    hostResourceId: string,
    hostResourceData: MicrosoftIDialog
  ) => {
    if (!intent) return;

    const newLuIntentType = new LuType(hostResourceData.$kind).toString();
    const newLuIntentName = new LuMetaData(newLuIntentType, hostResourceId).toString();
    const newLuIntent: LuIntentSection = { ...intent, Name: newLuIntentName };
    await addLuIntent(luFileId, newLuIntentName, newLuIntent);
    return newLuIntentName;
  };

  const readLuIntent = (luFileId: string, hostResourceId: string, hostResourceData: MicrosoftIDialog) => {
    const relatedLuIntentType = new LuType(hostResourceData.$kind).toString();
    const relatedLuIntentName = new LuMetaData(relatedLuIntentType, hostResourceId).toString();
    return getLuIntent(luFileId, relatedLuIntentName);
  };

  async function constructActions(dialogId: string, actions: MicrosoftIDialog[]) {
    actions.forEach(({ $kind }) => {
      TelemetryClient.track('ActionAdded', { type: $kind });
    });
    // '- hi' -> 'SendActivity_1234'
    const referenceLgText: FieldProcessorAsync<string> = async (fromId, fromAction, toId, toAction, lgFieldName) =>
      createLgTemplate(dialogId, toId, fromAction[lgFieldName] as string, toAction, lgFieldName);

    // LuIntentSection -> 'TextInput_Response_1234'
    const referenceLuIntent: FieldProcessorAsync<any> = async (fromId, fromAction, toId, toAction) => {
      fromAction[luFieldName] &&
        (await createLuIntent(dialogId, fromAction[luFieldName] as LuIntentSection, toId, toAction));
      // during construction, remove the virtual LU field after intents persisted in file
      delete toAction[luFieldName];
    };

    return deepCopyActions(actions, referenceLgText, referenceLuIntent);
  }

  async function copyActions(dialogId: string, actions: MicrosoftIDialog[]) {
    // 'SendActivity_1234' -> '- hi'
    const dereferenceLg: FieldProcessorAsync<string> = async (fromId, fromAction, toId, toAction, lgFieldName) =>
      readLgTemplate(fromAction[lgFieldName] as string, fromId);

    // 'TextInput_Response_1234' -> LuIntentSection | undefined
    const dereferenceLu: FieldProcessorAsync<any> = async (fromId, fromAction, toId, toAction) => {
      const luValue = readLuIntent(dialogId, fromId, fromAction);
      // during copy, carry the LU data in virtual field
      toAction[luFieldName] = luValue;
      return luValue;
    };

    return deepCopyActions(actions, dereferenceLg, dereferenceLu);
  }

  async function constructAction(dialogId: string, action: MicrosoftIDialog) {
    const [newAction] = await constructActions(dialogId, [action]);
    return newAction;
  }

  async function copyAction(dialogId: string, action: MicrosoftIDialog) {
    const [copiedAction] = await copyActions(dialogId, [action]);
    return copiedAction;
  }

  async function deleteActions(dialogId: string, actions: MicrosoftIDialog[]) {
    actions.forEach(({ $kind }) => {
      TelemetryClient.track('ActionDeleted', { type: $kind });
    });
    return destructActions(
      actions,
      (templates: string[]) => removeLgTemplates(dialogId, templates),
      (luIntents: string[]) => Promise.all(luIntents.map((intent) => removeLuIntent(dialogId, intent)))
    );
  }

  async function deleteAction(dialogId: string, action: MicrosoftIDialog) {
    return deleteActions(dialogId, [action]);
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
