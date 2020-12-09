// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import { Suspense, Fragment } from 'react';
import React from 'react';

import { isElectron } from './../../utils/electronUtil';
import { appUpdateState, userSettingsState, onboardingState } from './../../recoilModel';

const Onboarding = React.lazy(() => import('./../../Onboarding/Onboarding'));
const AppUpdater = React.lazy(() => import('./../AppUpdater').then((module) => ({ default: module.AppUpdater })));
const DataCollectionDialog = React.lazy(() => import('./../DataCollectionDialog'));

export const Assistant = () => {
  const { telemetry } = useRecoilValue(userSettingsState);
  const onboarding = useRecoilValue(onboardingState);
  const { showing: appUpdaterDialogShowing } = useRecoilValue(appUpdateState);

  const renderDataCollectionDialog =
    isElectron() && !appUpdaterDialogShowing && typeof telemetry.allowDataCollection === 'undefined';
  const renderOnboarding = !renderDataCollectionDialog && !appUpdaterDialogShowing && !onboarding.complete;
  const renderAppUpdater = isElectron();

  return (
    <Fragment>
      <Suspense fallback={<div />}>{renderDataCollectionDialog && <DataCollectionDialog />}</Suspense>
      <Suspense fallback={<div />}>{renderOnboarding && <Onboarding />}</Suspense>
      <Suspense fallback={<div />}>{renderAppUpdater && <AppUpdater />}</Suspense>
    </Fragment>
  );
};
