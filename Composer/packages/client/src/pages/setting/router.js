// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useContext } from 'react';
import { Router, Redirect } from '@reach/router';

import { StoreContext } from '../../store';
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
import { Publisher } from './publisher/index';

const mapNavTo = x => resolveToBasePath(BASEPATH, x);

const Routes = () => {
  const { state } = useContext(StoreContext);

  return (
    <ErrorBoundary>
      <Router basepath={mapNavTo(`/bot/${state.projectId}/setting`)}>
        <Redirect from="*" to={mapNavTo(`/bot/${state.projectId}/setting/dialog-settings`)} noThrow />
        <Deployment path="deployment" />
        <DialogSettings path="dialog-settings" />
        <RemotePublish path="remote-publish" />
        <Publisher path="publish" />
        <Services path="services" />
        <ComposerConfiguration path="composer-configuration" />
        <OnboardingSettings path="onboarding-settings" />
        <PublishingStaging path="publishing-staging" />
      </Router>
    </ErrorBoundary>
  );
};

export default Routes;
