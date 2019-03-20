import React from 'react';
import { Router } from '@reach/router';

import { DialogSettings } from './dialog-settings';
import { Services } from './services';
import { ComposerConfiguration } from './composer-configuration/index';
import { PublishingStaging } from './publishing-staging/index';

const Routes = () => (
  <Router>
    <DialogSettings path="dialog-settings" />
    <Services path="services" />
    <ComposerConfiguration path="composer-configuration" />
    <PublishingStaging path="publishing-staging" />
  </Router>
);

export default Routes;
