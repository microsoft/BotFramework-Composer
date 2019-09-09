import React from 'react';
import { Router, Redirect } from '@reach/router';

import { ErrorBoundary } from '../../components/ErrorBoundary';
import { BASEPATH } from '../../constants';
import { resolveToBasePath } from '../../utils/fileUtil';

import { DialogSettings } from './dialog-settings';
import { Services } from './services';
import { Deployment } from './deployment';
import { ComposerConfiguration } from './composer-configuration/index';
import { PublishingStaging } from './publishing-staging/index';

const mapNavTo = x => resolveToBasePath(BASEPATH, x);

const Routes = () => (
  <ErrorBoundary>
    <Router basepath={mapNavTo('setting')}>
      <Redirect from="*" to={mapNavTo('setting/dialog-settings')} noThrow />
      <Deployment path="deployment" />
      <DialogSettings path="dialog-settings" />
      <Services path="services" />
      <ComposerConfiguration path="composer-configuration" />
      <PublishingStaging path="publishing-staging" />
    </Router>
  </ErrorBoundary>
);

export default Routes;
