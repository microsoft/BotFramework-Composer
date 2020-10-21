// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useMemo } from 'react';
import { HttpClient } from '@botframework-composer/types';

import { validateHookContext } from '../utils/validateHookContext';

import { useStore } from './useStore';

export function useHttpClient(): HttpClient {
  const shell = useStore();

  const client = useMemo(() => {
    return shell.data.httpClient;
  }, [shell.data.httpClient]);

  validateHookContext('application');

  return client;
}
