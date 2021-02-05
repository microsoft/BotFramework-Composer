// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useMemo } from 'react';
import pick from 'lodash/pick';
import { ApplicationContext, ApplicationContextApi } from '@botframework-composer/types';

import { validateHookContext } from '../utils/validateHookContext';

import { useStore } from './useStore';

const APPLICATION_KEYS = [
  // type ApplicationContext
  'data.locale',
  'data.hosted',
  'data.userSettings',
  'data.skills',
  'data.skillsSettings',
  'data.flowZoomRate',
  'data.httpClient',

  // type ApplicationContextApi
  'api.navigateTo',
  'api.updateUserSettings',
  'api.announce',
  'api.addCoachMarkRef',
  'api.isFeatureEnabled',
  'api.setApplicationLevelError',
  'api.confirm',
  'api.updateFlowZoomRate',
  'api.telemetryClient',
];

export function useApplicationApi(): ApplicationContext & ApplicationContextApi {
  const shell = useStore();

  const applicationContext = useMemo(() => {
    const ctx = pick(shell, APPLICATION_KEYS);
    return {
      ...ctx.api,
      ...ctx.data,
    } as ApplicationContext & ApplicationContextApi;
  }, [pick(shell, APPLICATION_KEYS)]);

  validateHookContext('application');

  return applicationContext;
}
