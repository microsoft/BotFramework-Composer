// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Router, Redirect } from '@reach/router';

import { ErrorBoundary } from '../../components/ErrorBoundary';
import { BASEPATH } from '../../constants';
import { resolveToBasePath } from '../../utils/fileUtil';

import { DialogSettings } from './dialog-settings';
import { Services } from './services';
import { Deployment } from './deployment';
import { ComposerConfiguration } from './composer-configuration/index';
import { OnboardingSettings } from './onboarding-settings';
import { PublishingStaging } from './publishing-staging/index';
import { RemotePublish } from './remote-publish/index';

const mapNavTo = x => resolveToBasePath(BASEPATH, x);

const Routes = () => (
  <ErrorBoundary>
    <Router basepath={mapNavTo('setting')}>
      <Redirect from="*" to={mapNavTo('setting/dialog-settings')} noThrow />
      <Deployment path="deployment" />
      <DialogSettings path="dialog-settings" />
      <RemotePublish path="remote-publish" />
      <Services path="services" />
      <ComposerConfiguration path="composer-configuration" />
      <OnboardingSettings path="onboarding-settings" />
      <PublishingStaging path="publishing-staging" />
    </Router>
  </ErrorBoundary>
);

export default Routes;
