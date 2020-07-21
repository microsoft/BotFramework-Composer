// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import { Suspense, Fragment } from 'react';
import React from 'react';

import { isElectron } from './../../utils/electronUtil';
import { onboardingState } from './../../recoilModel';

const Onboarding = React.lazy(() => import('./../../Onboarding/Onboarding'));
const AppUpdater = React.lazy(() => import('./../AppUpdater').then((module) => ({ default: module.AppUpdater })));

export const Assistant = () => {
  const onboarding = useRecoilValue(onboardingState);
  const renderAppUpdater = isElectron();
  return (
    <Fragment>
      <Suspense fallback={<div />}>{!onboarding.complete && <Onboarding />}</Suspense>
      <Suspense fallback={<div />}>{renderAppUpdater && <AppUpdater />}</Suspense>
    </Fragment>
  );
};
