// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LuIntentSection, BaseSchema, LuMetaData, LuType } from '@bfc/shared';

import { useShellApi } from './useShellApi';

/**
 * LU CRUD API
 */
export const useLuApi = () => {
  const { shellApi } = useShellApi();
  const { removeLuIntent, getLuIntent, updateLuIntent } = shellApi;

  const createLuIntent = async (
    luFildId: string,
    intent: LuIntentSection | undefined,
    hostResourceId: string,
    hostResourceData: BaseSchema
  ) => {
    const newLuIntentType = new LuType(hostResourceData.$kind).toString();
    const newLuIntentName = new LuMetaData(newLuIntentType, hostResourceId).toString();
    await updateLuIntent(luFildId, newLuIntentName, intent);
    return newLuIntentName;
  };

  const readLuIntent = (luFileId: string, hostResourceId: string, hostResourceData: BaseSchema) => {
    const relatedLuIntentType = new LuType(hostResourceData.$kind).toString();
    const relatedLuIntentName = new LuMetaData(relatedLuIntentType, hostResourceId).toString();
    return getLuIntent(luFileId, relatedLuIntentName);
  };

  const deleteLuIntents = (luFileId: string, luIntents: string[]) => {
    return Promise.all(luIntents.map(intent => removeLuIntent(luFileId, intent)));
  };

  return {
    createLuIntent,
    readLuIntent,
    deleteLuIntent: (luFileId: string, luIntent: string) => deleteLuIntents(luFileId, [luIntent]),
    deleteLuIntents,
  };
};
