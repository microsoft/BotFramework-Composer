// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useMemo } from 'react';
import pick from 'lodash/pick';
import { LuContextApi } from '@botframework-composer/types';

import { validateHookContext } from '../utils/validateHookContext';

import { useStore } from './useStore';

const LU_KEYS = [
  // type LuContextApi
  'api.getLuIntent',
  'api.getLuIntents',
  'api.addLuIntent',
  'api.updateLuFile',
  'api.updateLuIntent',
  'api.debouncedUpdateLuIntent',
  'api.renameLuIntent',
  'api.removeLuIntent',
];

export function useLuApi(): LuContextApi {
  const shell = useStore();

  const luContext = useMemo(() => {
    const ctx = pick(shell, LU_KEYS);
    return {
      ...ctx.api,
    } as LuContextApi;
  }, [pick(shell, LU_KEYS)]);

  validateHookContext('lu');

  return luContext;
}
