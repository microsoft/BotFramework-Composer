// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LuMetaData, LuType } from '@bfc/shared';
import { LuIntentSection, BaseSchema, ShellApi } from '@bfc/types';

/**
 * LU CRUD API
 */
export const useLuApi = (shellApi: ShellApi) => {
  const { addLuIntent, removeLuIntent, getLuIntent } = shellApi;

  const createLuIntent = async (
    luFildId: string,
    intent: LuIntentSection | undefined,
    hostResourceId: string,
    hostResourceData: BaseSchema
  ) => {
    if (!intent) return;

    const newLuIntentType = new LuType(hostResourceData.$kind).toString();
    const newLuIntentName = new LuMetaData(newLuIntentType, hostResourceId).toString();
    const newLuIntent: LuIntentSection = { ...intent, Name: newLuIntentName };
    await addLuIntent(luFildId, newLuIntentName, newLuIntent);
    return newLuIntentName;
  };

  const readLuIntent = (luFileId: string, hostResourceId: string, hostResourceData: BaseSchema) => {
    const relatedLuIntentType = new LuType(hostResourceData.$kind).toString();
    const relatedLuIntentName = new LuMetaData(relatedLuIntentType, hostResourceId).toString();
    return getLuIntent(luFileId, relatedLuIntentName);
  };

  const deleteLuIntents = (luFileId: string, luIntents: string[]) => {
    return Promise.all(luIntents.map((intent) => removeLuIntent(luFileId, intent)));
  };

  return {
    createLuIntent,
    readLuIntent,
    deleteLuIntent: (luFileId: string, luIntent: string) => deleteLuIntents(luFileId, [luIntent]),
    deleteLuIntents,
  };
};
