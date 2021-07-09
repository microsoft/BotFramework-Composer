// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useMemo } from 'react';
import pick from 'lodash/pick';
import { AuthContext, AuthContextApi } from '@botframework-composer/types';

import { validateHookContext } from '../utils/validateHookContext';

import { useStore } from './useStore';

const AUTH_KEYS = [
  // type AuthContext
  'data.currentUser',
  'data.isAuthenticated',
  'data.currentTenant',
  'data.showAuthDialog',

  // type AuthContexApi
  'api.requireUserLogin',
];

export function useAuthApi(): AuthContext & AuthContextApi {
  const shell = useStore();

  const authContext = useMemo(() => {
    const ctx = pick(shell, AUTH_KEYS);
    return {
      ...ctx.api,
      ...ctx.data,
    } as AuthContext & AuthContextApi;
  }, [pick(shell, AUTH_KEYS)]);

  validateHookContext('auth');

  return authContext;
}
