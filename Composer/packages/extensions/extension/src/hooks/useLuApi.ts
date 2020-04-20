// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useShellApi } from './useShellApi';

/**
 * LU CRUD API
 */
export const useLuApi = () => {
  const { shellApi } = useShellApi();
  const { removeLuIntent, getLuIntent, updateLuIntent } = shellApi;

  const deleteLuIntents = (luFileId: string, luIntents: string[]) => {
    return Promise.all(luIntents.map(intent => removeLuIntent(luFileId, intent)));
  };

  return {
    createLuIntent: updateLuIntent,
    readLuIntent: getLuIntent,
    deleteLuIntent: (luFileId: string, luIntent: string) => deleteLuIntents(luFileId, [luIntent]),
    deleteLuIntents,
  };
};
