// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useMemo } from 'react';
import pick from 'lodash/pick';
import { LgContextApi } from '@botframework-composer/types';

import { validateHookContext } from '../utils/validateHookContext';

import { useStore } from './useStore';

const LG_KEYS = [
  // type LgContextApi
  'api.getLgTemplates',
  'api.copyLgTemplate',
  'api.addLgTemplate',
  'api.updateLgFile',
  'api.updateLgTemplate',
  'api.debouncedUpdateLgTemplate',
  'api.removeLgTemplate',
  'api.removeLgTemplates',
];

export function useLgApi(): LgContextApi {
  const shell = useStore();

  const lgContext = useMemo(() => {
    const ctx = pick(shell, LG_KEYS);
    return {
      ...ctx.api,
    } as LgContextApi;
  }, [pick(shell, LG_KEYS)]);

  validateHookContext('lg');

  return lgContext;
}
