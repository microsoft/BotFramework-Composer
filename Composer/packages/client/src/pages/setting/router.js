import React from 'react';
import { Router, Redirect } from '@reach/router';

import { DialogSettings } from './dialog-settings';
import { Services } from './services';
import { ComposerConfiguration } from './composer-configuration/index';
import { PublishingStaging } from './publishing-staging/index';

const Routes = () => (
  <Router basepath="setting">
    <Redirect from="*" to="setting/dialog-settings" noThrow />
    <DialogSettings path="dialog-settings" />
    <Services path="services" />
    <ComposerConfiguration path="composer-configuration" />
    <PublishingStaging path="publishing-staging" />
  </Router>
);

export default Routes;
