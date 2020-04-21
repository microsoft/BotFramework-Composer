// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LuIntentSection } from '@bfc/shared';

import { useShellApi } from './useShellApi';

/**
 * LU CRUD API
 */
export const useLuApi = () => {
  const { shellApi } = useShellApi();
  const { removeLuIntent, getLuIntent, updateLuIntent } = shellApi;

  const createLuIntent = async (luFildId: string, intentName: string, intent?: LuIntentSection) => {
    await updateLuIntent(luFildId, intentName, intent);
    return undefined;
  };

  const readLuIntent = async (luFileId: string, intentName: string) => {
    return await getLuIntent(luFileId, intentName);
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
