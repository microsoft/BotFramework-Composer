// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LuIntentSection, BaseSchema, LuMetaData, LuType, ShellApi } from '@bfc/shared';

/**
 * LU CRUD API
 */
export const useLuApi = (shellApi: ShellApi) => {
  const { addLuIntent, removeLuIntent, getLuIntent } = shellApi;

  const createLuIntent = (
    luFildId: string,
    intent: LuIntentSection | undefined,
    hostResourceId: string,
    hostResourceData: BaseSchema
  ) => {
    if (!intent) return;

    const newLuIntentType = new LuType(hostResourceData.$kind).toString();
    const newLuIntentName = new LuMetaData(newLuIntentType, hostResourceId).toString();
    const newLuIntent: LuIntentSection = { ...intent, Name: newLuIntentName };
    addLuIntent(luFildId, newLuIntentName, newLuIntent);
    return newLuIntentName;
  };

  const readLuIntent = (luFileId: string, hostResourceId: string, hostResourceData: BaseSchema) => {
    const relatedLuIntentType = new LuType(hostResourceData.$kind).toString();
    const relatedLuIntentName = new LuMetaData(relatedLuIntentType, hostResourceId).toString();
    return getLuIntent(luFileId, relatedLuIntentName);
  };

  const deleteLuIntents = (luFileId: string, luIntents: string[]) => {
    return luIntents.map((intent) => removeLuIntent(luFileId, intent));
  };

  return {
    createLuIntent,
    readLuIntent,
    deleteLuIntent: (luFileId: string, luIntent: string) => deleteLuIntents(luFileId, [luIntent]),
    deleteLuIntents,
  };
};
