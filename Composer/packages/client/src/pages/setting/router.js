import React from 'react';
import { Router, Redirect } from '@reach/router';

import { BASEPATH } from '../../constants';
import { resolveToBasePath } from '../../utils/fileUtil';

import { DialogSettings } from './dialog-settings';
import { Services } from './services';
import { ComposerConfiguration } from './composer-configuration/index';
import { PublishingStaging } from './publishing-staging/index';

const mapNavTo = x => resolveToBasePath(BASEPATH, x);

const Routes = () => (
  <Router basepath={mapNavTo('setting')}>
    <Redirect from="*" to={mapNavTo('setting/dialog-settings')} noThrow />
    <DialogSettings path="dialog-settings" />
    <Services path="services" />
    <ComposerConfiguration path="composer-configuration" />
    <PublishingStaging path="publishing-staging" />
  </Router>
);

export default Routes;
