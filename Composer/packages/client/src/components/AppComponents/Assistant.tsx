// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import { Suspense, Fragment } from 'react';
import React from 'react';

import { isElectron } from './../../utils/electronUtil';
import { ServerSettingsState, onboardingState } from './../../recoilModel';

const Onboarding = React.lazy(() => import('./../../Onboarding/Onboarding'));
const AppUpdater = React.lazy(() => import('./../AppUpdater').then((module) => ({ default: module.AppUpdater })));
const DataCollectionDialog = React.lazy(() => import('./../DataCollectionDialog'));

export const Assistant = () => {
  const { telemetry } = useRecoilValue(ServerSettingsState);
  const onboarding = useRecoilValue(onboardingState);
  const renderAppUpdater = isElectron();

  const renderDataCollectionDialog = typeof telemetry?.allowDataCollection === 'undefined';
  const renderOnboarding = !renderDataCollectionDialog && !onboarding.complete;

  return (
    <Fragment>
      <Suspense fallback={<div />}>{renderDataCollectionDialog && <DataCollectionDialog />}</Suspense>
      <Suspense fallback={<div />}>{renderOnboarding && <Onboarding />}</Suspense>
      <Suspense fallback={<div />}>{renderAppUpdater && <AppUpdater />}</Suspense>
    </Fragment>
  );
};
